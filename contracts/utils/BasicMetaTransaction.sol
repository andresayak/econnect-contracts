// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./Context.sol";

contract BasicMetaTransaction is Context {

    event MetaTransactionExecuted(address userAddress, address relayerAddress, bytes functionSignature);

    mapping(address => uint256) private nonces;

    /**
     * This function retrieves the current chain ID by using assembly code to directly access the chainid() opcode.
     * It returns the obtained chain ID as a uint256 value.
     */
    function getChainID() public view returns (uint256) {
        uint256 id;
        assembly {
            id := chainid()
        }
        return id;
    }

    /**
     * Executes a single meta-transaction
     */
    function executeMetaTransaction(address userAddress, bytes memory functionSignature,
        bytes32 sigR, bytes32 sigS, uint8 sigV, uint256 deadline) public payable returns (bytes memory) {

        require(block.timestamp <= deadline, "BasicMetaTransaction: expired deadline");

        require(verify(userAddress, msg.sender, nonces[msg.sender], getChainID(), functionSignature, sigR, sigS, sigV, deadline), "BasicMetaTransaction: Signer and signature do not match");
        nonces[msg.sender] = nonces[msg.sender] + 1;

        (bool success, bytes memory returnData) = address(this).call(abi.encodePacked(functionSignature, userAddress));

        require(success, "Function call not successful");
        emit MetaTransactionExecuted(userAddress, msg.sender, functionSignature);
        return returnData;
    }

    /**
     * returns the current nonce number for the user
     */
    function getNonce(address user) external view returns (uint256 nonce) {
        nonce = nonces[user];
    }

    /**
     * This function takes a bytes32 hash as input and returns the keccak256 hash
     * of the prefixed message "\x19Ethereum Signed Message:\n32" concatenated with the input hash.
     */
    function prefixed(bytes32 hash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }

    /**
     * This function verifies the signature of a meta-transaction by recovering the signer's address from the provided signature parameters.
     * It checks if the signer is not zero and returns a boolean indicating whether the owner matches the recovered signer's address.
     */
    function verify(address owner, address sender, uint256 nonce, uint256 chainID, bytes memory functionSignature,
        bytes32 sigR, bytes32 sigS, uint8 sigV, uint256 deadline) public view returns (bool) {

        bytes32 hash = prefixed(keccak256(abi.encodePacked(nonce, this, chainID, functionSignature, deadline, sender)));
        address signer = ecrecover(hash, sigV, sigR, sigS);
        require(signer != address(0), "BasicMetaTransaction: Invalid signature");
        return (owner == signer);
    }

    function _msgSender() internal view virtual override returns (address sender) {
        if (msg.sender == address(this)) {
            bytes memory array = msg.data;
            uint256 index = msg.data.length;
            assembly {
                sender := and(mload(add(array, index)), 0xffffffffffffffffffffffffffffffffffffffff)
            }
        } else {
            return msg.sender;
        }
    }
}
