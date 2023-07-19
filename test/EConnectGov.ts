import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {expect} from "chai";
import {ethers} from "hardhat";
import {createMetaTransaction} from "./helper";
import {BigNumber} from "ethers";

describe("EConnectGov", function () {
    async function deployFixture() {
        const EConnectGov = await ethers.getContractFactory("EConnectGov");
        const contract = await EConnectGov.deploy("eConnectGovToken", "GOV", BigNumber.from(100));
        return {contract};
    }

    describe("Meta Transactions", function () {
        it("Should success user mint via meta-transaction", async function () {
            const [owner, user1] = await ethers.getSigners();
            const {contract} = await loadFixture(deployFixture);
            const amount = 100;
            const functionSignature
                = contract.interface.encodeFunctionData('transfer', [user1.address, amount]);
            const deadline = Math.floor(new Date().getTime() / 1000) + 60;
            const nonce = await contract.getNonce(user1.address);
            expect(await contract.balanceOf(user1.address)).to.equal(0);
            // @ts-ignore
            await createMetaTransaction(contract, owner, user1, functionSignature, deadline, nonce);
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
            await expect(tx1).to.be.not.reverted;//revertedWith('ERC721: invalid token ID');
            await expect(tx2).to.be.revertedWith('BasicMetaTransaction: Signer and signature do not match');
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
            const [owner, user1] = await ethers.getSigners();
            const {contract} = await loadFixture(deployFixture);

            expect(await contract.owner()).to.equal(owner.address);
            await contract.transferOwnership(user1.address);
            expect(await contract.owner()).to.equal(user1.address);
        });
    });
    describe("transferLock", function () {
        it("should lock", async function () {
            const [owner, user1, user2] = await ethers.getSigners();
            const {contract} = await loadFixture(deployFixture);

            await contract.transfer(user1.address, 1);
            await expect(contract.connect(user1).transfer(user2.address, 1)).to.be.revertedWith('Locked');
        });
    });

    describe("recovery token", function () {
        it("should recovered", async function () {
            const [owner] = await ethers.getSigners();
            const {contract} = await loadFixture(deployFixture);

            const amount = BigNumber.from(100);
            await contract.transfer(contract.address, amount);
            expect(await contract.balanceOf(contract.address)).to.equal(amount);
            await contract.recoverTokens(contract.address, owner.address, amount);
            expect(await contract.balanceOf(contract.address)).to.equal(0);
            expect(await contract.balanceOf(owner.address)).to.equal(amount);
        });

        it("should recovered not own token", async function () {
            const [owner] = await ethers.getSigners();
            const {contract: contract1} = await loadFixture(deployFixture);
            const {contract: contract2} = await loadFixture(deployFixture);

            const amount = BigNumber.from(100);
            await contract2.transfer(contract1.address, amount);
            expect(await contract2.balanceOf(contract1.address)).to.equal(amount);
            await contract2.recoverTokens(contract1.address, owner.address, amount);
            expect(await contract2.balanceOf(contract1.address)).to.equal(0);
            expect(await contract2.balanceOf(owner.address)).to.equal(amount);
        });
    });

    describe("recovery BNB", function () {
        it("should recovered", async function () {
            const [owner] = await ethers.getSigners();
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
