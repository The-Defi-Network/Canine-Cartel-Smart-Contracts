const hre = require("hardhat");
const assert = require('assert');
const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { web3 } = require("hardhat");
const { copyFileSync } = require("fs");
const tokenSupplyLimit = 40;
const tokenBaseUri = "";


describe("Suplay and Revert Test", () => {
    let accounts = [];
    let CC;
    before(async function () {
        acc = await hre.ethers.getSigners();
        for (const account of acc) {
            accounts.push(account.address)
        }
        const CanineCartel = await hre.ethers.getContractFactory("CanineCartel");
        const canineCartel = await CanineCartel.deploy(tokenSupplyLimit, tokenBaseUri);
        CC = await canineCartel.deployed();
    });
    
    it("Should check total supply limit 30.", async ()=> {
        let x = (await CC.supplyLimit())._hex;
        assert.strictEqual(parseInt(x), tokenSupplyLimit);
    })

    it("Should set SaleActive to true", async () => {
        await CC.toggleSaleActive();
        assert.strictEqual(await CC.saleActive(), true);
    });

    it("Should mint 20 Canines", async () => {
        await CC.buyCanines(20, {from: accounts[0], value: (80000000000000000 * 20).toString()});
        let x = (await CC.balanceOf(accounts[0]))._hex;
        assert.strictEqual(parseInt(x), 20);
    })

    it("Should fail to set total supply to 5", async () => {
        await expectRevert(
            CC.changeSupplyLimit(5),
            "Value should be greater currently minted canines."
        )
    })

    it("Should fail to mint 21 Canines", async () => {
        await expectRevert(
            CC.buyCanines(21, {from: accounts[0], value: (80000000000000000 * 21).toString()}),
            "Too many tokens for one transaction."
        )
    })

    it("Owner and Developer should get their shares", async () => {
        await CC.setWallet_1(accounts[1], {from: accounts[0]});
        await CC.setWallet_3(accounts[2], {from: accounts[0]});
        await CC.setWallet_2(accounts[3], {from: accounts[0]});

        let wallet_1 = await web3.eth.getBalance(accounts[1]);
        wallet_1 = web3.utils.fromWei(wallet_1);// developer
        //console.log(`developer : ${wallet_1}`);

        let wallet_2 = await web3.eth.getBalance(accounts[3]);
        wallet_2 = web3.utils.fromWei(wallet_2);// owner
        //console.log(`owner : ${wallet_2}`);

        let wallet_3 = await web3.eth.getBalance(accounts[2]);
        wallet_3 = web3.utils.fromWei(wallet_3);
        //console.log(`wallet_3 : ${wallet_3}`);

        await CC.buyCanines(10, {value: (80000000000000000 * 10).toString()});
        
        assert.strictEqual(
            parseFloat(wallet_1) + parseFloat(web3.utils.fromWei((80000000000000000 * 3.4).toString())), 
        parseFloat(web3.utils.fromWei(await web3.eth.getBalance(accounts[1]))));

        assert.strictEqual(
            parseFloat(wallet_2) + parseFloat(web3.utils.fromWei((80000000000000000 * 5.1).toString())), 
        parseFloat(web3.utils.fromWei(await web3.eth.getBalance(accounts[3]))));

        assert.strictEqual(
            parseFloat(wallet_3) + parseFloat(web3.utils.fromWei((80000000000000000 * 1.5).toString())), 
        parseFloat(web3.utils.fromWei(await web3.eth.getBalance(accounts[2]))));

        // console.log(`new developer : ${web3.utils.fromWei(await web3.eth.getBalance(accounts[1]))}`);
        // console.log(`new owner : ${web3.utils.fromWei(await web3.eth.getBalance(accounts[3]))}`);
        // console.log(`new wallet_3 : ${web3.utils.fromWei(await web3.eth.getBalance(accounts[2]))}`);
    })

    it("Should fail to mint 11 Canines because only 10 left", async () => {
        await expectRevert(
            CC.buyCanines(11, {from: accounts[0], value: (80000000000000000 * 11).toString()}),
            "Not enough tokens left."
        )
    })
});