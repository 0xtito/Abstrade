require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  defaultNetwork: "polygonMumbai",
  networks: {
    hardhat: {
    },
    polygonMumbai: {
      url: process.env.MUMBAI_URL,
      accounts: [process.env.PRIVATE_KEY],
    }
  },
  etherscan: {
    apiKey:  {
      polygonMumbai: process.env.POLYGONSCAN_API_KEY 
  }
},
  paths: {
    artifacts: "./src/artifacts",
  },
}