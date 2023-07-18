// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./ERC20.sol";
import "./interfaces/IERC20.sol";
import "./utils/BlackList.sol";
import "./utils/TransferLock.sol";
import "./utils/Ownable.sol";
import "./utils/BasicMetaTransaction.sol";

contract EConnectGov is ERC20, Ownable, BlackList, TransferLock, BasicMetaTransaction  {
    constructor(string memory name_, string memory symbol_, uint256 _totalSupply) ERC20(name_, symbol_) {
        _mint(_msgSender(), _totalSupply);
    }

    function _msgSender() internal view override(Context, BasicMetaTransaction) returns (address) {
        return BasicMetaTransaction._msgSender();
    }

    /**
     * Token transfer function from the contract address;
     */
    function recoverTokens(address _token, address _to, uint _value) public onlyOwner {
        IERC20(_token).transfer(_to, _value);
    }

    /**
     * BNB transfer function from the contract address;
     */
    function recoverBNB(address payable _to) public onlyOwner {
        (bool sent, ) = _to.call{value: address(this).balance}("");
        require(sent, "Failed to send Ether");
    }

    /**
     * @dev See {IERC20-transfer}.
     *
     * Requirements:
     *
     * - `_msgSender` cannot be in blacklist.
     */
    function transfer(address to, uint256 amount) onlyNotBlocked(_msgSender()) onlyNotLocked(_msgSender(), to) public virtual override returns (bool) {
        return super.transfer(to, amount);
    }

    /**
     * @dev See {IERC20-transfer}.
     *
     * Requirements:
     *
     * - `_msgSender` cannot be in blacklist.
     */
    function transferFrom(address from, address to, uint256 amount) onlyNotBlocked(from) onlyNotLocked(from, to) public virtual override returns (bool) {
        return super.transferFrom(from, to, amount);
    }

    /**
     * @dev See {IERC20-approve}.
     *
     * Requirements:
     *
     * - `_msgSender` cannot be in blacklist.
     */
    function approve(address spender, uint256 amount) onlyNotBlocked(_msgSender()) public virtual override returns (bool) {
        return super.approve(spender, amount);
    }
}
