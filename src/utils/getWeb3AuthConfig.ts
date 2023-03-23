import { CHAIN_NAMESPACES } from "@web3auth/base";

function getChainConfig(chainId: number) {
  let rpcTarget: string;
  switch (chainId) {
    case 5:
      rpcTarget = process.env.NEXT_PUBLIC_ALCHEMY_GOERLI_API_URL!;
      break;
    case 100:
      rpcTarget = "https://rpc.gnosischain.com";
      break;
    case 10200:
      rpcTarget = "https://rpc.chiadochain.net";
      break;
    default:
      rpcTarget = process.env.NEXT_PUBLIC_ALCHEMY_GOERLI_API_URL!;
  }

  return {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: `0x${chainId.toString(16)}`,
    rpcTarget: rpcTarget,
  };
}

export function getWeb3AuthConfig(chainId: number) {
  return {
    chainConfig: getChainConfig(chainId),
    clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID!,
    enableLogging: false,
  };
}
