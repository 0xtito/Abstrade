// Web3Auth Libraries
import { Web3AuthAAConnector } from "./Web3AuthAAConnector";
import { Web3Auth } from "@web3auth/modal";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { Chain } from "wagmi";

const entryPointAddress: string = "0x0576a174D229E3cFA37253523E645A78A0C91B57";

/**
 * An Instance of the Web3AAConnector
 * @note currently not using, but will most likly import this into the _app.tsx file later on
 */
export default function Web3AuthAAConnectorInstance(chains: Chain[]) {
  // Create Web3Auth Instance
  const name = "My App Name";
  const iconUrl = "https://web3auth.io/docs/contents/logo-ethereum.png";
  const web3AuthInstance = new Web3Auth({
    clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID!,
    web3AuthNetwork: "testnet",
    chainConfig: {
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      chainId: "0x" + chains[0].id.toString(16),
      rpcTarget: chains[0].rpcUrls.default.http[0],
      displayName: chains[0].name,
      tickerName: chains[0].nativeCurrency?.name,
      ticker: chains[0].nativeCurrency?.symbol,
    },
    uiConfig: {
      appName: name,
      theme: "light",
      loginMethodsOrder: ["facebook", "google"],
      defaultLanguage: "en",
      appLogo: "https://web3auth.io/images/w3a-L-Favicon-1.svg", // Your App Logo Here
      modalZIndex: "2147483647",
    },
  });

  // Add openlogin adapter for customisations
  const openloginAdapterInstance = new OpenloginAdapter({
    adapterSettings: {
      network: "cyan",
      uxMode: "popup",
      whiteLabel: {
        name: "Your app Name",
        logoLight: "https://web3auth.io/images/w3a-L-Favicon-1.svg",
        logoDark: "https://web3auth.io/images/w3a-D-Favicon-1.svg",
        defaultLanguage: "en",
        dark: true, // whether to enable dark mode. defaultValue: false
      },
    },
  });
  web3AuthInstance.configureAdapter(openloginAdapterInstance);

  return new Web3AuthAAConnector({
    chains: chains,
    options: {
      web3AuthInstance,
      entryPointAddress,
      // filler values
      projectId: "1",
      accountFactoryAddress: "",
    },
  });
}
