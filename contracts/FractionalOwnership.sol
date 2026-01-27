// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FractionalOwnership is ERC20, Ownable {
    uint256 public totalShares = 100;
    uint256 public pricePerShare = 0.01 ether;
    mapping(address => uint256) public sharesOwned;
    uint256 public sharesSold;

    event SharePurchased(address buyer, uint256 numShares, uint256 totalSold);

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _mint(msg.sender, initialSupply);
    }

    function buyShare(uint256 _numShares) public payable {
      

        sharesOwned[msg.sender] += _numShares;
        sharesSold += _numShares;

        _transfer(owner(), msg.sender, _numShares * (10 ** decimals())); // Send ERC20 tokens

        emit SharePurchased(msg.sender, _numShares, sharesSold);
    }

    function getMyShares() public view returns (uint256) {
        return sharesOwned[msg.sender];
    }
}
