import React, { Fragment } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { SignIn } from "../components/SignIn";

import { Account } from "../components";

function Page() {
  const { isConnected, connector } = useAccount();

  console.log("isConnected", isConnected);

  return (
    <Fragment>
      <SignIn />
      {isConnected && <Account />}
      <button onClick={() => connector?.disconnect()}>Click</button>
    </Fragment>
  );
  // return (
  //   <>
  //     <h1>wagmi + RainbowKit + Next.js</h1>

  //     <ConnectButton />
  //     {isConnected && <Account />}
  //   </>
  // );
}

export default Page;
