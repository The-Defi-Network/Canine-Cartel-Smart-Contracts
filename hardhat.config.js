/**
* @type import('hardhat/config').HardhatUserConfig
*/
require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-solhint");
require("@nomiclabs/hardhat-web3");

const {
   API_URL,
   PRIVATE_KEY,
   ETHERSCAN_API_KEY
} = process.env;

module.exports = {
   solidity: "0.8.4",
   defaultNetwork: "hardhat",
   networks: {
      hardhat: {},
      rinkeby: {
         url: API_URL,
         accounts: [`0x${PRIVATE_KEY}`] 
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