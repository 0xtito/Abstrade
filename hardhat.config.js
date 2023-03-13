require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "^0.8.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  defaultNetwork: "goerli",
  networks: {
    hardhat: {
      forking: {
        url: process.env.MUMBAI_URL,
        blockNumber: 16521526,
      },
    },
  },
  paths: {
    artifacts: "./src/artifacts",
  },
};
