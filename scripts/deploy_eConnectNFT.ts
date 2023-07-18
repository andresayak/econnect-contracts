import {ethers} from "hardhat";
// @ts-ignore
import Confirm from 'prompt-confirm';

async function main() {
    const name = process.env.NFT_NAME || "eConnectNFT";
    const symbol = process.env.NFT_SYMBOL || "TNFT";
    const baseURI = process.env.NFT_BASE_URI || "https://example.com/";

    const contractName = 'EConnectNFT';

    await new Promise(done => {
        new Confirm('Deploy ' + contractName + '?')
            .ask(async (answer: any) => {
                if (answer) {
                    const Contract = await ethers.getContractFactory(contractName);
                    const contract = await Contract.deploy(name, symbol, baseURI);

                    await contract.deployed();

                    console.log(
                        `Deployed ${contractName} to ${contract.address}`
                    );
                }
            });
    });

}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
