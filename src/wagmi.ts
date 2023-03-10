import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import { configureChains, createClient } from "wagmi";
import { goerli, mainnet, gnosisChiado, gnosis } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

const { chains, provider, webSocketProvider } = configureChains(
  [
    mainnet,
    ...(process.env.NODE_ENV === "development"
      ? [goerli, gnosisChiado]
      : [gnosis]),
  ],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "Scaling Ethereum 2023",
  chains,
});

export const client = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

export { chains };
