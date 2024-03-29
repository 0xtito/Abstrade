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
import { Spinner } from "./Spinner";

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

  const { open, setOpen, orderInfo, setConfirmed, isSell, setTx } = props;
  const [token, xDai] = orderInfo.pair.split("/");
  const [showLoading, setShowLoading] = useState(false);

  const tokenAddress =
    assetContractAddresses[token as keyof typeof assetContractAddresses];

  const xDaiAddress = ethers.constants.AddressZero;

  const cancelButtonRef = useRef(null);

  const formatNumber = (str: string | number, dig: number) => {
    const num = Number(str);
    if (num >= (10 ^ (dig - 1))) {
      return Math.round(num).toString();
    } else {
      return num.toPrecision(dig);
    }
  };

  const handleValueShown = (key: string) => {
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
    const ogProvider = provider.originalProvider;
    const signer: AASigner = await connector?.getSigner();
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
          50_000, // default value for now (1 hour)
        orderAmount: BigInt(orderInfo.total * 1e18),
        rate: BigInt(Math.round(1e9 / orderInfo.price)), // ASK: why is this 1e9?
      });
    const isPhantom = provider.smartAccountAPI.isPhantom;

    //
    const signedUserOp = await provider.smartAccountAPI.createSignedUserOp({
      target: await provider.getSenderAccountAddress(),
      data: encodedCreateLimitOrder,
      gasLimit: isPhantom ? 100_000 : undefined,
    });
    console.log(`signed user op: ${signedUserOp}`);

    const { maxFeePerGas, maxPriorityFeePerGas } =
      await ogProvider.getFeeData();

    let GAS_SETTINGS = {
      gasLimit: 1_000_000,
      maxFeePerGas: maxFeePerGas
        ? maxFeePerGas
        : ethers.utils.parseUnits("15", "gwei"),
      maxPriorityFeePerGas: maxPriorityFeePerGas
        ? maxPriorityFeePerGas
        : ethers.utils.parseUnits("1", "gwei"),
    };

    if (isPhantom) {
      GAS_SETTINGS = {
        gasLimit: GAS_SETTINGS.gasLimit * 3, // 1000000 failed when creating limit order + create account
        maxFeePerGas: GAS_SETTINGS.maxFeePerGas.mul(3),
        maxPriorityFeePerGas: GAS_SETTINGS.maxPriorityFeePerGas,
      };
    }
    // hard coding tx gas settings for now

    // const ankrProvider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/gnosis');
    const relayerSigner = new ethers.Wallet(
      process.env.NEXT_PUBLIC_RELAYER_KEY!,
      ogProvider
    );

    const tx = await provider.smartAccountAPI.entryPointView
      .connect(relayerSigner) // pretty sure we can connect our filler here instead of the signer
      .handleOps([signedUserOp], relayerSigner.address, GAS_SETTINGS);
    console.log(`tx sent: ${tx.hash}`);
    setTx(tx.hash);
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
                  {!showLoading ? (
                    <Fragment>
                      {" "}
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
                              By clicking confirm, your order will be placed on
                              the Gnosis Chain.
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
                                      {` ${
                                        typeof value === "string"
                                          ? value
                                          : formatNumber(value, 4)
                                      } ${
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
                            setShowLoading(true);
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
                    </Fragment>
                  ) : (
                    <Fragment>
                      <div className="flex flex-col items-center pt-10">
                        <Spinner />
                        <p className="mt-10 text-lg">
                          Transaction processing now...
                        </p>
                      </div>
                    </Fragment>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
