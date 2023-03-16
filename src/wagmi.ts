// -- wagmi --
import { Connector, ConnectorData, createClient, configureChains } from "wagmi";
import { Chain } from "wagmi";
import { jsonRpcProvider } from "@wagmi/core/providers/jsonRpc";
import { goerli, mainnet, gnosisChiado, gnosis } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { InjectedConnector } from "wagmi/connectors/injected";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
// import { SafeConnector } from "wagmi/connectors/safe";

// import { SafeAuthAAConnector } from "./connectors/SafeAuthAAConnector";
// import { SafeAuthAAConnector } from "./connectors/TestSafeAuthAAConnector";
import { SafeAuthAAConnector } from "./connectors/_SafeAuthAAConnector";

// web3auth
import { Web3AuthConnector } from "@web3auth/web3auth-wagmi-connector";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { Web3AuthCore } from "@web3auth/core";
import {
  CHAIN_NAMESPACES,
  SafeEventEmitterProvider,
  WALLET_ADAPTERS,
} from "@web3auth/base";

const entryPointAddress: string = "0x0576a174D229E3cFA37253523E645A78A0C91B57";

import { useEffect } from "react";

/**
 * Currently messing around with wagmi, SafeAuthKit/web3authkit, and rainbowkit
 * Just learning how they work together before integrating in AA
 * Here are some handy links:
 * https://web3auth.io/docs/sdk/web/no-modal/
 * https://docs.gnosis-safe.io/learn/safe-core
 * https://wagmi.sh/examples/custom-connector#prerequisite-decide-what-type-of-connector-to-create
 *    - we may need to make a custom connector do create smart contract wallets from EOAs
 */

const { chains, provider } = configureChains(
  [goerli, gnosis, gnosisChiado],
  [publicProvider()]
);

// const openloginAdapterInstance = new OpenloginAdapter({
//   adapterSettings: {
//     network: "testnet",
//     uxMode: "popup",
//     whiteLabel: {
//       name: "Scaling Ethereum 2023",
//       logoLight: "https://web3auth.io/images/w3a-L-Favicon-1.svg",
//       logoDark: "https://web3auth.io/images/w3a-D-Favicon-1.svg",
//       defaultLanguage: "en",
//       dark: true, // whether to enable dark mode. defaultValue: false
//     },
//   },
// });

// web3AuthCore.configureAdapter(openloginAdapterInstance);

// projectId: string;
// /**
//  * the entry point to use
//  */
// entryPointAddress: string;
// accountFactoryAddress: string;

const connectors = [
  new SafeAuthAAConnector({
    chains,
    options: {
      debug: true,
      projectId: "1",
      entryPointAddress: entryPointAddress,
      accountFactoryAddress: "0x09c58cf6be8E25560d479bd52B4417d15bCA2845",
    },
  }),
  new MetaMaskConnector({ chains }),
];

export const client = createClient({
  autoConnect: false,
  connectors,
  provider,
});

export { chains };
