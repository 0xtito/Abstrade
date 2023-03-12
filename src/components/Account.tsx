import { useAccount, useEnsName } from "wagmi";

export function Account() {
  const { address } = useAccount();

  return <p>{address}</p>;
}
