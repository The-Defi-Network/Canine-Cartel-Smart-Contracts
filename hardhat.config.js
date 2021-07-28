/**
* @type import('hardhat/config').HardhatUserConfig
*/
require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-solhint");
require("@nomiclabs/hardhat-web3");

const {
   INFURA_API_KEY,
   MNEMONIC,
   ETHERSCAN_API_KEY
} = process.env;

module.exports = {
   solidity: "0.7.6",
   defaultNetwork: "hardhat",
   networks: {
      hardhat: {},
      rinkeby: {
         url: INFURA_API_KEY,
         accounts: {
            mnemonic: MNEMONIC
         }
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