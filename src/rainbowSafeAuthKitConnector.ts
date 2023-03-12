import { SafeAuthKit, SafeAuthProviderType } from "@safe-global/auth-kit";
import { Chain } from "wagmi";
import { Web3AuthProviderConfig } from "@safe-global/auth-kit";
import { Wallet } from "@rainbow-me/rainbowkit";

import { SafeConnector } from "wagmi/connectors/safe";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";

import { getWalletConnectConnector } from "@rainbow-me/rainbowkit";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/dist/wallets/walletConnectors";
import { Connector } from "wagmi";
import { RainbowWalletOptions } from "@rainbow-me/rainbowkit/dist/wallets/walletConnectors/rainbowWallet/rainbowWallet";
import { Opts } from "@safe-global/safe-apps-sdk/dist/src/sdk";

import { SafeAAConnector } from "./types/SafeAuthAAConnector";

type SafeConnectorOptions = Opts & {
  /**
   * Connector automatically connects when used as Safe App.
   *
   * This flag simulates the disconnect behavior by keeping track of connection status in storage
   * and only autoconnecting when previously connected by user action (e.g. explicitly choosing to connect).
   *
   * @default false
   */
  shimDisconnect?: boolean;
};

interface SafeWalletOptions {
  chains: Chain[];
  options?: SafeConnectorOptions;
}

// export interface MetaMaskWalletOptions {
//   chains: Chain[];
//   shimDisconnect?: boolean;
// }

export const SafeAuthKitConnector = ({ chains }: SafeWalletOptions): Wallet => {
  return {
    id: "safe",
    name: "Safe AA",
    iconUrl: "https://picsum.photos/200",
    iconBackground: "#0c2f78",
    createConnector: () => {
      const connector = new SafeAAConnector({
        chains,
        options: {
          debug: true,
        },
      });
      // const connector = new MetaMaskConnector({ chains });
      // const connector = new SafeAuthAAConnector({ chains });
      // const connector = new CoinbaseWalletConnector({
      //   chains,
      //   options: {
      //     appName: "wagmi",
      //   },
      // });

      return {
        connector,
        desktop: {
          getUri: async () => {
            const uri = await connector.getProvider();
            return "https://picsum.photos/200";
          },
        },
      };
    },
  };
};

//   return safeAuthKit;

// export async function getSafeAuthKit(chains: Chain[])  {
//     const safeAuthKit = await SafeAuthKit.init(SafeAuthProviderType.Web3Auth, {
//       chainId: chains[0].id.toString(16),
//       txServiceUrl: "https://safe-transaction-goerli.safe.global",
//       authProviderConfig: {
//         rpcTarget: chains[0].rpcUrls.default.http[0],
//         clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID as string,
//         network: "testnet",
//         theme: "dark",
//       },
//     });

//     return safeAuthKit;
//   }
