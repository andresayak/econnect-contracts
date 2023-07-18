import {HardhatUserConfig} from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-gas-reporter";
import {task} from "hardhat/config";

const {config: dotEnvConfig} = require("dotenv");

dotEnvConfig({path: __dirname + '/.env'});

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});

task("accountsWithBalances", "Prints the list of accounts with balances", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();
    for (const account of accounts) {
        let balance = (await account.getBalance()).toString();
        console.log(account.address, balance);
    }
});

const config: HardhatUserConfig = {
    solidity: "0.8.18",
    gasReporter: {
        enabled: true
    },
    networks: {
        bsc_mainnet: {
            chainId: 56,
            url: `https://bsc-dataseed.binance.org/`,
            accounts: [process.env.TBSC_PRIVATE_KEY || ''],
            gas: 5000000,
            gasPrice: 5000000000,
        },
        bsc_testnet: {
            chainId: 97,
            url: `https://data-seed-prebsc-1-s2.binance.org:8545`,
            accounts: [process.env.BSC_PRIVATE_KEY || ''],
            gas: 500000,
            gasPrice: 15000000000,
        }
    },
    etherscan: {
        apiKey: {
            bsc: process.env.BSC_API_TOKEN || '',
            bscTestnet: process.env.BSC_API_TOKEN || '',
        },
    },
};

export default config;
