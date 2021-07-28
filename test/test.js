const hre = require("hardhat");
const assert = require('assert');
const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { web3 } = require("hardhat");
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

    it("Should fail to mint 21 Canines", async () => {
        await expectRevert(
            CC.buyCanines(21, {from: accounts[0], value: (80000000000000000 * 21).toString()}),
            "Too many tokens for one transaction."
        )
    })

    it("Owner and Developer should get their shares", async () => {
        await CC.setDevAddress(accounts[1], {from: accounts[0]});
        await CC.setOwnerAddress(accounts[2], {from: accounts[0]});
        let ownerBalance = await web3.eth.getBalance(accounts[2]);
        ownerBalance = web3.utils.fromWei(ownerBalance);
        let developerBalance = await web3.eth.getBalance(accounts[1]);
        developerBalance = web3.utils.fromWei(developerBalance);
        await CC.buyCanines(10, {from: accounts[0], value: (80000000000000000 * 10).toString()});
        
        assert.strictEqual(
            parseFloat(ownerBalance) + parseFloat(web3.utils.fromWei((80000000000000000 * 6).toString())), 
        parseFloat(web3.utils.fromWei(await web3.eth.getBalance(accounts[2]))));

        assert.strictEqual(
            parseFloat(developerBalance) + parseFloat(web3.utils.fromWei((80000000000000000 * 4).toString())), 
        parseFloat(web3.utils.fromWei(await web3.eth.getBalance(accounts[1]))));
    })

    it("Should fail to mint 11 Canines because only 10 left", async () => {
        await expectRevert(
            CC.buyCanines(11, {from: accounts[0], value: (80000000000000000 * 11).toString()}),
            "Not enough tokens left."
        )
    })

});

// describe("Event Tests", () => {
//     let accounts = [];
//     let CC;
//     before(async function () {
//         acc = await hre.ethers.getSigners();
//         for (const account of acc) {
//             accounts.push(account.address)
//         }
//         const CanineCartel = await hre.ethers.getContractFactory("CanineCartel");
//         const canineCartel = await CanineCartel.deploy(tokenSupplyLimit, tokenBaseUri);
//         CC = await canineCartel.deployed();
//     });

//     it("Should catch DevAddressChanged event", async () => {
//         const receipt = await CC.setDevAddress(accounts[1], { from: accounts[0]});
//         expectEvent(receipt, 'DevAddressChanged');
//     })
// });