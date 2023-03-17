import "../styles/global.css";
import type { AppProps } from "next/app";
import NextHead from "next/head";
import * as React from "react";
import { WagmiConfig, Client as WagmiClient, createClient } from "wagmi";
import { CHAIN_NAMESPACES } from "@web3auth/base";

import { chains, provider } from "../wagmi";
import { Web3AuthAAConnector } from "../connectors/Web3AuthAAConnector";

function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = React.useState(false);
  const [client, setClient] = React.useState<any | null>(null);

  React.useEffect(() => {
    const init = async () => {
      const { Web3Auth } = await import("@web3auth/modal");
      const { OpenloginAdapter } = await import("@web3auth/openlogin-adapter");
      const { MetaMaskConnector } = await import("wagmi/connectors/metaMask");

      try {
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

        const connectors = [
          new Web3AuthAAConnector({
            chains,
            options: {
              web3AuthInstance,
              // will either remove or configure projectId
              projectId: "1",
              entryPointAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
              accountFactoryAddress:
                "0x09c58cf6be8E25560d479bd52B4417d15bCA2845",
            },
          }),
          new MetaMaskConnector({ chains }),
        ];

        const _client = createClient({
          autoConnect: false,
          connectors,
          provider,
        });
        setClient(_client);
        setMounted(true);
      } catch (error) {
        console.error(error);
      }
    };
    init();
  }, []);

  if (!client && !mounted) {
    return null;
  }

  return (
    <WagmiConfig client={client}>
      <NextHead>
        <title>Abstrade</title>
      </NextHead>

      {mounted && <Component {...pageProps} />}
    </WagmiConfig>
  );
}

export default App;
