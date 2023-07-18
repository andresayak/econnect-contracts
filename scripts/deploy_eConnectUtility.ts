import {ethers} from "hardhat";
// @ts-ignore
import Confirm from 'prompt-confirm';

async function main() {
    const name = process.env.UTL_NAME || "eConnectUtilityToken";
    const symbol = process.env.UTL_SYMBOL || "UTL";

    const contractName = "EConnectUtility";

    await new Promise(done => {
        new Confirm('Deploy ' + contractName + '?')
            .ask(async (answer: any) => {
                if (answer) {
                    const Contract = await ethers.getContractFactory(contractName);
                    const contract = await Contract.deploy(name, symbol, {
                        gasPrice: '15000000000'
                    });
                    await contract.deployed();
                    console.log(
                        `Deployed ${contractName} to ${contract.address}`
                    );
                }
                done(true);
            });
    });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

