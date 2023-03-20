import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
    },
    mumbai: {
      url: process.env.MUMBAI_URL!,
      accounts: [process.env.PRIVATE_KEY!],
    },
    gnosis: {
      url: 'https://rpc.gnosis.gateway.fm',
      accounts: [process.env.PRIVATE_KEY!]
    }
  },
/*   etherscan: {
    apiKey:  {
      polygonMumbai: process.env.POLYGONSCAN_API_KEY 
  } 
},*/
  paths: {
    artifacts: "./src/artifacts",
  },

};

export default config;