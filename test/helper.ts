import {BigNumber, Contract, ContractTransaction} from "ethers";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/src/signers";
import abi from "ethereumjs-abi";
import {toBuffer} from "ethereumjs-util";
import {ethers} from "hardhat";

export const createMetaTransaction = async (contract: Contract, owner: SignerWithAddress, sender: SignerWithAddress,
                                            functionSignature: string, deadline: number, nonce: BigNumber,
                                            signer?: SignerWithAddress)
    : Promise<ContractTransaction> => {
    const chainId = await contract.getChainID();
    const messageToSign = constructMetaTransactionMessage(nonce.toNumber(), contract.address, chainId.toNumber(),
        functionSignature, deadline, sender.address);
    const signature = await owner.signMessage(messageToSign);
    const {r, s, v} = getSignatureParameters(signature);
    return contract.connect(signer ? signer : sender).executeMetaTransaction(owner.address, functionSignature, r, s, v, deadline);
}

export const constructMetaTransactionMessage = (nonce: any, contractAddress: string, chainId: any, functionSignature: string,
                                                deadline: number, sender: string) => {
    return abi.soliditySHA3(
        ["uint256", "address", "uint256", "bytes", "uint256", "address"],
        [nonce, contractAddress, chainId, toBuffer(functionSignature), deadline, sender]
    );
}

export const getSignatureParameters = (signature: any) => {
    if (!ethers.utils.isHexString(signature)) {
        throw new Error(
            'Given value "'.concat(signature, '" is not a valid hex string.')
        );
    }
    const r = signature.slice(0, 66);
    const s = "0x" + signature.slice(66, 130);
    let v = "0x" + signature.slice(130, 132);
    let vNumber = ethers.BigNumber.from(v).toNumber();
    // @ts-ignore
    if (![27, 28].includes(vNumber)) vNumber += 27;
    return {r, s, v: vNumber};
};

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
