import {ethers} from "hardhat";
// @ts-ignore
import Confirm from 'prompt-confirm';

async function main() {
    const name = process.env.GOV_NAME || "eConnectGovToken";
    const symbol = process.env.GOV_SYMBOL || "GOV";
    const totalSupply = process.env.GOV_TOTAL_SUPPLY || "22000000";

    const amount = ethers.utils.parseEther(totalSupply);

    const contractName = 'EConnectGov';

    await new Promise(done => {
        new Confirm('Deploy ' + amount + ' ' + contractName + '?')
            .ask(async (answer: any) => {
                if (answer) {
                    const Contract = await ethers.getContractFactory(contractName);
                    const contract = await Contract.deploy(name, symbol, amount, {
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
