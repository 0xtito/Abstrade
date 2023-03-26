import {
  Fragment,
  useState,
  Dispatch,
  SetStateAction,
  useContext,
} from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

import { classNames } from "../utils";
import { MainPageContext } from "../contexts/MainPageContext";
import { assets } from "../utils/constants";


const positionAssets = [
  {
    id: 0,
    name: "All",
    symbol: "",
  },
  {
    id: 1,
    name: "ETH",
    symbol:
      "https://ethereum.org/static/6b935ac0e6194247347855dc3d328e83/13c43/eth-diamond-black.png",
  },
  {
    id: 2,
    name: "GNO",
    symbol: "https://docs.gnosischain.com/img/tokens/gno.png",
  },
];

interface AssetPositionDropdownProps {
  selectedPositionAsset: { id: number; name: string; symbol: string };
  setSelectedPositionAsset:Dispatch<
    SetStateAction<{ id: number; name: string; symbol: string }>
  >;
}



export function AssetPositionDropdown(props : AssetPositionDropdownProps) {
  const { selectedPositionAsset, setSelectedPositionAsset } = props;
  // const { asset } = useContext(MainPageContext);
  // const [selectedPositionAsset, setSelectedPositionAsset] = useState(assets2[0]);

  return (
    <Listbox value={selectedPositionAsset} onChange={setSelectedPositionAsset}>
      {({ open }) => (
        <div className="flex flex-row">
          <Listbox.Label
            className="block text-sm font-medium leading-6 text-gray-800 pr-2 py-1.5 align-middle"
            onClick={(e) => e.preventDefault()}
          >
            Asset
          </Listbox.Label>
          <div className="relative w-32">
            <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
              <span className="flex items-center">
                {selectedPositionAsset.symbol ? (
                  <img
                    src={selectedPositionAsset.symbol!}
                    alt=""
                    className={classNames(
                      selectedPositionAsset.name === "ETH"
                        ? "h-5 w-3 flex-shrink-0 rounded-full"
                        : "h-5 w-5 flex-shrink-0 rounded-full"
                    )}
                  />
                ) : (
                  ""
                )}
                <span className="ml-3 block truncate">
                  {selectedPositionAsset.name}
                </span>
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {positionAssets.map((asset) => (
                  <Listbox.Option
                    key={asset.id}
                    className={({ active }) =>
                      classNames(
                        active ? "bg-indigo-600 text-white" : "text-gray-900",
                        "relative cursor-default select-none py-2 pl-3 pr-9"
                      )
                    }
                    value={asset}
                  >
                    {({ selected, active }) => (
                      <>
                        <div className="flex items-center">
                          {asset.symbol ? (
                            <img
                              src={asset.symbol}
                              alt=""
                              className={classNames(
                                asset.name === "ETH"
                                  ? "h-5 w-3 flex-shrink-0 rounded-full ml-1"
                                  : "h-5 w-5 flex-shrink-0 rounded-full"
                              )}
                            />
                          ) : (
                            ""
                          )}
                          <span
                            className={classNames(
                              selected ? "font-semibold" : "font-normal",
                              "ml-3 block truncate"
                            )}
                          >
                            {asset.name}
                          </span>
                        </div>

                        {selected ? (
                          <span
                            className={classNames(
                              active ? "text-white" : "text-indigo-600",
                              "absolute inset-y-0 right-0 flex items-center pr-4"
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </div>
      )}
    </Listbox>
  );
}
