// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FractionalOwnership {
    uint256 public totalShares = 100;
    uint256 public pricePerShare = 0.01 ether;
    mapping(address => uint256) public sharesOwned;
    uint256 public sharesSold;

    event SharePurchased(address buyer, uint256 numShares, uint256 totalSold);

    function buyShare(uint256 _numShares) public payable {
        require(_numShares > 0, "Invalid amount");
        require(sharesSold + _numShares <= totalShares, "Not enough shares");
        require(msg.value == _numShares * pricePerShare, "Incorrect ETH");

        sharesOwned[msg.sender] += _numShares;
        sharesSold += _numShares;

        emit SharePurchased(msg.sender, _numShares, sharesSold);
    }

    function getMyShares() public view returns (uint256) {
        return sharesOwned[msg.sender];
    }
}
