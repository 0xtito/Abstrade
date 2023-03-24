import React, { Fragment, useEffect, useState } from "react";
import { Transition, Menu } from "@headlessui/react";

import { useAccount, useConnect, useDisconnect } from "wagmi";

const userNavigation = [
  { name: "Profile", href: "/app/user" },
  { name: "Settings", href: "#" },
  { name: "Disconnect", href: "#" },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export function WalletDropDown() {
  const { connector, isConnected, address } = useAccount();
  const [userAddress, setUserAddress] = useState("");
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    setUserAddress(`${address?.slice(0, 6)}...`);
  }, [isConnected]);

  return (
    <Menu as="div" className="relative ml-3">
      <div>
        <Menu.Button className="flex max-w-xs items-center rounded-lg p-2 px-4 bg-sky-500 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2">
          <span className="sr-only">Wallet</span>
          <p className="">{isConnected ? userAddress : "Connect"}</p>
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {!isConnected ? (
            <Fragment>
              {connectors
                .filter((x) => x.ready && x.id !== connector?.id)
                .map((item) => (
                  <Menu.Item key={item.id}>
                    {({ active }) => (
                      <a
                        className={classNames(
                          active ? "bg-gray-100 mr-0 cursor-pointer" : "",
                          "block px-4 py-2 text-sm text-gray-700"
                        )}
                        onClick={() => connect({ connector: item })}
                      >
                        {item.name}
                        {isLoading &&
                          item.id === pendingConnector?.id &&
                          " connecting..."}
                      </a>
                    )}
                  </Menu.Item>
                ))}
            </Fragment>
          ) : (
            <Fragment>
              {userNavigation.map((item) => (
                <Menu.Item key={item.name}>
                  {({ active }) => (
                    <a
                      className={classNames(
                        active ? "bg-gray-100 mr-0 cursor-pointer" : "",
                        "block px-4 py-2 text-sm text-gray-700"
                      )}
                      onClick={() =>
                        item.name == "Disconnect" ? disconnect() : null
                      }
                    >
                      {item.name}
                    </a>
                  )}
                </Menu.Item>
              ))}
            </Fragment>
          )}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
