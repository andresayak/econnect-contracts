// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./ERC20.sol";
import "./interfaces/IERC20.sol";
import "./utils/BlackList.sol";
import "./utils/TransferLock.sol";
import "./utils/Ownable.sol";
import "./utils/BasicMetaTransaction.sol";

contract EConnectUtility is ERC20, Ownable, BlackList, TransferLock, BasicMetaTransaction {
    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) {}

    function mint(address _to, uint256 _amount) public onlyOwner {
        _mint(_to, _amount);
    }

    function _msgSender() internal view override(Context, BasicMetaTransaction) returns (address) {
        return BasicMetaTransaction._msgSender();
    }

    /**
     * Token transfer function from the contract address;
     */
    function recoverTokens(address _token, address _to, uint _value) public onlyOwner {
        if(address(this) == _token){
            super._transfer(address(this), _to, _value);
        }else{
            IERC20(_token).transfer(_to, _value);
        }
    }

    /**
     * BNB transfer function from the contract address;
     */
    function recoverBNB(address payable _to) public onlyOwner {
        (bool sent,) = _to.call{value: address(this).balance}("");
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
    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        require(!getBlackListStatus(_msgSender()));
        return super.approve(spender, amount);
    }

    /**
     * @dev See {IERC20-burn}.
     */
    function burn(address _account, uint256 _amount) onlyOwner public virtual {
        return super._burn( _account,  _amount);
    }

    receive() external payable virtual {}
}
