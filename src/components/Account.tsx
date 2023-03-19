import { Fragment, useEffect, useState } from "react";
import { useAccount, useEnsName, useConnect } from "wagmi";

export function Account() {
  const { address, connector } = useAccount();
  const [sig, setSig] = useState("");
  const { connect, connectors } = useConnect();

  useEffect(() => {
    console.log(connectors);
  }, []);

  const signMsg = async () => {
    const signer = await connector?.getSigner();
    const msg = await signer?.signMessage("Hello World");
    setSig(msg);
  };

  return (
    <Fragment>
      <h1>Account</h1>
      <p>Address: {address}</p>
      <button type="button" onClick={signMsg}>
        Signed Message
      </button>
      <p>{sig}</p>
    </Fragment>
  );
}
