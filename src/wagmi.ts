// -- wagmi --
import { Connector, ConnectorData, createClient, configureChains } from "wagmi";
import { Chain } from "wagmi";
import { jsonRpcProvider } from "@wagmi/core/providers/jsonRpc";
import { goerli, mainnet, gnosisChiado, gnosis } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { InjectedConnector } from "wagmi/connectors/injected";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";

import {
  GoogleAbstradeAAConnector,
  GithubAbstradeAAConnector,
  DiscordAbstradeAAConnector,
} from "./connectors";

const entryPointAddress: string = "0x0576a174D229E3cFA37253523E645A78A0C91B57";

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
  [gnosis, gnosisChiado],
  [publicProvider()]
);

const connectors = [
  new GoogleAbstradeAAConnector({
    chains,
    options: {
      projectId: "1",
      rpcProviderUrl: chains[0].rpcUrls.default.http[0],
    },
  }),
  new DiscordAbstradeAAConnector({
    chains,
    options: {
      projectId: "1",
      rpcProviderUrl:
        chains[0].id == 100
          ? "https://rpc.gnosis.gateway.fm"
          : chains[0].rpcUrls.default.http[0],
    },
  }),
  new GithubAbstradeAAConnector({
    chains,
    options: {
      projectId: "1",
      rpcProviderUrl:
        chains[0].id == 100
          ? "https://rpc.gnosis.gateway.fm"
          : chains[0].rpcUrls.default.http[0],
    },
  }),
  new MetaMaskConnector({ chains }),
];

export const client = createClient({
  autoConnect: false,
  connectors,
  provider,
});

export { chains, provider };
