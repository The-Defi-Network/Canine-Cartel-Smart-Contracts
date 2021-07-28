const hre = require("hardhat");
const assert = require('assert');
const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
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