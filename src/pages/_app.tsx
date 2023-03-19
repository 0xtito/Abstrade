import "../styles/global.css";
import type { AppProps } from "next/app";
import NextHead from "next/head";
import * as React from "react";
import {
  WagmiConfig,
  Client as WagmiClient,
  createClient,
  Connector,
  Client,
} from "wagmi";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { useAccount } from "wagmi";

import { chains, provider } from "../wagmi";
import { Web3Auth } from "@web3auth/modal";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
// import Web3AuthAAConnectorInstance from "../connectors/Web3AuthAAConnectorInstance";

// import { Web3AuthAAConnector } from "../connectors/Web3AuthAAConnector";
import { Web3AuthAAConnector } from "../connectors/TWeb3AuthAAConnector";

function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = React.useState(false);
  const [client, setClient] = React.useState<any | null>(null);
  // const { connector } = useAccount();
  // const { isConnected, connector } = useAccount();
  const [web3AuthInstance, setWeb3AuthInstance] =
    React.useState<Web3Auth | null>(null);

  // const client = createClient({
  //   autoConnect: true,
  //   connectors: [
  //     new MetaMaskConnector({ chains }),
  //     Web3AuthAAConnectorInstance(chains),
  //   ],
  //   provider,
  // });

  React.useEffect(() => {
    const init = async () => {
      const { Web3Auth } = await import("@web3auth/modal");
      const { OpenloginAdapter } = await import("@web3auth/openlogin-adapter");
      const { MetaMaskConnector } = await import("wagmi/connectors/metaMask");

      console.log("inside init");
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

        await web3AuthInstance.initModal();

        setWeb3AuthInstance(web3AuthInstance);

        const connectors = [
          new Web3AuthAAConnector({
            chains,
            options: {
              web3AuthInstance,
              // will either remove or configure projectId
              projectId: "1",
              entryPointAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
              accountFactoryAddress:
                "0x6C583EE7f3a80cB53dDc4789B0Af1aaFf90e55F3",
              // "0x09c58cf6be8E25560d479bd52B4417d15bCA2845",
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
    if (!web3AuthInstance) {
      console.log("not connected");
      init();
    } else if (web3AuthInstance) {
      console.log("already connected");
      // await web3AuthInstance.init();
    }
  }, []);

  if (!client && !mounted) {
    return null;
  }

  // if (typeof window !== "undefined") {
  //   window.addEventListener("beforeunload", async () => {
  //     console.log(web3AuthInstance, "unloading");
  //     await web3AuthInstance?.logout();
  //   });
  // }

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
