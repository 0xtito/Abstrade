// Web3Auth Libraries
import { Web3Auth } from "@web3auth/modal";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { Chain } from "wagmi";
import { Web3AuthAAConnector } from "./Web3AuthAAConnector";

const entryPointAddress: string = "0x0576a174D229E3cFA37253523E645A78A0C91B57";

/**
 * An Instance of the Web3AAConnector
 * @note currently not using, but will most likly import this into the _app.tsx file later on
 */
export default function Web3AuthAAConnectorInstance(chains: Chain[]) {
  // Create Web3Auth Instance
  const name = "My App Name";
  const iconUrl = "https://web3auth.io/docs/contents/logo-ethereum.png";

  // const { Web3Auth } = await import("@web3auth/modal");
  // const { OpenloginAdapter } = await import("@web3auth/openlogin-adapter");
  // const { MetaMaskConnector } = await import("wagmi/connectors/metaMask");

  console.log("inside Instance creator");
  const web3AuthInstance = new Web3Auth({
    clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID!,
    chainConfig: {
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      chainId: chains[0].id.toString(),
      rpcTarget: chains[0].rpcUrls.default.http[0],
    },
    web3AuthNetwork: "testnet",
  });

  const openloginAdapter = new OpenloginAdapter({
    adapterSettings: {
      network: "testnet",
      uxMode: "popup",
      whiteLabel: {
        name: "Scaling Ethereum 2023",
        logoLight: "https://web3auth.io/images/w3a-L-Favicon-1.svg",
        logoDark: "https://web3auth.io/images/w3a-D-Favicon-1.svg",
        defaultLanguage: "en",
        dark: true, // whether to enable dark mode. defaultValue: false
      },
    },
  });

  web3AuthInstance.configureAdapter(openloginAdapter);

  return new Web3AuthAAConnector({
    chains,
    options: {
      web3AuthInstance,
      // will either remove or configure projectId
      projectId: "1",
      entryPointAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      accountFactoryAddress: "0x6C583EE7f3a80cB53dDc4789B0Af1aaFf90e55F3",
      // "0x09c58cf6be8E25560d479bd52B4417d15bCA2845",
    },
  });
}
