// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v2;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ILimitOrderFiller.sol";

contract LimitOrderSCW is ReentrancyGuard {
    using SafeMath for uint256;

    event NewLimitOrder(
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
    function createOrder(
        address _tokenOut,
        address _tokenIn,
        uint256 _expiry,
        uint256 _amountOut,
        uint256 _rate
    ) external {
        limitOrders[idCounter] = LimitOrder(
            _tokenOut,
            _tokenIn,
            _expiry,
            idCounter,
            _amountOut,
            _rate
        );
        idCounter++;
        emit NewLimitOrder(
            _tokenOut,
            _tokenIn,
            _expiry,
            idCounter,
            _amountOut,
            _rate
        );
    }

    // similar to flashLoan() of Aave's LendingPool.sol. Allows full or partial fill
    function fillLimitOrder(
        uint256 _orderId,
        address _filler,
        uint256 _amountOut,
        bytes memory _params
    ) external nonReentrant {
        //verfiy fillOrder parameters
        LimitOrder storage order = limitOrders[_orderId];
        require(limitOrders[_orderId].id > 0, "_orderId does not exist");
        require(order.expiry > block.timestamp, "order is expired");
        require(order.amountOut >= _amountOut, "_amountOut greater than order");

        //require account has sufficient balance
        uint256 tokenOutBalance = IERC20(order.tokenOut).balanceOf(
            address(this)
        );
        require(tokenOutBalance >= _amountOut, "insufficient account funds");

        //calculate required amount of tokenIn to receive
        uint256 tokenInBalanceBefore = IERC20(order.tokenIn).balanceOf(
            address(this)
        );
        uint256 amountIn = _amountOut.mul(order.rate).div(1e18);

        //update order state
        if (order.amountOut == _amountOut) {
            //close order
            order.expiry = 1;
            order.amountOut = 0;
        } else {
            order.amountOut -= _amountOut;
        }

        //transfer OrderAmounts.amountOut of tokenOut to receiver
        IERC20(order.tokenOut).transfer(_filler, _amountOut);

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

        emit NewLimitOrder(
            order.tokenOut,
            order.tokenIn,
            order.expiry,
            order.id,
            order.amountOut,
            order.rate
        );
    }
}
