const hre = require("hardhat");
const assert = require('assert');
const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { web3 } = require("hardhat");
const tokenSupplyLimit = 30;
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
    
    it("Should check total supply limit 40.", async ()=> {
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

    it("Should fail to shares not adding up to 100.", async () => {
        await expectRevert(
            CC.changeWalletShares(50, 35, 14),
            "Shares are not adding up to 100."
        )
    })

    it("Should have 0.001 ETH in contract.", async () => {
        await CC.sendNFT(accounts[1], 2, "0x",{value : (0.001 * 10 ** 18).toString()});
        assert.strictEqual(parseInt(await web3.eth.getBalance(CC.address)), 1000000000000000);
    })

    it("Should send one NFT.", async () => {
        await CC.sendNFT(accounts[2], 1, "0x",{value : (0.001 * 10 ** 18).toString()});
        assert.strictEqual(parseInt((await CC.balanceOf(accounts[2]))._hex), 1);
    })

    it("Should fail, Missing 0.001 ETH.", async () => {
        await expectRevert(
            CC.sendNFT(accounts[1], 1, "0x"),
            "Missing fee 0.001 Eth."
        ) 
    })

    it("Should fail to mint 11 Canines because only 10 left.", async () => {
        await expectRevert(
            CC.buyCanines(11, {from: accounts[0], value: (80000000000000000 * 11).toString()}),
            "Not enough tokens left."
        )
    })
});

describe("Withdraw Test", () => {
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
        await CC.toggleSaleActive();
        await CC.buyCanines(10, {value: (80000000000000000 * 10).toString()})
        await CC.setWallet_1(accounts[1], {from: accounts[0]});
        await CC.setWallet_3(accounts[2], {from: accounts[0]});
    });

    it("Sholud send all funds to owners address.", async () => {
        const before_contract = web3.utils.fromWei(await web3.eth.getBalance(CC.address));
        
        await CC.sendNFT(accounts[3], 1, "0x", {value: (0.001 * 10 ** 18).toString()})

        const before_owner = web3.utils.fromWei(await web3.eth.getBalance(accounts[0]));
        await CC.emergancyWithdraw();
        
        assert.strictEqual(
            parseInt(before_contract), 
            parseInt(web3.utils.fromWei(await web3.eth.getBalance(CC.address)))
        );
        
        // console.log("Differance : ", parseFloat(web3.utils.fromWei(await web3.eth.getBalance(accounts[0]))) - parseFloat(before_owner))
        // assert.strictEqual(
        //     parseFloat(before_owner) + parseFloat(web3.utils.fromWei((0.001 * 10 ** 18).toString())), 
        //     parseFloat(web3.utils.fromWei((await web3.eth.getBalance(accounts[0]))))
        // );    

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
});