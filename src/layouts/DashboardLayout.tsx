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
  Notification,
} from "../components";

import { mainNavigation, assets, userSettingsNav } from "../utils/constants";

import { getLimitOrders } from "../utils/handleGetLimitOrders";

import { DashboardLayoutProps } from "../interfaces";
import { classNames } from "../utils";
import { useAccount } from "wagmi";
import { AAProvider } from "../interfaces/AAProvider";
import { ethers } from "ethers";
import { useOrderFulfilledListener } from "../hooks/useOrderFulfilledListener";
import { useOrderCreatedListener } from "../hooks/useOrderCreatedListener";
import Banner from "../components/Banner";

const fullBarNav = mainNavigation.concat(userSettingsNav);

export function DashboardLayout(props: DashboardLayoutProps) {
  const { isConnected, connector, address } = useAccount();
  // const userAddress = _address
  //   ? (_address as string) || ("" as string)
  //   : undefined; // hacky away to get around the type being `0x${string}'
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile config
  const [sidebarNavigation, setSidebarNavigation] = useState(fullBarNav); // config navigation
  const [openModal, setOpenModal] = useState(false); // config modal
  const [confirmed, setConfirmed] = useState(false); // config if order is confirmed
  const [isSell, setIsSell] = useState(false); // config if order is sell or buy
  const [order, setOrder] = useState({
    pair: "",
    price: 0,
    amount: 0,
    total: 0,
  }); // config order details
  const [tx, setTx] = useState<string>("");
  const [orderCreated, setOrderCreated] = useState<boolean>(false);
  const [orderFulfilled, setOrderFulfilled] = useState<boolean>(false);

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
          isSell={isSell}
          setTx={setTx}
        />
      )}
      {/* Order FulfilledNotification */}
      {orderCreated && (
        <Notification
          orderCreated={orderCreated}
          setOrderCreated={setOrderCreated}
          tx={tx}
        />
      )}
      {orderFulfilled && (
        <Notification
          orderFulfilled={orderFulfilled}
          setOrderFulfilled={setOrderFulfilled}
          tx={tx}
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
          sidebarNavigation={sidebarNavigation}
          setSidebarNavigation={setSidebarNavigation}
          mainNavigation={mainNavigation}
          userSettingsNav={userSettingsNav}
        />

        {/* Search, Wallet, and main section */}
        <div className="flex flex-1 flex-col lg:pl-64">
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
              <div className="flex flex-1"></div>
              <div className="ml-4 flex items-center lg:ml-6">
                <button
                  type="button"
                  className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                ></button>

                <WalletDropDown />
              </div>
            </div>
          </div>
          <Banner />

          <div className="relative z-0 flex flex-1 overflow-hidden p-6 ">
            <main className="relative z-0 flex-1 overflow-y-auto focus:outline-none pr-4">
              {props.children}
            </main>
            <aside className="relative hidden w-96 flex-shrink-0 overflow-y-auto lg:flex lg:flex-col px-4">
              <OrderSection
                onSubmit={onSubmit}
                isSell={isSell}
                setIsSell={setIsSell}
              />
            </aside>
          </div>
        </div>
      </div>
    </Fragment>
  );
}
