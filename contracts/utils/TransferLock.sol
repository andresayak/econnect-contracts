// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./Ownable.sol";
//import "hardhat/console.sol";

contract TransferLock is Ownable {
    mapping(address => uint) private lastTransfers;

    /**
     * @dev Throws if called by blocked account
     */
    modifier onlyNotLocked(address _from, address _to) {
        _checkLockStatus(_from, _to);
        _;
    }

    /**
     * @dev Throws if the sender is not locked.
     */
    function _checkLockStatus(address _from, address _to) internal virtual {
        require(_applyProtection(_from), "Locked");
        if (lastTransfers[_to] == uint(0)) {
            lastTransfers[_to] = block.number;
        }
    }

    /**
     * checking and blocking frontrunners
     */
    function _applyProtection(
        address _sender
    ) internal returns (bool) {
        if (lastTransfers[_sender] == uint(0)) {
            return true;
        }
        if (block.number - lastTransfers[_sender] > 2) {
            lastTransfers[_sender] = 0;
            return true;
        }
        return false;
    }
}
