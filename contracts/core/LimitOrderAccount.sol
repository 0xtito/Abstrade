// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v2;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ILimitOrderFiller.sol";
// import "../eth-Infinitism-AA/samples/SimpleAccount.sol";

// TODO inherit from 4337 simple account
contract LimitOrderAccount is ReentrancyGuard {
    using SafeMath for uint256;

    event UpdateLimitOrder(
        address indexed tokenOut,
        address indexed tokenIn,
        uint256 indexed expiry,
        uint256 id,
        uint256 amountOut,
        uint256 rate
    );

    struct LimitOrder {
        address tokenOut;
        address tokenIn;
        //timestamp of order expiry. set to 0 to close order
        uint256 expiry;
        uint256 id;
        uint256 amountOut;
        // amount of tokenIn per tokenOut scaled by 10^6
        uint256 rate;
    }

    uint256 public idCounter = 1;
    mapping(uint256 => LimitOrder) public limitOrders;

    // takes array of limit orders, updates state and emits event
    // if _id = 0, new order will be created, if _id matches an existing order

    // TODO gate to owner
    // TODO move this function to logic contract to be delegate called by SCW
    // take in array of limit orders? No, leave single and send array of calls as SCW
    function updateLimitOrders(
        address _tokenOut,
        address _tokenIn,
        uint256 _expiry,
        uint256 _id,
        uint256 _amountOut,
        uint256 _rate
    ) external {
        if(_id == 0){
            //create new limit order and increment counter
            _id = idCounter;
            idCounter++;
        } 
        require (limitOrders[_id].id != 0, "invalid _id");

        limitOrders[_id] = LimitOrder(
            _tokenOut,
            _tokenIn,
            _expiry,
            _id,
            _amountOut,
            _rate
        );
        
        emit UpdateLimitOrder(
            _tokenOut,
            _tokenIn,
            _expiry,
            _id,
            _amountOut,
            _rate
        );
    }

    // external smart contract calls this function to fill this contracts limit order. 
    // similar to flashLoan() of Aave's LendingPool.sol. Allows full or partial fill.
    function fillLimitOrder(
        uint256 _orderId,
        address _filler,
        uint256 _fillAmount,
        bytes memory _params
    ) external nonReentrant {
        //verfiy fillOrder parameters
        LimitOrder storage order = limitOrders[_orderId];
        require(limitOrders[_orderId].id > 0, "_orderId does not exist");
        require(order.expiry > block.timestamp, "order is expired");
        require(order.amountOut >= _fillAmount, "_fillAmount greater than order");

        //require account has sufficient balance
        uint256 tokenOutBalance = IERC20(order.tokenOut).balanceOf(
            address(this)
        );
        require(tokenOutBalance >= _fillAmount, "insufficient account funds");

        //store tokenIn balance for checking later
        uint256 tokenInBalanceBefore = IERC20(order.tokenIn).balanceOf(
            address(this)
        );
        //calculate required amount of tokenIn to receive
        uint256 amountIn = _fillAmount.mul(order.rate).div(1e6);

        //update order state
        order.amountOut -= _fillAmount;
        //if order is full, set expiry to 0 to close order
        if(order.amountOut == 0) order.expiry = 0;

        //transfer OrderAmounts.amountOut of tokenOut to receiver
        IERC20(order.tokenOut).transfer(_filler, _fillAmount);

        //call filler's callback
        ILimitOrderFiller(_filler).executeOperation(
            _orderId,
            order.tokenIn,
            amountIn,
            _params
        );

        //require balance of tokenIn has increased by minimumAmountIn
        uint256 tokenInBalanceAfter = IERC20(order.tokenIn).balanceOf(
            address(this)
        );
        require(
            tokenInBalanceAfter >= tokenInBalanceBefore.add(amountIn),
            "insufficient tokenIn received"
        );

        emit UpdateLimitOrder(
            order.tokenOut,
            order.tokenIn,
            order.expiry,
            order.id,
            order.amountOut,
            order.rate
        );
    }
}
