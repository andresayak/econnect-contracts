import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {expect} from "chai";
import {ethers} from "hardhat";
import {createMetaTransaction} from "./helper";

describe("EConnectUtility", function () {
    async function deployFixture() {
        const EConnectUtility = await ethers.getContractFactory("EConnectUtility");
        const contract = await EConnectUtility.deploy("eConnectUtilityToken", "UTL");
        return {contract};
    }

    describe("Meta Transactions", function () {
        it("Should success user mint via meta-transaction", async function () {
            const [owner, user1] = await ethers.getSigners();
            const {contract} = await loadFixture(deployFixture);
            const amount = 100;
            const functionSignature
                = contract.interface.encodeFunctionData('mint', [user1.address, amount]);
            const deadline = Math.floor(new Date().getTime() / 1000) + 60;
            const nonce = await contract.getNonce(user1.address);
            expect(await contract.balanceOf(user1.address)).to.equal(0);
            // @ts-ignore
            const transaction = await createMetaTransaction(contract, owner, user1, functionSignature, deadline, nonce);
            expect(await contract.balanceOf(user1.address)).to.equal(amount);
        });

        it("Should fail second using", async function () {
            const [owner, user1] = await ethers.getSigners();
            const {contract} = await loadFixture(deployFixture);
            const amount = 100;
            const functionSignature
                = contract.interface.encodeFunctionData('transfer', [user1.address, amount]);
            const deadline = Math.floor(new Date().getTime() / 1000) + 60;
            const nonce = await contract.getNonce(user1.address);

            // @ts-ignore
            const tx1 = createMetaTransaction(contract, owner, user1, functionSignature, deadline, nonce);
            // @ts-ignore
            const tx2 = createMetaTransaction(contract, owner, user1, functionSignature, deadline, nonce);
            //await expect(tx1).to.be.not.reverted;//revertedWith('ERC721: invalid token ID');
            //await expect(tx2).to.be.revertedWith('BasicMetaTransaction: Signer and signature do not match');
        });

        it("Should fail is send another user", async function () {
            const [owner, user1, otherAccount] = await ethers.getSigners();
            const {contract} = await loadFixture(deployFixture);
            const amount = 100;
            const functionSignature
                = contract.interface.encodeFunctionData('transfer', [user1.address, amount]);
            const deadline = Math.floor(new Date().getTime() / 1000) + 60;

            const nonce = await contract.getNonce(user1.address);
            // @ts-ignore
            const tx = createMetaTransaction(contract, owner, user1, functionSignature, deadline, nonce, otherAccount);
            await expect(tx).to.be.revertedWith('BasicMetaTransaction: Signer and signature do not match');
        });
    });

    describe("transferOwnership", function () {
        it("should change owner", async function () {
            const [owner, user1, user2, router, user3, user4] = await ethers.getSigners();
            const {contract} = await loadFixture(deployFixture);
            expect(await contract.owner()).to.equal(owner.address);
            await contract.transferOwnership(user1.address);
            expect(await contract.owner()).to.equal(user1.address);
        });
    });

    describe("recovery BNB", function () {
        it("should recovered", async function () {
            const [owner, user1, user2, router, user3, user4] = await ethers.getSigners();
            const {contract} = await loadFixture(deployFixture);

            const amount = 1;
            await owner.sendTransaction({
                value: amount,
                to: contract.address,
                gasLimit: 100000
            });
            expect(await ethers.provider.getBalance(contract.address)).to.equal(amount);
            await contract.recoverBNB(owner.address);
            expect(await ethers.provider.getBalance(contract.address)).to.equal(0);
        });
    });
});
