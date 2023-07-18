# eSIM Connect contracts

https://econnect.io/

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy_eConnectGov.ts
npx hardhat run scripts/deploy_eConnectNFT.ts
npx hardhat run scripts/deploy_eConnectUtility.ts
```

### Deploy contracts

#### Testnet

```shell
npm run deploy-contracts-testnet
```

#### Mainnet

```shell
npm run deploy-contracts-mainnet
```

#### Verify contracts

```shell
npx hardhat verify --network <bsc_testnet|bsc_mainnet> <govAddress> <govName> <govSymbol> <govTotalSupplay>
npx hardhat verify --network <bsc_testnet|bsc_mainnet> <utlAddress> <utlName> <utlSymbol>
npx hardhat verify --network <bsc_testnet|bsc_mainnet> <nftAddress> <nftName> <nftSymbol> <nftBaseUri>
```
