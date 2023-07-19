import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {expect} from "chai";
import {ethers} from "hardhat";
import {createMetaTransaction, ZERO_ADDRESS } from "./helper";


describe("EConnectNFT", function () {
    async function deployFixture() {
        const EConnectNFT = await ethers.getContractFactory("EConnectNFT");
        const baseURI = "https://example.com/";
        const contract = await EConnectNFT.deploy("eConnectNFT", "TNFT", baseURI);
        return {contract, baseURI};
    }

    describe("Mint token", function () {
        it("Should get the right token owner", async function () {
            const [owner, user1] = await ethers.getSigners();
            const {contract} = await loadFixture(deployFixture);
            const tokenId = 1;
            await expect(contract.mint(user1.address, tokenId, 'test')).to.emit(contract, "Transfer")
                .withArgs(ZERO_ADDRESS, user1.address, tokenId);
            expect(await contract.ownerOf(tokenId)).to.equal(user1.address);
        });

        it("Should get the right token URI", async function () {
            const [owner, user1] = await ethers.getSigners();
            const {contract, baseURI} = await loadFixture(deployFixture);
            const tokenId = 1;
            const tokenHash = 'test';
            await contract.mint(user1.address, tokenId, tokenHash);
            expect(await contract.tokenURI(tokenId)).to.equal(baseURI + tokenHash);
        });

        it("Should get the right event", async function () {
            const [owner, user1] = await ethers.getSigners();
            const {contract, baseURI} = await loadFixture(deployFixture);
            const tokenId = 1;
            const tokenHash = 'test';
            await contract.mint(user1.address, tokenId, tokenHash);
            await expect(contract.connect(user1).burn(tokenId)).to.emit(contract, "Transfer")
                .withArgs(user1.address, ZERO_ADDRESS, tokenId);
        });
    });

    describe("Fail mint token", function () {
        it("Should fail if not exists token", async function () {
            const [owner, user1] = await ethers.getSigners();
            const {contract} = await loadFixture(deployFixture);
            const tokenId = 1;
            await contract.mint(user1.address, tokenId, 'test');
            await expect(contract.tokenURI('100')).to.be.revertedWith('ERC721: invalid token ID');
        });

        it("Should fail if mint exists token", async function () {
            const [owner, user1, otherAccount] = await ethers.getSigners();
            const {contract} = await loadFixture(deployFixture);
            const tokenId = 1;
            await contract.mint(user1.address, tokenId, 'test');
            await expect(contract.mint(user1.address, tokenId, 'test')).to.be.revertedWith('ERC721: token already minted');
        });

        it("Should fail if not owner", async function () {
            const [owner, user1] = await ethers.getSigners();
            const {contract, baseURI} = await loadFixture(deployFixture);
            const tokenId = 1;
            const tokenHash = 'test';
            await expect(contract.connect(user1).mint(user1.address, tokenId, tokenHash)).to.be.revertedWith('Ownable: caller is not the owner');
        });
    });

    describe("withdraw and deposit token", function () {
        it("Should success", async function () {
            const [owner, user1] = await ethers.getSigners();
            const {contract, baseURI} = await loadFixture(deployFixture);
            const tokenId = 1;
            await contract.mint(user1.address, tokenId, 'test');
            await contract.connect(user1).deposit(tokenId);
            await expect(contract.tokenURI(tokenId)).to.be.revertedWith('ERC721: invalid token ID');
            const newTokenHash = 'test2'
            await contract.withdraw(user1.address, tokenId, newTokenHash);
            expect(await contract.ownerOf(tokenId)).to.equal(user1.address);
            expect(await contract.tokenURI(tokenId)).to.equal(baseURI + newTokenHash);
        });
    });

    describe("Meta Transactions", function () {
        it("Should success user mint via meta-transaction", async function () {
            const [owner, user1] = await ethers.getSigners();
            const {contract, baseURI} = await loadFixture(deployFixture);
            const tokenId = 1;
            const tokenHash = 'test';
            const functionSignature
                = contract.interface.encodeFunctionData('mint', [user1.address, tokenId, tokenHash]);
            const deadline = Math.floor(new Date().getTime() / 1000) + 60;
            const nonce = await contract.getNonce(user1.address);
            // @ts-ignore
            const transaction = await createMetaTransaction(contract, owner, user1, functionSignature, deadline, nonce);
            expect(await contract.ownerOf(tokenId)).to.equal(user1.address);
            expect(await contract.tokenURI(tokenId)).to.equal(baseURI + tokenHash);
        });

        it("Should fail second using", async function () {
            const [owner, user1] = await ethers.getSigners();
            const {contract, baseURI} = await loadFixture(deployFixture);
            const tokenId = 1;
            const tokenHash = 'test';
            const functionSignature
                = contract.interface.encodeFunctionData('mint', [user1.address, tokenId, tokenHash]);
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
            const {contract, baseURI} = await loadFixture(deployFixture);
            const tokenId = 1;
            const tokenHash = 'test';
            const functionSignature
                = contract.interface.encodeFunctionData('mint', [user1.address, tokenId, tokenHash]);
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
