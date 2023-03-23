import React from "react";

import { classNames, configureDate } from "../utils";

const ordersInfo = [
  {
    date: configureDate(new Date()),
    pair: "BTC/xDAI",
    // type: "Limit",
    price: 27500,
    amount: 0.4,
    total: 27500 * 0.4,
    status: "Open",
  },
  {
    date: configureDate(new Date()),
    pair: "ETH/xDAI",
    // type: "Limit",
    price: 1700,
    amount: 0.4,
    total: 1700 * 0.4,
    status: "Open",
  },
  {
    date: configureDate(new Date()),
    pair: "GNO/xDAI",
    // type: "Limit",
    price: 106.2,
    amount: 1.5,
    total: 106.2 * 1.5,
    status: "Open",
  },
  {
    date: configureDate(new Date()),
    pair: "ETH/xDAI",
    // type: "Limit",
    price: 1750,
    amount: 0.4,
    total: 1750 * 0.4,
    status: "Fulfilled",
  },
  {
    date: configureDate(new Date()),
    pair: "GNO/xDAI",
    // type: "Limit",
    price: 104.2,
    amount: 3.5,
    total: 104.2 * 3.5,
    status: "Fulfilled",
  },
  {
    date: configureDate(new Date()),
    pair: "ETH/xDAI",
    // type: "Limit",
    price: 1720,
    amount: 0.4,
    total: 0,
    status: "Canceled",
  },
];

const tabs = [
  { name: "All" },
  { name: "Open" },
  { name: "Fulfilled" },
  { name: "Canceled" },
];

export function PositionsSection() {
  const [displayOrderType, setDisplayOrderType] = React.useState<{
    name: string;
  }>(tabs[0]);

  return (
    <div className="px-4 py-8">
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
        <div className="hidden sm:block">
          <nav className="flex space-x-4" aria-label="Tabs">
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
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Pair
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
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody
                  key={displayOrderType.name}
                  className="divide-y divide-gray-200 bg-white"
                >
                  {ordersInfo
                    .filter((order) =>
                      displayOrderType.name == "All"
                        ? true
                        : order.status == displayOrderType.name
                    )
                    .map((person) => (
                      <tr key={person.price}>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {person.date}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {person.pair}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {person.price}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {person.amount}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {person.total}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          {person.status == "Open" ? (
                            <a
                              href="#"
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Cancel
                              <span className="sr-only">, {person.pair}</span>
                            </a>
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
