import React, { useEffect, useRef, useState } from "react";
import { ethers, BytesLike } from "ethers";
import LimitOrderAccountABI from "../contracts/artifacts/LimitOrderAccount.json";
import EntryPointAccountABI from "../contracts/artifacts/EntryPoint.json";
import { erc20ABI, useAccount } from "wagmi";
import { AAProvider } from "../interfaces/AAProvider";
import { AASigner } from "../interfaces/AASigner";
import { classNames, configureDate } from "../utils";
import { AssetPositionDropdown } from "./AssetPositionDropDown";

interface LimitOrder {
  pair: string;
  type: string;
  price: string;
  amount: string;
  total: string;
  filled: string;
  expiry: string;
  status: string;
  id: number;
}

const tokens = {
  "0x8e5bBbb09Ed1ebdE8674Cda39A0c169401db4252": "WBTC",
  "0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1": "WETH",
  "0x6810e776880c02933d47db1b9fc05908e5386b96": "GNO",
  "0x0000000000000000000000000000000000000000": "xDAI",
};

const tabs = [
  { name: "All" },
  { name: "Open" },
  { name: "Fulfilled" },
  { name: "Cancelled" },
];

const GAS_SETTINGS = {
  gasLimit: 1500000, // 1000000 failed when creating limit order + create account
  maxFeePerGas: ethers.utils.parseUnits("10", "gwei"),
  maxPriorityFeePerGas: ethers.utils.parseUnits("1", "gwei"),
};

