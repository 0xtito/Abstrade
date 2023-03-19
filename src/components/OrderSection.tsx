// OrderSection.tsx
import React, { useState } from "react";

interface OrderSectionProps {
  assets: string[];
  onSubmit: (asset: string, price: number, amount: number) => void;
}

export const OrderSection: React.FC<OrderSectionProps> = ({
  assets,
  onSubmit,
}) => {
  const [selectedAsset, setSelectedAsset] = useState(assets[0]);
  const [price, setPrice] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = () => {
    onSubmit(selectedAsset, parseFloat(price), parseFloat(amount));
  };

  //   border-1 border-gray-200 rounded-lg p-4 shadow-2xl sm:mx-auto sm:w-full sm:max-w-md

  return (
    <div className="border-1 border-gray-200 rounded-lg p-4 bg-white">
      <div>
        <label
          htmlFor="asset"
          className="block text-sm font-medium text-gray-700"
        >
          Asset
        </label>
        <select
          id="asset"
          value={selectedAsset}
          onChange={(e) => setSelectedAsset(e.target.value)}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base text-gray-700"
        >
          {assets.map((asset) => (
            <option key={asset} value={asset}>
              {asset}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4">
        <label
          htmlFor="price"
          className="block text-sm font-medium text-gray-700"
        >
          Price
        </label>
        <input
          type="number"
          id="price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base text-gray-700"
        />
      </div>
      <div className="mt-4">
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-700"
        >
          Amount
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base text-gray-700"
        />
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        className="mt-6 w-full px-4 py-2 font-semibold text-white bg-indigo-500 rounded-lg shadow-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75"
      >
        Submit Order
      </button>
    </div>
  );
};
