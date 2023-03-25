import { Fragment, MutableRefObject, useContext } from "react";
import { MainPageContext } from "../contexts/MainPageContext";

interface AmountInputProps {
  amount: string;
  setAmount: React.Dispatch<React.SetStateAction<string>>;
  tokenBalance: string;
}

export function AmountInput(props: AmountInputProps) {
  const { amount, setAmount, tokenBalance } = props;
  const { asset } = useContext(MainPageContext);
  const { selectedAsset } = asset;

  const regex = /^\d*\.?\d*$/;

  return (
    <Fragment>
      <div className="flex justify-between items-end">
        <label
          htmlFor="price"
          className="block text-sm font-medium leading-6 text-gray-900"
          onClick={(e) => e.preventDefault()}
        >
          Amount
        </label>
        <p className="relative text-xs text-gray-500">
          {tokenBalance ? tokenBalance : ""}
        </p>
      </div>
      <div className="relative mt-2 rounded-md shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"></div>
        <input
          type="text"
          name="amount"
          id="amount"
          value={amount ? amount : ""}
          onChange={(e) =>
            regex.test(e.target.value) ? setAmount(e.target.value) : null
          }
          className="block w-full rounded-md border-0 py-1.5 pl-7 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="0"
          aria-describedby="price-currency"
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <span className="text-gray-500 sm:text-sm" id="price-currency">
            {selectedAsset.name}
          </span>
        </div>
      </div>
    </Fragment>
  );
}
