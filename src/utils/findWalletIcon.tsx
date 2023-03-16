import { WalletIcon } from "@heroicons/react/24/outline";
import {
  MetamaskIcon,
  CoinbaseWalletIcon,
  WalletConnectIcon,
} from "../static/images";

export function findWalletIcon(name: string) {
  switch (name) {
    case "MetaMask":
      return (
        <MetamaskIcon
          className="h-6 w-6 text-gray-600 group-hover:text-indigo-600"
          aria-hidden="true"
        />
      );
    case "Coinbase Wallet":
      return <CoinbaseWalletIcon />;
    case "WalletConnect":
      return <WalletConnectIcon />;
    default:
      return <WalletIcon />;
  }
}
