import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { Event } from "ethers/lib/ethers";
import { useAccount } from "wagmi";
import { Connector } from "wagmi";

import LimitOrderAccountJSON from "../contracts/artifacts/LimitOrderAccount.json";
// import { limitOrderAccountAddress } from "../utils/constants";
const WebSocketUrl = process.env.NEXT_PUBLIC_GNOSIS_MAINNET_WS_URL!;

export const useOrderCreatedListener = (
  smartAccountAddress: string
  // connector: Connector<any, any, any> | undefined
) => {
  // const { connector, isConnected } = useAccount();
  const [orderCreated, setOrderCreated] = useState(false);
  const [tx, setTx] = useState("");

  const provider = new ethers.providers.WebSocketProvider(WebSocketUrl);
  const contract = new ethers.Contract(
    smartAccountAddress,
    LimitOrderAccountJSON.abi,
    provider
  );

  const setOrderCreatedListener = useCallback(
    (txToListen: string) => {
      const onOrderCreated = (
        tokenOut: string,
        tokenIn: string,
        expiry: number,
        id: number,
        orderAmount: string,
        filledAmount: string,
        rate: string,
        event: Event
      ) => {
        console.log(
          "event triggered",
          event,
          event.address,
          smartAccountAddress,
          filledAmount,
          orderAmount,
          filledAmount === orderAmount,
          expiry
        );
        if (event.address !== smartAccountAddress || filledAmount === "0") {
          return;
        }
        console.log("tx hash: ", event.transactionHash);
        console.log(`Order ${id} was filled`);
        setOrderCreated(true);
        setTx(event.transactionHash);
      };
      contract.on("UpdateLimitOrder", onOrderCreated);
      // You can add any logic to filter events based on the txToListen

      return () => {
        contract.off("UpdateLimitOrder", onOrderCreated);
      };
    },
    [contract]
  );

  return [orderCreated, setOrderCreated, tx, setOrderCreatedListener] as const;
};
