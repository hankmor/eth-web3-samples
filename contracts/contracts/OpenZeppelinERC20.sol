// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyERC20 is ERC20 {
    constructor(uint256 initialSupply) ERC20("HANK TOKEN", "HMT") {
        _mint(msg.sender, initialSupply);
    }

    // Override the decimals function to return 8
    function decimals() public view virtual override returns (uint8) {
        return 8;
    }
}
