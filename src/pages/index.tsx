import React, { Fragment, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useConnect } from "wagmi";
import { SignIn } from "../components/SignIn";

import { Account } from "../components";

function Page() {
  const { isConnected, connector } = useAccount();
  const { connect, connectors } = useConnect();

  console.log("isConnected", isConnected);

  useEffect(() => {
    console.log(connector);
  });

  return (
    <Fragment>
      <SignIn />
      {<Account />}
      <button onClick={() => connector?.disconnect()}>
        {isConnected ? "disconnect" : ""}
      </button>
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
