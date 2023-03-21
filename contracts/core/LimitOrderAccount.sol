// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v2;

/* solhint-disable avoid-low-level-calls */
/* solhint-disable no-inline-assembly */
/* solhint-disable reason-string */

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@account-abstraction/contracts/core/BaseAccount.sol";
import "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import "./ILimitOrderFiller.sol";

/**
 * limit order account.
 *  this account is based on: https://github.com/eth-infinitism/account-abstraction/blob/develop/contracts/samples/SimpleAccount.sol
 *  with added functions for the owner to create limit orders that others can fill ala flashloans
 */
contract LimitOrderAccount is
    BaseAccount,
    UUPSUpgradeable,
    // Initializable,
    ReentrancyGuardUpgradeable
{
    using ECDSA for bytes32;
    using SafeMath for uint256;

    uint96 private _nonce;
    address public owner;
    uint256 private orderIdCounter;
    IEntryPoint private immutable _entryPoint;

    struct LimitOrder {
        address tokenOut;
        address tokenIn;
        //timestamp of order expiry. set to 0 to cancel or mark order as filled
        uint256 expiry;
        uint256 orderAmount;
        uint256 filledAmount;
        // amount of tokenIn per tokenOut scaled by 1e9
        uint256 rate;
    }

    //maps order id to limitOrder
    mapping(uint256 => LimitOrder) public limitOrders;

    event SimpleAccountInitialized(
        IEntryPoint indexed entryPoint,
        address indexed owner
    );

    event UpdateLimitOrder(
        address indexed tokenOut,
        address indexed tokenIn,
        uint256 indexed expiry,
        uint256 id,
        uint256 orderAmount,
        uint256 filledAmount,
        uint256 rate
    );

    modifier onlyOwner() {
        _onlyOwner();
        _;
    }

    /// @inheritdoc BaseAccount
    function nonce() public view virtual override returns (uint256) {
        return _nonce;
    }

    /// @inheritdoc BaseAccount
    function entryPoint() public view virtual override returns (IEntryPoint) {
        return _entryPoint;
    }

    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}

    constructor(IEntryPoint anEntryPoint) {
        _entryPoint = anEntryPoint;
        _disableInitializers();
    }

    function _onlyOwner() internal view {
        //directly from EOA owner, or through the account itself (which gets redirected through execute())
        require(
            msg.sender == owner || msg.sender == address(this),
            "only owner"
        );
    }

    /**
     * execute a transaction (called directly from owner, or by entryPoint)
     */
    function execute(
        address dest,
        uint256 value,
        bytes calldata func
    ) external {
        _requireFromEntryPointOrOwner();
        _call(dest, value, func);
    }

    /**
     * execute a sequence of transactions
     */
    function executeBatch(
        address[] calldata dest,
        bytes[] calldata func
    ) external {
        _requireFromEntryPointOrOwner();
        require(dest.length == func.length, "wrong array lengths");
        for (uint256 i = 0; i < dest.length; i++) {
            _call(dest[i], 0, func[i]);
        }
    }

    /**
     * create a new limit order
     */
    function createLimitOrder(
        address _tokenOut,
        address _tokenIn,
        uint256 _expiry,
        uint256 _orderAmount,
        uint256 _rate
    ) external {
        _requireFromEntryPointOrOwner();

        limitOrders[orderIdCounter] = LimitOrder(
            _tokenOut,
            _tokenIn,
            _expiry,
            _orderAmount,
            0,
            _rate
        );

        emit UpdateLimitOrder(
            _tokenOut,
            _tokenIn,
            _expiry,
            orderIdCounter,
            _orderAmount,
            0,
            _rate
        );
        orderIdCounter++;
    }

    /**
     * cancel an existing limit order
     */
    function cancelLimitOrder(uint256 _id) external {
        _requireFromEntryPointOrOwner();

        LimitOrder storage limitOrder = limitOrders[_id];
        limitOrder.expiry = 0;

        emit UpdateLimitOrder(
            limitOrder.tokenOut,
            limitOrder.tokenIn,
            limitOrder.expiry,
            _id,
            limitOrder.orderAmount,
            limitOrder.filledAmount,
            limitOrder.rate
        );
    }

    /**
     * allows anyone to fill an existing limit order. similar to Aave's flashloan function
     */
    function fillLimitOrder(
        uint256 _id,
        address _filler,
        uint256 _fillAmount,
        bytes memory _params
    ) external nonReentrant {
        //verfiy fillOrder parameters
        LimitOrder storage order = limitOrders[_id];
        require(order.expiry > block.timestamp, "order is not valid");
        require(
            order.orderAmount - order.filledAmount >= _fillAmount,
            "_fillAmount too large"
        );

        //require account has sufficient balance
        uint256 tokenOutBalance;
        if(tokenOut == address(0)) {
            tokenOutBalance = address(this).balance;
        } else {
            tokenOutBalance = IERC20(order.tokenOut).balanceOf(
                address(this)
            );
        }
        require(tokenOutBalance >= _fillAmount, "insufficient account funds");

        //store tokenIn balance for checking later
        uint256 tokenInBalanceBefore;
        if(tokenIn == address(0)) {
            tokenInBalance = address(this).balance;
        } else {
            tokenInBalance = IERC20(order.tokenIn).balanceOf(
                address(this)
            );
        }
         
        //calculate required amount of tokenIn to receive
        uint256 amountIn = _fillAmount.mul(order.rate).div(1e9);

        //update order state
        order.filledAmount += _fillAmount;
        //if order is full, set expiry to 0 to close order
        if (order.filledAmount >= order.orderAmount) order.expiry = 0;

        //transfer _fillAmount of tokenOut to _filler
        if(tokenOut == address(0)) {
            _filler.call{value:_fillAmount}();
        } else {
            IERC20(order.tokenOut).transfer(_filler, _fillAmount);
        }
        

        //call _filler's callback
        ILimitOrderFiller(_filler).executeOperation(
            _id,
            order.tokenIn,
            amountIn,
            _params
        );

        //require balance of tokenIn has increased by amountIn
        uint256 tokenInBalanceAfter;
        if(tokenIn == address(0)) {
            tokenInBalanceAfter = address(this).balance;
        } else {
            tokenInBalanceAfter = IERC20(order.tokenIn).balanceOf(
                address(this)
            );
        }
        require(
            tokenInBalanceAfter >= tokenInBalanceBefore.add(amountIn),
            "insufficient tokenIn received"
        );

        emit UpdateLimitOrder(
            order.tokenOut,
            order.tokenIn,
            order.expiry,
            _id,
            order.orderAmount,
            order.filledAmount,
            order.rate
        );
    }

    /**
     * @dev The _entryPoint member is immutable, to reduce gas consumption.  To upgrade EntryPoint,
     * a new implementation of SimpleAccount must be deployed with the new EntryPoint address, then upgrading
     * the implementation by calling `upgradeTo()`
     */
    function initialize(address anOwner) public virtual initializer {
        _initialize(anOwner);
    }

    function _initialize(address anOwner) internal virtual {
        owner = anOwner;
        orderIdCounter = 1;
        emit SimpleAccountInitialized(_entryPoint, owner);
    }

    // Require the function call went through EntryPoint or owner
    function _requireFromEntryPointOwnerOrThis() internal view {
        require(
            msg.sender == address(entryPoint()) || msg.sender == owner || msg.sender == address(this),
            "account: not Owner or EntryPoint"
        );
    }

    /// implement template method of BaseAccount
    function _validateAndUpdateNonce(
        UserOperation calldata userOp
    ) internal override {
        require(_nonce++ == userOp.nonce, "account: invalid nonce");
    }

    /// implement template method of BaseAccount
    function _validateSignature(
        UserOperation calldata userOp,
        bytes32 userOpHash
    ) internal virtual override returns (uint256 validationData) {
        bytes32 hash = userOpHash.toEthSignedMessageHash();
        if (owner != hash.recover(userOp.signature))
            return SIG_VALIDATION_FAILED;
        return 0;
    }

    function _call(address target, uint256 value, bytes memory data) internal {
        (bool success, bytes memory result) = target.call{value: value}(data);
        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
    }

    /**
     * check current account deposit in the entryPoint
     */
    function getDeposit() public view returns (uint256) {
        return entryPoint().balanceOf(address(this));
    }

    /**
     * deposit more funds for this account in the entryPoint
     */
    function addDeposit() public payable {
        entryPoint().depositTo{value: msg.value}(address(this));
    }

    /**
     * withdraw value from the account's deposit
     * @param withdrawAddress target to send to
     * @param amount to withdraw
     */
    function withdrawDepositTo(
        address payable withdrawAddress,
        uint256 amount
    ) public onlyOwner {
        entryPoint().withdrawTo(withdrawAddress, amount);
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal view override {
        (newImplementation);
        _onlyOwner();
    }
}