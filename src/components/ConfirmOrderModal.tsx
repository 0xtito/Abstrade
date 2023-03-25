import {
  Fragment,
  useRef,
  useState,
  Dispatch,
  SetStateAction,
  useContext,
} from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/outline";
import { useAccount } from "wagmi";
import { AAProvider } from "../interfaces/AAProvider";
import { ethers } from "ethers";
import { AASigner } from "../interfaces/AASigner";
import LimitOrderAccount from "../contracts/artifacts/LimitOrderAccount.json";
import { MainPageContext } from "../contexts/MainPageContext";
import { useWaitForTransaction } from "wagmi";

import { assetContractAddresses } from "../utils/constants";

interface ConfirmOrderProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  orderInfo: {
    pair: string;
    price: number;
    amount: number;
    total: number;
  };
  setConfirmed: Dispatch<SetStateAction<boolean>>;
  isSell: boolean;
  setTx: Dispatch<SetStateAction<string>>;
}

export function ConfirmOrderModal(props: ConfirmOrderProps) {
  const { connector, address } = useAccount();

  const { open, setOpen, orderInfo, setConfirmed, isSell } = props;
  const [token, xDai] = orderInfo.pair.split("/");

  const tokenAddress =
    assetContractAddresses[token as keyof typeof assetContractAddresses];

  const xDaiAddress = ethers.constants.AddressZero;

  console.log(tokenAddress);
  const cancelButtonRef = useRef(null);

  const handleValueShown = (key: string) => {
    console.log(key);
    switch (key) {
      case "pair":
        return "";
      case "price":
        return "xDAI";
      case "amount":
        return token;
      case "total":
        return "xDAI";
      default:
        return "";
    }
  };

  const handleSubmitOrder = async () => {
    if (!connector) {
      console.log("need to sign in");
      return;
    }

    const provider: AAProvider = await connector.getProvider();
    const signer: AASigner = await connector?.getSigner();
    // // signing with the ogSigner, not the AASigner - there are some bugs in the AASigner that aren't a priority to fix right now
    const ogSigner = signer.originalSigner;
    console.log(provider.smartAccountAPI.isPhantom);
    /**
     * Depending on lee's test, we will just set the userOp's gasLimit to 0 (not using bundler)
     * @note for now, we will just let it work as in
     */
    const encodedCreateLimitOrder =
      await provider.smartAccountAPI.encodeCreateLimitOrder({
        tokenOut: isSell ? tokenAddress : xDaiAddress,
        tokenIn: isSell ? xDaiAddress : tokenAddress,
        expiry:
          (await provider.getBlock(await provider.getBlockNumber())).timestamp +
          3600, // default value for now (1 hour)
        orderAmount: BigInt(orderInfo.amount * 1e18),
        rate: BigInt(Math.round(1e9 / orderInfo.price)), // ASK: why is this 1e9?
      });
    console.log(`encoded create limit order: ${encodedCreateLimitOrder}`);

    console.log(
      `senderAccontAddress: ${await provider.getSenderAccountAddress()}`
    );

    const signedUserOp = await provider.smartAccountAPI.createSignedUserOp({
      target: await provider.getSenderAccountAddress(),
      data: encodedCreateLimitOrder,
    });
    console.log(`signed user op: ${signedUserOp}`);

    // hard coding tx gas settings for now
    const GAS_SETTINGS = {
      gasLimit: 1500000, // 1000000 failed when creating limit order + create account
      maxFeePerGas: ethers.utils.parseUnits("10", "gwei"),
      maxPriorityFeePerGas: ethers.utils.parseUnits("1", "gwei"),
    };

    const ankrProvider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/gnosis');
    const relayerSigner = new ethers.Wallet(process.env.NEXT_PUBLIC_RELAYER_KEY!, ankrProvider); 

    const tx = await provider.smartAccountAPI.entryPointView
      .connect(ogSigner) // pretty sure we can connect our filler here instead of the signer
      .handleOps(
        [signedUserOp],
        relayerSigner.address,
        GAS_SETTINGS
      );
    console.log(`tx sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`tx confirmed: ${receipt.transactionHash}`);
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={setOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <CheckIcon
                      className="h-6 w-6 text-green-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title
                      as="h3"
                      className="text-base font-semibold leading-6 text-gray-900"
                    >
                      {`${isSell ? "Sell" : "Buy"} Order`}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        By clicking confirm, your order will be placed on the
                        Gnosis Chain.
                      </p>
                      <div className="bg-white shadow sm:rounded-lg mt-4 p-4">
                        {Object.entries(orderInfo).map(
                          ([key, value], index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center py-2"
                            >
                              <div className="text-sm font-semibold text-gray-700 capitalize">
                                {key}
                              </div>
                              <div className="text-sm text-gray-500">
                                {`${value} ${
                                  handleValueShown(key) as string | number
                                }`}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                    onClick={async () => {
                      setConfirmed(true);
                      await handleSubmitOrder();
                      setOpen(false);
                    }}
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                    onClick={() => setOpen(false)}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
