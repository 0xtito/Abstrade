// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../core/ILimitOrderFiller.sol";
import "../core/LimitOrderAccount.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SampleFiller is ILimitOrderFiller{

    function fillOrder(address _orderer, uint _orderId, uint _amount) public {
        LimitOrderAccount(payable(_orderer)).fillLimitOrder(_orderId, payable(address(this)), _amount, "0x");
    }
    function executeOperation(uint256 _orderId , address tokenIn, uint _amountIn, bytes memory _params) external {
        //optional swapping & arbitrage stuff

        //transfer funds back to LimitOrderAccount
        if(tokenIn == address(0)) {
            (bool success, bytes memory data) = payable(msg.sender).call{value: _amountIn}('');
            require(success);
        } else {
            IERC20(tokenIn).transfer(msg.sender, _amountIn);
        }
    }
    receive() external payable {
    }
}