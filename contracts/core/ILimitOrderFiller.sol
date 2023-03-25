// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ILimitOrderFiller {
    function executeOperation(uint256 _orderId, address _tokenIn, uint _amountIn, bytes memory _params) external;
    receive() external payable;
}