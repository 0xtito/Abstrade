import { Fragment } from "react";
import { Popover, Transition } from "@headlessui/react";
import { useConnect } from "wagmi";

import { findWalletIcon } from "../utils";

export function WalletDropDown({ children }: { children: string }) {
  const { connect, connectors } = useConnect();

  const socialLoginProviders = [
    "google",
    "twitter",
    "github",
    "discord",
    "facebook",
  ];

  return (
    <Popover className="relative">
      <Popover.Button>
        <span className="inline-block font-medium text-indigo-600 hover:text-indigo-500 hover:cursor-pointer">
          {children}
        </span>
      </Popover.Button>

      <Popover.Overlay className="bg-slate-500 " />

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel className="absolute left-1/2 z-10 mt-5 flex w-screen max-w-max -translate-x-1/2 px-4">
          {({ close }) => (
            <div className="w-screen max-w-md flex-auto  overflow-hidden rounded-3xl bg-white text-sm leading-6 shadow-lg ring-1 ring-gray-900/5">
              <div className="p-4">
                {connectors
                  .filter(
                    (x) =>
                      socialLoginProviders.findIndex((id) => id === x.id) === -1
                  )
                  .map((item) => (
                    <div
                      key={item.name}
                      className="group relative flex  items-center align-middle gap-x-6 rounded-lg p-4 hover:bg-gray-50 hover:cursor-pointer"
                      onClick={() => {
                        connect({ connector: item });
                        close();
                      }}
                    >
                      <div className="items-center">
                        <span className="font-semibold text-gray-900 items-center">
                          {item.name}
                          <span className="absolute inset-0" />
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}
