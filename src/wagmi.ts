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
 * @title Wagmi config
 * @note using customer connectors, that were influenced by ZeroDev's connectors
 * https://web3auth.io/docs/sdk/web/no-modal/
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
