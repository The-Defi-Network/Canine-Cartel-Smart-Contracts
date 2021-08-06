/**
* @type import('hardhat/config').HardhatUserConfig
*/
require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-solhint");
require("@nomiclabs/hardhat-web3");

const {
   RINKEBY_RPC_URL,
   MNEMONIC,
   ETHERSCAN_API_KEY
} = process.env;

module.exports = {
   solidity: "0.7.6",
   defaultNetwork: "hardhat",
   networks: {
      hardhat: {},
      rinkeby: {
         url: RINKEBY_RPC_URL,
         accounts: {
            mnemonic: MNEMONIC
         },
         gas: 2100000, 
         gasPrice: 8000000000
      },
      // ropsten: {
      //    url: ALCHEMY_API_KEY,
      //    accounts: [`0x${PRIVATE_KEY}`]
      // }
   },
   etherscan: {
      // Your API key for Etherscan
      // Obtain one at https://etherscan.io/
      apiKey: ETHERSCAN_API_KEY
    }
}

//'0x8D1894B0c088B0c45d6A96393eA64c42F4026AB1'
//0x9459e23d8A9581d0bc4959230617178ee49f3D7c - master
//0x4e0D605E1c284E1BBa2F370D6302b0AC5ae48073 - new