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
}

export function ConfirmOrderModal(props: ConfirmOrderProps) {
  const { connector, address } = useAccount();

  const { open, setOpen, orderInfo, setConfirmed } = props;

  const cancelButtonRef = useRef(null);

  const handleSubmitOrder = async () => {
    if (!connector) {
      console.log("need to sign in");
      return;
    }

    const provider: AAProvider = await connector.getProvider();
    const signer: AASigner = await connector?.getSigner();
    // signing with the ogSigner, not the AASigner - there are some bugs in the AASigner that aren't a priority to fix right now
    const ogSigner = signer.originalSigner;

    const privKey = process.env.NEXT_PUBLIC_TEST_WALLET_PRIV_KEY!;
    const wallet = new ethers.Wallet(privKey, provider);

    // not using the limit order account *yet*
    const ILimitOrderAccount = new ethers.utils.Interface(
      LimitOrderAccount.abi
    );

    const LimitOrderContract = new ethers.Contract(
      "0xFC91b8fb88d54a17Ba4BC2f526Fc1449f3dC9934",
      LimitOrderAccount.abi,
      wallet
    );

    // We will need to either send xDAI to the conterfactual address before the account is created so it can pay for gas
    // or we call the addDeposit() function on the entry point passing in the counterfactual address so it can will already have
    // enough gas to pay for the the account creation and first transaction

    // const encodedExecute = await provider.smartAccountAPI.encodeExecute({
    //   target: address as string,
    //   value: "100",
    //   data: "0x",
    // });

    // const signedUserOp = await provider.smartAccountAPI.createSignedUserOp({
    //   target: "0x361Da2Ca3cC6C1f37d2914D5ACF02c4D2cCAC43b",
    //   value: "100",
    //   data: encodedExecute,
    // });

    const encodedCreateLimitOrder =
      await provider.smartAccountAPI.encodeCreateLimitOrder({
        tokenOut: ethers.constants.AddressZero,
        tokenIn: "0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1",
        expiry: (await provider.getBlockNumber()) + 1000,
        orderAmount: BigInt(0.001 * 1e18),
        rate: BigInt(Math.round(1e9 / 1700)),
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

    const GAS_SETTINGS = {
      gasLimit: 1500000, // 1000000 failed when creating limit order + create account
      maxFeePerGas: ethers.utils.parseUnits("3", "gwei"),
      maxPriorityFeePerGas: ethers.utils.parseUnits("1", "gwei"),
    };

    const tx = await provider.smartAccountAPI.entryPointView
      .connect(ogSigner)
      .handleOps(
        [signedUserOp],
        "0x68Ca0dE1C234C510b4AB4297725fe88c5A7a5bc1",
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
                      Order
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        You are about to place a limit order. Confirm the order
                        info below, and click confirm to place the order.
                      </p>
                      <div className="bg-white shadow sm:rounded-lg mt-4 p-4">
                        {Object.entries(orderInfo).map(
                          ([key, value], index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center"
                            >
                              <div className="text-sm font-semibold text-gray-700 capitalize">
                                {key}
                              </div>
                              <div className="text-sm text-gray-500">
                                {value}
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
