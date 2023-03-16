import { useAccount, useEnsName } from "wagmi";

export function Account() {
  const { address } = useAccount();
  console.log(address);

  return <p>{address}</p>;
}
