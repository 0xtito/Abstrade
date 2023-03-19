// import { PaymasterAPI } from "@zerodevapp/sdk/dist/src/PaymasterAPI";
// import {
//   SessionProposal,
//   TransactionInfo,
// } from "@zerodevapp/sdk/dist/src/types";
// export interface Hooks {
//   transactionStarted?: (tx: TransactionInfo) => void;
//   transactionConfirmed?: (txHash: string) => void;
//   transactionReverted?: (txHash: string) => void;
//   walletConnectSessionProposal?: (proposal: SessionProposal) => void;
// }
// /**
//  * configuration params for wrapProvider and ZeroDev's ClientConfig
//  * @note there is no active bundler on Gnosis Chain, so we must either create a custom bundler or work without it
//  *     so if there is no bundler, we don't need to include the bundlerUrl in the config
//  *
//  */
// export interface ClientConfig {
//   /**
//    * Needed to track gas usage
//    */
//   projectId: string;
//   /**
//    * the entry point to use
//    */
//   entryPointAddress: string;
//   accountFactoryAddress: string;
//   /**
//    * url to the bundler
//    * @note there is no active bundler on Gnosis Chain, so we must either create a custom bundler or work without it
//    */
//   bundlerUrl?: string;
//   /**
//    * if set, use this pre-deployed wallet.
//    * (if not set, use getSigner().getAddress() to query the "counterfactual" address of wallet.
//    *  you may need to fund this address so the wallet can pay for its own creation)
//    */
//   walletAddress?: string;
//   /**
//    * if set, call just before signing.
//    */
//   paymasterAPI?: PaymasterAPI;
//   /**
//    * hooks are functions invoked during the lifecycle of transactions
//    */
//   hooks?: Hooks;
// }
