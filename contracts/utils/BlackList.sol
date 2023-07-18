// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./Ownable.sol";

contract BlackList is Ownable {
    address private _pairAddress;
    mapping(address => bool) private isBlackListed;

    /**
     * @dev Throws if called by blocked account
     */
    modifier onlyNotBlocked(address _address) {
        _checkBlackListStatus(_address);
        _;
    }

    /**
     * @dev Throws if the sender is not blocked.
     */
    function _checkBlackListStatus(address _address) internal view virtual {
        require(!isBlackListed[_address], "Blocked");
    }

    /**
     * check if the address is blacklisted
     */
    function getBlackListStatus(address _address) public view virtual returns (bool) {
        return isBlackListed[_address];
    }

    /**
     * adding the address to the black list
     */
    function addBlackList(address _address) public onlyOwner {
        isBlackListed[_address] = true;
        emit AddedBlackList(_address);
    }

    /**
     * removing the address to the black list
     */
    function removeBlackList(address _address) public onlyOwner {
        isBlackListed[_address] = false;
        emit RemovedBlackList(_address);
    }

    event AddedBlackList(address _address);

    event RemovedBlackList(address _address);
}
