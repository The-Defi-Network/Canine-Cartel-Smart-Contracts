/**
* @type import('hardhat/config').HardhatUserConfig
*/
require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-solhint");

const {
   ETHERSCAN_API_KEY, INFURA_API_KEY, ALCHEMY_API_KEY, 
   PRIVATE_KEY, PUBLIC_KEY 
} = process.env;

module.exports = {
   solidity: "0.7.6",
   defaultNetwork: "hardhat",
   networks: {
      hardhat: {},
      // ropsten: {
      //    url: ALCHEMY_API_KEY,
      //    accounts: [`0x${PRIVATE_KEY}`]
      // }
   },
   // etherscan: {
   //    // Your API key for Etherscan
   //    // Obtain one at https://etherscan.io/
   //    apiKey: "YOUR_ETHERSCAN_API_KEY"
   //  }
}