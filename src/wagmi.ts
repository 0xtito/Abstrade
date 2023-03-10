// rainbow
import { rainbowWallet, metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import {
  connectorsForWallets,
  RainbowKitProvider,
  Wallet,
  getWalletConnectConnector,
  getDefaultWallets,
} from "@rainbow-me/rainbowkit";
// wagmi
import { Connector, ConnectorData, createClient, configureChains } from "wagmi";
import { Chain } from "wagmi";
import { jsonRpcProvider } from "@wagmi/core/providers/jsonRpc";
import { goerli, mainnet, gnosisChiado, gnosis } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { MetaMaskConnector } from "@wagmi/core/connectors/metaMask";
// web3auth
import { Web3AuthConnector } from "@web3auth/web3auth-wagmi-connector";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { Web3AuthCore } from "@web3auth/core";
import {
  CHAIN_NAMESPACES,
  SafeEventEmitterProvider,
  WALLET_ADAPTERS,
} from "@web3auth/base";
// gnosis safe auth kit
import {
  SafeAuthKit,
  SafeAuthProviderType,
  SafeAuthConfig,
} from "@safe-global/auth-kit";
import { SafeConnector } from "@wagmi/connectors/safe";

/**
 * Currently messing around with wagmi, SafeAuthKit/web3authkit, and rainbowkit
 * Just learning how they work together before integrating in AA
 * Here are some handy links:
 * https://web3auth.io/docs/sdk/web/no-modal/
 * https://docs.gnosis-safe.io/learn/safe-core
 * https://wagmi.sh/examples/custom-connector#prerequisite-decide-what-type-of-connector-to-create
 *    - we may need to make a custom connector do create smart contract wallets from EOAs
 */

// Publicly provided RPC endpoint for: Gnosis Chaido testnet
// https://rpc.chiado.gnosis.gateway.fm
// and Gnosis Mainnet
// https://rpc.gnosis.gateway.fm

const { chains, provider, webSocketProvider } = configureChains(
  [gnosis, gnosisChiado],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http:
          chain.id == 100
            ? "https://rpc.gnosis.gateway.fm"
            : "https://rpc.chiado.gnosis.gateway.fm",
      }),
    }),
    publicProvider(),
  ]
);

// Docs (https://docs.gnosis-safe.io/learn/safe-core-account-abstraction-sdk/auth-kit) say that
// modalCOnfig is optional, but it is not optional in the typescript definition
// can add it ourselves if need be or skip modalConfig
export async function getSafeAuthKit() {
  const safeAuthKit = await SafeAuthKit.init(SafeAuthProviderType.Web3Auth, {
    chainId: chains[0].id.toString(16),
    authProviderConfig: {
      rpcTarget: chains[0].rpcUrls.default.http[0],
      clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID as string,
      network: "testnet",
      theme: "dark",
    },
  });

  return safeAuthKit;
}

// Not needed with SafeAuthKit, but keeping for now
const web3AuthCore = new Web3AuthCore({
  clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID as string,
  web3AuthNetwork: "testnet",
  chainConfig: {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0x" + chains[0].id.toString(16),
    rpcTarget: chains[0].rpcUrls.default.http[0],
    displayName: chains[0].name,
    tickerName: chains[0].nativeCurrency?.name,
    ticker: chains[0].nativeCurrency?.symbol,
    blockExplorer: chains[0]?.blockExplorers.default?.url,
  },
});

const openloginAdapterInstance = new OpenloginAdapter({
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

// web3AuthCore.configureAdapter(openloginAdapterInstance);

// should be passing in connectors to createClient, but SafeConnnector is saying it is
// not of type Connector

// const { connectors } = getDefaultWallets({
//   appName: "Scaling Ethereum 2023",
//   chains,
// });
const connectors = connectorsForWallets([
  {
    groupName: "Wallets",
    wallets: [rainbowWallet({ chains }), metaMaskWallet({ chains })],
  },
]);
// const connectors = [
//   new SafeConnector({ chains }),
//   new MetaMaskConnector({ chains }),
// ];

export const client = createClient({
  autoConnect: true,
  connectors,
  provider,
});

export { chains };
