const hre = require("hardhat");
const assert = require('assert');
const { expectRevert } = require('@openzeppelin/test-helpers');
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
    });

    it("Should change the holder shares", async () => {
        await CC.changeWalletShares(35, 45, 20);
        assert.strictEqual(35, await CC.wallet1Share());
        assert.strictEqual(45, await CC.wallet2Share());
        assert.strictEqual(20, await CC.wallet3Share());
    });

    it("Should check and change charecter limit.", async () => {
        assert.strictEqual(32,await CC.charLimit());

        await CC.setCharacterLimit(36);

        assert.strictEqual(36,await CC.charLimit());
    });

    it("Should fail to set total supply to 5", async () => {
        await expectRevert(
            CC.changeSupplyLimit(5),
            "Value should be greater currently minted canines."
        )
    });

    it("Should fail to mint 21 Canines", async () => {
        await expectRevert(
            CC.buyCanines(21, {from: accounts[0], value: (80000000000000000 * 21).toString()}),
            "Too many tokens for one transaction."
        )
    });

    it("Should fail to shares not adding up to 100.", async () => {
        await expectRevert(
            CC.changeWalletShares(50, 35, 14),
            "Shares are not adding up to 100."
        )
    });

    it("Should fail to mint 11 Canines because only 10 left.", async () => {
        await expectRevert(
            CC.buyCanines(11, {from: accounts[0], value: (80000000000000000 * 11).toString()}),
            "Not enough tokens left."
        )
    });

    it("Should fail to set shares not adding up to 100%.", async () => {
        expectRevert(
            CC.changeWalletShares(10, 71, 18),
            "Shares are not adding up to 100."
        );
    });
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


    it("Owner and Developer should get their shares", async () => {

        let wallet_1 = await web3.eth.getBalance(accounts[1]);
        wallet_1 = web3.utils.fromWei(wallet_1);// developer
        // console.log(`developer : ${wallet_1}`);

        let wallet_3 = await web3.eth.getBalance(accounts[2]);
        wallet_3 = web3.utils.fromWei(wallet_3);// wallet_3
        // console.log(`owner : ${wallet_3}`);

        const price = 0.05 * 10 ** 18;
        await CC.buyCanines(10, {value: (price * 10).toString()});

        let contract = await web3.eth.getBalance(CC.address);
        contract = web3.utils.fromWei(contract);// Contract
        // console.log(`Contract : ${contract}`);

        let wallet_2 = await web3.eth.getBalance(accounts[0]);
        wallet_2 = web3.utils.fromWei(wallet_2);// owner
        // console.log(`owner : ${wallet_2}`);

        await CC.withdrawAll()


        assert.strictEqual(
            parseFloat(wallet_2) + contract * 0.50 - 
        parseFloat(web3.utils.fromWei(await web3.eth.getBalance(accounts[0]))) < 0.0005, true);

        assert.strictEqual(
            parseFloat(wallet_1) + contract * 0.33, 
        parseFloat(web3.utils.fromWei(await web3.eth.getBalance(accounts[1]))));


        assert.strictEqual(
            parseFloat(wallet_3) + contract * 0.17, 
        parseFloat(web3.utils.fromWei(await web3.eth.getBalance(accounts[2]))));

        // console.log(`new developer : ${web3.utils.fromWei(await web3.eth.getBalance(accounts[1]))}`);
        // console.log(`new wallet_3 : ${web3.utils.fromWei(await web3.eth.getBalance(accounts[2]))}`);
        // console.log(`new owner : ${web3.utils.fromWei(await web3.eth.getBalance(accounts[0]))}`);
    })

    it("Should send all funds in owners' account.", async () => {
        const price = 0.05 * 10 ** 18;
        await CC.changeSupplyLimit(100);
        await CC.buyCanines(10, {value: (price * 10).toString()});
        await CC.buyCanines(10, {value: (price * 10).toString()});
        await CC.buyCanines(10, {value: (price * 10).toString()});
        await CC.buyCanines(10, {value: (price * 10).toString()});

        let contract = await web3.eth.getBalance(CC.address);
        contract = web3.utils.fromWei(contract);// Contract
        //console.log(`Contract : ${contract}`);

        let wallet_2 = await web3.eth.getBalance(accounts[0]);
        wallet_2 = web3.utils.fromWei(wallet_2);// owner
        // console.log(`owner : ${wallet_2}`);

        await CC.emergencyWithdraw();

        // console.log( parseFloat(web3.utils.fromWei(await web3.eth.getBalance(accounts[0]))) - parseFloat(wallet_2) - contract);

        assert.strictEqual(
            parseFloat(wallet_2) + contract - 
        parseFloat(web3.utils.fromWei(await web3.eth.getBalance(accounts[0]))) < 0.0005, true);

        // console.log(`new owner : ${web3.utils.fromWei(await web3.eth.getBalance(accounts[0]))}`)
    });
}); 

describe("NFT Name, Style nad Token URI test", () => {
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
        await CC.buyCanines(20,{value: (0.05 * 10 ** 18 * 20).toString()});
    });

    it("Should fail to Name the NFT 'Naming disabled'.", async () => {
        await CC.toggleNaming(false);
        expectRevert(
            CC.nameNFT(1, "Tommy", {value: (0.01 * 10 ** 18).toString()}),
            "Naming is disabled."
        );
    });

    it("Should fail to Name the NFT 'Incorrect price paid'.", async () => {
        await CC.toggleNaming(true); 
        expectRevert(
            CC.nameNFT(1, "Tommy", {value: (0.001 * 10 ** 18).toString()}),
            "Incorrect price paid."
        );
    });

    it("Should fail to Name the NFT 'Name exceeds characters limit'.", async () => {
        expectRevert(
            CC.nameNFT(1, "32ABCDEFGHABCDEFGHABCDEFGHABCDEFGH", {value: (0.01 * 10 ** 18).toString()}),
            "Name exceeds characters limit."
        );
    });


    it("Should contain Style zero.", async() => {
        assert.strictEqual(await CC.allowedStyles(0), true);
    });

    it("Should add Style 1", async () => {
        assert.strictEqual(await CC.allowedStyles(1), false);
        await CC.addStyle(1);
        assert.strictEqual(await CC.allowedStyles(1), true);
    });

    it("Should fail to add Style 'Style already exists.", async() => {
        expectRevert(
            CC.addStyle(1),
            "Invalid style Id."
        );
    });

    it("Should remove Style 1.", async () => {
        await CC.removeStyle(1);
        assert.strictEqual(await CC.allowedStyles(1), false);
    });

    it("Should fail to remove Style 'Style does not exists'.", async() => {
        expectRevert(
            CC.removeStyle(1),
            "Invalid style Id."
        );
    });

    it("Should return default token URI.", async () => {
        await CC.setBaseURI("https://www.api.caninecarte.com/token/");
        
        assert.strictEqual(await CC.tokenURI(1), await CC.baseURI() + "0/1")
    });

    it("Shuold return style 1 tokenURI.", async () => {
        await CC.addStyle(1);
        await CC.changeStyle(1,2)
        assert.strictEqual(await CC.tokenURI(2), await CC.baseURI() + "1/2")
    })
});