export function PositionsSection() {
  const [selectedPositionAsset, setSelectedPositionAsset] = useState({
    id: 0,
    name: "All",
    symbol: "",
  });
  const [limitOrders, setLimitOrders] = useState<LimitOrder[]>([]);
  const [displayOrderType, setDisplayOrderType] = React.useState<{
    name: string;
  }>(tabs[0]);

  const { connector, address, isConnected } = useAccount();

  const ankrProvider = new ethers.providers.JsonRpcProvider(
    "https://rpc.ankr.com/gnosis"
  );
  const relayerSigner = new ethers.Wallet(
    process.env.NEXT_PUBLIC_RELAYER_KEY!,
    ankrProvider
  );

  useEffect(() => {
    if (isConnected) getLimitOrders();
  }, [isConnected]);

  const getLimitOrders = async () => {
    console.log("getting limit orders");

    const provider: AAProvider = await connector?.getProvider();
    const signer: AASigner = await connector?.getSigner();

    // if no SCW deployed return
    if (await provider.smartAccountAPI.checkAccountPhantom()) return;

    const limitOrderAccount = new ethers.Contract(
      address as string,

      LimitOrderAccountABI.abi,
      signer
    );

    const _limitOrders: LimitOrder[] = [];
    //set limit to 100 for now to prevent unbounded loop
    for (let i = 1; i < 50; i++) {
      const limitOrderData = await limitOrderAccount.limitOrders(i);
      console.log(i, limitOrderData);

      // break loop once we get past end of orders
      if (Number(limitOrderData.orderAmount) === 0) {
        break;
      }

      let orderType: string;
      let price: string;
      let tokenOutDecimals: number;
      let tokenInDecimals: number;
      let tokenOutSymbol: string;
      let tokenInSymbol: string;

      if (limitOrderData.tokenOut === ethers.constants.AddressZero) {
        orderType = "Buy";

        tokenOutDecimals = 18;
        tokenOutSymbol = "xDAI";

        const tokenInContract = new ethers.Contract(
          limitOrderData.tokenIn,
          erc20ABI,
          provider
        );
        tokenInSymbol = await tokenInContract.symbol();
        tokenInDecimals = await tokenInContract.decimals();

        price = (
          1 / Number(ethers.utils.formatUnits(limitOrderData.rate, "gwei"))
        ).toString(); //check this for decimals
      } else if (limitOrderData.tokenIn === ethers.constants.AddressZero) {
        orderType = "Sell";

        tokenInDecimals = 18;
        tokenInSymbol = "xDAI";

        const tokenOutContract = new ethers.Contract(
          limitOrderData.tokenOut,
          erc20ABI,
          provider
        );
        tokenOutSymbol = await tokenOutContract.symbol();
        tokenOutDecimals = await tokenOutContract.decimals();

        price = ethers.utils.formatUnits(limitOrderData.rate, "gwei");
      } else {
        console.log("unsupported pairing ignored");
        break;
      }

      let orderStatus: string;

      if (limitOrderData.amount <= limitOrderData.filled) {
        orderStatus = "Fulfilled";
      } else if (limitOrderData.expiry < Date.now() / 1000) {
        orderStatus = "Cancelled";
      } else orderStatus = "Open";

      const limitOrderFormatted: LimitOrder = {
        pair:
          orderType === "Buy"
            ? `${tokenInSymbol}/${tokenOutSymbol}`
            : `${tokenOutSymbol}/${tokenInSymbol}`,
        type: orderType,
        price: formatNumber(price, 4),
        amount: formatNumber(
          ethers.utils.formatEther(limitOrderData.orderAmount),
          4
        ),
        total: formatNumber(
          (
            Number(price) *
            Number(ethers.utils.formatEther(limitOrderData.orderAmount))
          ).toString(),
          4
        ),
        filled: formatNumber(
          limitOrderData.filledAmount
            .div(limitOrderData.orderAmount)
            .mul(100)
            .toString(),
          3
        ),
        expiry: new Date(Number(limitOrderData.expiry) * 1000).toDateString(),
        status: orderStatus,
        id: i,
      };
      _limitOrders.push(limitOrderFormatted);
    }

    setLimitOrders(_limitOrders);
  };

  const cancelLimitOrder = async (e: any) => {
    console.log("cancelling orderId...", e.target.id);
    const provider: AAProvider = await connector?.getProvider();
    const signer: AASigner = await connector?.getSigner();

    const limitOrderAccount = new ethers.Contract(
      address as string,
      LimitOrderAccountABI.abi,
      signer
    );

    const encodedCancelLimitOrder =
      await provider.smartAccountAPI.encodeCancelLimitOrder(
        Number(e.target.id)
      );

    console.log(`encoded cancel limit order: ${encodedCancelLimitOrder}`);

    const signedUserOp = await provider.smartAccountAPI.createSignedUserOp({
      target: await provider.getSenderAccountAddress(),
      data: encodedCancelLimitOrder,
    });
    console.log(`signed user op: ${signedUserOp}`);

    const tx = await provider.smartAccountAPI.entryPointView
      .connect(relayerSigner)
      .handleOps([signedUserOp], relayerSigner.address, GAS_SETTINGS);
    console.log(`tx sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`tx confirmed: ${receipt.transactionHash}`);
  };

  const cancelAllLimitOrders = async () => {
    const idsToCancel: number[] = [];
    const provider: AAProvider = await connector?.getProvider();

    limitOrders.forEach((order) => {
      if (order.status === "Open") {
        idsToCancel.push(order.id);
      }
    });
    
    console.log("idsToCancel:", idsToCancel);
    
    const func : BytesLike[] = [];
    const dest : string[] = [];
    idsToCancel.forEach(async (id) => {
      func.push(await provider.smartAccountAPI.encodeCancelLimitOrder(id));
      dest.push(address as string);
    });
    console.log("func:", func);
    console.log("func.length:", func.length)
    console.log("address:", address)    
    console.log("dest:", dest);
    

    const limitOrderContract = new ethers.Contract(
      address as string,
      LimitOrderAccountABI.abi,
      relayerSigner
    );

    const userOpCalldata = limitOrderContract.interface.encodeFunctionData(
      "executeBatch",
      [dest, func]
    );

    console.log("userOpCalldata:", userOpCalldata);

    const entryPointContract = new ethers.Contract(
      "0x0576a174D229E3cFA37253523E645A78A0C91B57",
      EntryPointAccountABI,
      relayerSigner
    );

    const userOp = {
      sender: address as string,
      nonce: await provider.smartAccountAPI.getNonce(),
      initCode: "0x",
      callData: userOpCalldata,
      callGasLimit: 200000,
      verificationGasLimit: 50000,
      preVerificationGas: "0", //paid to bundler
      maxFeePerGas: ethers.utils.parseUnits("0", "gwei"),
      maxPriorityFeePerGas: ethers.utils.parseUnits("0", "gwei"),
      paymasterAndData: "0x",
      signature: "",
    };

    const signedUserOp = await provider.smartAccountAPI.signUserOp(userOp);

    console.log("signedUserOp:", signedUserOp);

    const tx = await provider.smartAccountAPI.entryPointView
      .connect(relayerSigner)
      .handleOps([signedUserOp], relayerSigner.address, GAS_SETTINGS);
    console.log(`tx sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`tx confirmed: ${receipt.transactionHash}`);
  };

  const formatNumber = (str: string, dig: number) => {
    const num = Number(str);
    if (num >= (10 ^ (dig - 1))) {
      return Math.round(num).toString();
    } else {
      return num.toPrecision(dig);
    }
  };

  return (
    <div className="px-4 py-8 h-fit pb-20">
      <div>
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">
            Select a tab
          </label>
          {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
          <select
            id="tabs"
            name="tabs"
            onChange={(e) => {
              e.preventDefault();
            }}
            className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            defaultValue={displayOrderType.name}
          >
            {tabs.map((tab) => (
              <option key={tab.name}>{tab.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-row justify-between">
          <nav className="space-x-4 w-fit" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                // href={tab.href}
                onClick={(e) => {
                  setDisplayOrderType(tab);
                }}
                className={classNames(
                  tab.name === displayOrderType.name
                    ? "bg-gray-200 text-gray-800"
                    : "text-gray-600 hover:text-gray-800",
                  "rounded-md px-3 py-2 text-sm font-medium"
                )}
                aria-current={
                  displayOrderType.name == tab.name ? "page" : undefined
                }
              >
                {tab.name}
              </button>
            ))}
          </nav>
          <div className="w-fit">
            <AssetPositionDropdown
              selectedPositionAsset={selectedPositionAsset}
              setSelectedPositionAsset={setSelectedPositionAsset}
            />
          </div>
        </div>
      </div>
      <div className="mt-2 flow-root">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Positions
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Total
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Filled
                    </th>

                    <th
                      scope="col"
                      className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
                    >
                      {displayOrderType.name === "Open" ||
                      displayOrderType.name === "All" ? (
                        <button
                          id="cancelAll"
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={(e) => cancelAllLimitOrders()}
                        >
                          Cancel All
                        </button>
                      ) : null}
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody
                  key={displayOrderType.name}
                  className="divide-y divide-gray-200 bg-white"
                >
                  {limitOrders
                    .filter((order) => {
                      if (
                        displayOrderType.name === "All" ||
                        order.status === displayOrderType.name
                      ) {
                        if (
                          selectedPositionAsset.name === "All" ||
                          order.pair.includes(selectedPositionAsset.name)
                        ) {
                          return true;
                        }
                      }
                      return false;
                    })
                    .sort((a, b) => {
                      return Number(a.price) - Number(b.price);
                    })
                    .map((order) => (
                      <tr
                        key={order.id}
                        className={order.status !== "Open" ? "bg-gray-300" : ""}
                      >
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {order.pair} - {order.id}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {order.type}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {order.price}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {order.amount}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {order.total}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {order.filled}%
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          {order.status == "Open" ? (
                            <button
                              id={order.id.toString()}
                              className="text-indigo-600 hover:text-indigo-900"
                              onClick={(e: any) => cancelLimitOrder(e)}
                            >
                              Cancel
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
