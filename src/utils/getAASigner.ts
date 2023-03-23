import { getAAProvider } from "./getAAProvider";
import { AccountParams } from "../interfaces";

export async function getAASigner(params: AccountParams, chainId: number) {
  const provider = await getAAProvider(params, chainId);
  const signer = provider.getSigner();

  return signer;
}
