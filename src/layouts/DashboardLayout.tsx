import React, { useEffect, useRef } from "react";
import { Fragment, useState, createRef } from "react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import {
  Bars3BottomLeftIcon,
  BellIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";

import {
  WalletDropDown,
  WideSidebar,
  OrderSection,
  ConfirmOrderModal,
} from "../components";

import { mainNavigation, assets, userSettingsNav } from "../utils/constants";

import { DashboardLayoutProps } from "../interfaces";
import { classNames } from "../utils";
import { useAccount } from "wagmi";

const fullBarNav = mainNavigation.concat(userSettingsNav);

export function DashboardLayout(props: DashboardLayoutProps) {
  const { isConnected, connector } = useAccount();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarNavigation, setsidearNavigation] = useState(fullBarNav);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [order, setOrder] = useState({
    pair: "",
    price: 0,
    amount: 0,
    total: 0,
  });
  const sidebar = createRef();

  useEffect(() => {
    console.log(connector);
  }, [isConnected]);

  const onSubmit = (
    pair: string,
    price: number,
    amount: number,
    total: number
  ) => {
    setOrder({ pair, price, amount, total });
    setOpenModal(true);
  };

  return (
    <Fragment>
      {/* Order Modal */}
      {openModal && (
        <ConfirmOrderModal
          orderInfo={order}
          setOpen={setOpenModal}
          open={openModal}
          setConfirmed={setConfirmed}
        />
      )}
      <div>
        {/* mobile config */}
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-40 lg:hidden"
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
            </Transition.Child>

            <div className="fixed inset-0 z-40 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white pt-5 pb-4">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                      <button
                        type="button"
                        className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </Transition.Child>
                </Dialog.Panel>
              </Transition.Child>
              <div className="w-14 flex-shrink-0" aria-hidden="true">
                {/* Dummy element to force sidebar to shrink to fit close icon */}
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <WideSidebar
          sidebarExpanded={sidebarExpanded}
          setSidebarExpanded={setSidebarExpanded}
          sidebarNavigation={sidebarNavigation}
          setSidebarNavigation={setsidearNavigation}
          mainNavigation={mainNavigation}
          userSettingsNav={userSettingsNav}
        />

        {/* Search, Wallet, and main section */}
        <div
          className={classNames(
            sidebarExpanded
              ? "flex flex-1 flex-col lg:pl-64"
              : "flex flex-1 flex-col lg:pl-28"
          )}
        >
          <div className="relative top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
            <button
              type="button"
              className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3BottomLeftIcon className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex flex-1 justify-between px-4 sm:px-6">
              <div className="flex flex-1">
                <form className="flex w-full lg:ml-0" action="#" method="GET">
                  <label htmlFor="search-field" className="sr-only">
                    Search
                  </label>
                  <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
                      <MagnifyingGlassIcon
                        className="h-5 w-5"
                        aria-hidden="true"
                      />
                    </div>
                    <input
                      id="search-field"
                      className="block h-full w-full border-transparent py-2 pl-8 pr-3 text-gray-900 focus:border-transparent focus:outline-none focus:ring-0 focus:placeholder:text-gray-400 sm:text-sm"
                      placeholder="Search"
                      type="search"
                      name="search"
                    />
                  </div>
                </form>
              </div>
              <div className="ml-4 flex items-center lg:ml-6">
                <button
                  type="button"
                  className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button>

                <WalletDropDown />
              </div>
            </div>
          </div>
          <div className="relative z-0 flex flex-1 overflow-hidden p-6 ">
            <main className="relative z-0 flex-1 overflow-y-auto focus:outline-none pr-4">
              {props.children}
            </main>
            <aside className="relative hidden w-96 flex-shrink-0 overflow-y-auto lg:flex lg:flex-col px-4">
              <OrderSection onSubmit={onSubmit} />
            </aside>
          </div>
        </div>
      </div>
    </Fragment>
  );
}
