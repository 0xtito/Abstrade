//require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require('@nomiclabs/hardhat-waffle');
require("dotenv").config();

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.0"
      }
    ]
  },
  // defaultNetwork: "goerli",
  // networks: {
  //   hardhat: {
  //     forking: {
  //       url: process.env.MUMBAI_URL,
  //       blockNumber: 16521526,
  //     },
  //   },
  // },
  paths: {
    artifacts: "./src/artifacts",
  },
};
