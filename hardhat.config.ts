import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: ">=0.6.0 <0.8.0",
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
        url: process.env.MUMBAI_URL!,
        blockNumber: 16521526,
      },
    },
  },
  paths: {
    artifacts: "./src/artifacts",
  },
};

export default config;
