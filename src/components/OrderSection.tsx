// OrderSection.tsx
import React, { useRef, useState, useContext, useEffect } from "react";

import { AssetInputDropdown, PriceInput, AmountInput } from "./";
import { classNames } from "../utils";
import { MainPageContext } from "../contexts/MainPageContext";
import { BigNumber, ethers } from "ethers";
import { useAccount } from "wagmi";
import { AAProvider } from "../interfaces/AAProvider";

import { erc20ABI } from "wagmi";
import PermittableTokenABI from "../contracts/artifacts/PermittableTokenABI.json";
import { assetContractAddresses } from "../utils/constants";

interface OrderSectionProps {
  onSubmit: (
    pair: string,
    price: number,
    amount: number,
    total: number
  ) => void;
  isSell: boolean;
  setIsSell: React.Dispatch<React.SetStateAction<boolean>>;
}

export function OrderSection({
  onSubmit,
  isSell,
  setIsSell,
}: OrderSectionProps) {
  const { connector, isConnected } = useAccount();
  const { asset } = useContext(MainPageContext);
  const { selectedAsset, setSelectedAsset } = asset;
  const [price, setPrice] = useState<string>("");
  const [amountToPurchase, setAmountToPurchase] = useState<string>("");
  const [xDAIBalance, setxDAIBalance] = useState<string>("");
  const [tokenBalance, setTokenBalance] = useState<string>("");

  useEffect(() => {
    const handleBalance = async () => {
      if (!connector) return;
      const provider: AAProvider = await connector.getProvider();
      const xDAIBalance = await provider.getBalance(
        await provider.smartAccountAPI.getAccountAddress()
      );
      const xDAIBalanceInEth = ethers.utils.formatEther(xDAIBalance);

      const assetAddress =
        assetContractAddresses[
          selectedAsset.name as keyof typeof assetContractAddresses
        ];
      let tokenType;
      // meh way to do this
      if (selectedAsset.name === "GNO") {
        tokenType = "PermittableToken";
      } else {
        tokenType = "ERC20";
      }

      const erc20Contract = new ethers.Contract(
        assetAddress,
        tokenType === "ERC20" ? erc20ABI : PermittableTokenABI,
        provider
      );

      const tokenBalance: BigNumber = await erc20Contract.balanceOf(
        await provider.smartAccountAPI.getAccountAddress()
      );

      const tokenBalanceInEth = ethers.utils.formatEther(tokenBalance);
      setTokenBalance(tokenBalanceInEth);
      setxDAIBalance(xDAIBalanceInEth);
    };
    if (isConnected && connector) {
      handleBalance();
    } else {
      setTokenBalance("");
      setxDAIBalance("");
    }
  }, [isConnected, selectedAsset]);

  const handleSubmit = () => {
    const total = parseFloat(price) * parseFloat(amountToPurchase);

    onSubmit(
      `${selectedAsset.name}/xDAI`,
      parseFloat(price),
      parseFloat(amountToPurchase),
      total
    );
  };

  //   border-1 border-gray-200 rounded-lg p-4 shadow-2xl sm:mx-auto sm:w-full sm:max-w-md

  return (
    <div className=" rounded-lg p-4 bg-white shadow ring-1 ring-black ring-opacity-5">
      <div className="flex place-content-center">
        <span className="isolate inline-flex rounded-md shadow-sm place-content-center">
          <button
            type="button"
            className={classNames(
              !isSell
                ? "relative inline-flex items-center rounded-l-md bg-green-300 px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-10"
                : "relative inline-flex items-center rounded-l-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
            )}
            onClick={() => setIsSell(false)}
          >
            Buy
          </button>

          <button
            type="button"
            className={classNames(
              isSell
                ? "relative inline-flex -ml-px items-center rounded-r-md bg-red-300 px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-10"
                : "relative inline-flex -ml-px items-center rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
            )}
            onClick={() => setIsSell(true)}
          >
            Sell
          </button>
        </span>
      </div>

      <div className="mt-4">
        <AssetInputDropdown />
      </div>
      <div className="mt-4">
        <PriceInput
          price={price}
          setPrice={setPrice}
          xDAIBalance={xDAIBalance}
        />
      </div>
      <div className="mt-4">
        <AmountInput
          amount={amountToPurchase}
          setAmount={setAmountToPurchase}
          tokenBalance={tokenBalance}
        />
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        className="mt-6 w-full px-4 py-2 font-semibold text-white bg-logo-blue rounded-lg shadow-md hover:bg-blue-500 focus:bg-blue-700 focus:ring-logo-blue focus:ring-opacity-75"
      >
        {isSell ? "Submit Sell Order" : "Submit Buy Order"}
      </button>
    </div>
  );
}
