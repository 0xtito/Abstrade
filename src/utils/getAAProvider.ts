import { Signer } from "ethers";
// import { wrapProvider } from "@account-abstraction/utils";
import { Web3AuthConfig } from "../interfaces";
import { JsonRpcProvider } from "@ethersproject/providers";
import { SafeEventEmitterProvider } from "@web3auth/base";
import {
  SimpleAccountFactory,
  SimpleAccount__factory,
  SimpleAccountFactory__factory,
  SimpleAccount,
  EntryPoint__factory,
} from "@account-abstraction/contracts";

import { ClientConfig } from "../interfaces";

import { SimpleAccountAPI } from "./SimpleAccountAPI";
import { CustomHttpRpcClient } from "../interfaces/CustomHttpRpcClient";
import { AAProvider } from "../interfaces/AAProvider";

type AccountParams = {
  projectId: string; // fill this with random characters
  owner: Signer;
  rpcProviderUrl?: string;
  // bundlerUrl?: string;
  factoryAddress?: string;
  // hooks?: Hooks;
  disconnect?: () => Promise<any>;
};

import {
  entryPointAddress,
  simpleAccountFactoryAddress,
  simpleAccountAddress,
  simpleAccountFactoryAddressGoerli,
} from "./constants";

/**
 * wrap a provider with an account abstraction provider (AAProvider)
 * @note ZeroDev's SDK created this method to wrap the provider, but they
 *  have it configured to only work for their ZeroDevProvider
 */
async function wrapProvider(
  simpleProvider: JsonRpcProvider,
  aaConfig: ClientConfig,
  owner: Signer
) {
  // const entryPoint = EntryPoint__factory.connect(
  //   aaConfig.entryPointAddress,
  //   simpleProvider
  // );
  const chainId = await owner.getChainId();
  const ownerAddress = await owner.getAddress();

  const simpleAccountAPI = new SimpleAccountAPI({
    provider: simpleProvider,
    entryPointAddress: aaConfig.entryPointAddress,
    factoryAddress: aaConfig.accountFactoryAddress,
    owner: owner,
  });

  const customHttpRpcClient = new CustomHttpRpcClient(
    aaConfig.entryPointAddress,
    chainId,
    simpleProvider,
    owner
  );

  return await new AAProvider(
    chainId,
    aaConfig,
    owner,
    simpleProvider,
    customHttpRpcClient,
    entryPointAddress,
    simpleAccountAPI
  ).init();
}

export async function getAAProvider(params: AccountParams, chainId: number) {
  const provider = new JsonRpcProvider(params.rpcProviderUrl);
  // console.log("params passed into getAAProvider", params);
  console.log("chainId passed into getAAProvider", chainId);
  const aaConfig = {
    projectId: params.projectId,
    chainId: chainId,
    entryPointAddress: entryPointAddress,
    accountFactory: simpleAccountAddress, // should be
    // walletAddress: await params.owner.getAddress(),
    accountFactoryAddress: simpleAccountFactoryAddress,
    owner: params.owner,
  };
  const aaProvider = await wrapProvider(provider, aaConfig, params.owner);

  return aaProvider;
}

// async function getZeroDevProvider(params) {
//     const chainId = await api.getChainId(params.projectId, constants.BACKEND_URL);
//     const provider = new ethers_1.ethers.providers.JsonRpcProvider(params.rpcProviderUrl || (0, utils_1.getRpcUrl)(chainId));
//     const aaConfig = {
//         projectId: params.projectId,
//         chainId: chainId,
//         entryPointAddress: constants.ENTRYPOINT_ADDRESS,
//         bundlerUrl: params.bundlerUrl || constants.BUNDLER_URL[chainId],
//         paymasterAPI: new paymaster_1.VerifyingPaymasterAPI(params.projectId, constants.PAYMASTER_URL, chainId),
//         accountFactoryAddress: params.factoryAddress || constants.ACCOUNT_FACTORY_ADDRESS,
//         hooks: params.hooks,
//         walletAddress: params.address
//     };
//     const aaProvider = await (0, Provider_1.wrapProvider)(provider, aaConfig, params.owner);
//     return aaProvider;
// }
