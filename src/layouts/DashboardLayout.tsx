import React, { useRef } from "react";
import { Fragment, useState, createRef } from "react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import {
  Bars3BottomLeftIcon,
  BellIcon,
  FolderIcon,
  HomeIcon,
  XMarkIcon,
  Squares2X2Icon,
  CubeIcon,
  CurrencyDollarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import Image from "next/image";

import {
  WalletDropDown,
  Divider,
  WideSidebar,
  NarrowSidebar,
  OrderSection,
} from "../components";
// import AbstradeLogo from "../static/images/abstrade_logo_light.png";
import AbstradeLogo from "../static/images/abstrade-v2-light.png";
import { BarNavItem, DashboardLayoutProps } from "../interfaces";
import { classNames } from "../utils";

const assets = ["ETH", "BTC"];

const mainNavigation = [
  { name: "Home", href: "#", icon: HomeIcon, current: false },
  { name: "Dashboard", href: "#", icon: Squares2X2Icon, current: true },
  { name: "Place Orders", href: "#", icon: FolderIcon, current: false },
  { name: "Orders", href: "#", icon: CubeIcon, current: false },
  { name: "Fiat On-ramp", href: "#", icon: CurrencyDollarIcon, current: false },
];
const userSettingsNav = [
  { name: "Settings", href: "#", icon: CogIcon, current: false },
  {
    name: "Log Out",
    href: "#",
    icon: ArrowRightOnRectangleIcon,
    current: false,
  },
];
const fullBarNav = mainNavigation.concat(userSettingsNav);
console.log(fullBarNav);

const userNavigation = [
  { name: "Your Profile", href: "#" },
  { name: "Settings", href: "#" },
  { name: "Sign out", href: "#" },
];

const onSubmit = (asset: string, price: number, amount: number) => {
  console.log(asset, price, amount);
};

export function DashboardLayout(props: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarNavigation, setsidearNavigation] = useState(fullBarNav);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const sidebar = createRef();
  // const handleSideBarToggle = (item: BarNavItem) => {
  //   const newNav = barNavigation.map((_item) => {
  //     _item.current = false;
  //     if (item.name == _item.name) _item.current = true;
  //     return _item;
  //   });
  //   console.log(newNav);
  //   // item.current = true;
  //   setBarNavigation(newNav);
  // };

  return (
    <Fragment>
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

        {/* Make a sidebar that can expand, compress. Giving users more room to work with, helpful for our design as well*/}

        {/* Static sidebar for desktop */}
        {/* <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col"> */}
        {/* {sidebarExpanded ? (
          <WideSidebar
            sidebarExpanded={sidebarExpanded}
            setSidebarExpanded={setSidebarExpanded}
            sidebarNavigation={sidebarNavigation}
            setSidebarNavigation={setsidearNavigation}
            mainNavigation={mainNavigation}
            userSettingsNav={userSettingsNav}
          />
        ) : (
          <NarrowSidebar
            sidebarExpanded={sidebarExpanded}
            setSidebarExpanded={setSidebarExpanded}
            sidebarNavigation={sidebarNavigation}
            setSidebarNavigation={setsidearNavigation}
            mainNavigation={mainNavigation}
            userSettingsNav={userSettingsNav}
          />
        )} */}
        <Transition.Root show={sidebarExpanded} as={Fragment}>
          <Transition.Child
            as={WideSidebar}
            ref={createRef()} // Pass the ref prop directly
            enter="transform transition duration-300"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition duration-300"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
            sidebarExpanded={sidebarExpanded}
            setSidebarExpanded={setSidebarExpanded}
            sidebarNavigation={sidebarNavigation}
            setSidebarNavigation={setsidearNavigation}
            mainNavigation={mainNavigation}
            userSettingsNav={userSettingsNav}
          />
        </Transition.Root>

        <Transition.Root show={!sidebarExpanded} as={Fragment}>
          <Transition.Child
            as={NarrowSidebar}
            ref={createRef()} // Pass the ref prop directly
            enter="transform transition duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition duration-300"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
            sidebarExpanded={sidebarExpanded}
            setSidebarExpanded={setSidebarExpanded}
            sidebarNavigation={sidebarNavigation}
            setSidebarNavigation={setsidearNavigation}
            mainNavigation={mainNavigation}
            userSettingsNav={userSettingsNav}
          />
        </Transition.Root>

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
            <aside className="relative hidden w-96 flex-shrink-0 overflow-y-auto xl:flex xl:flex-col px-4">
              <OrderSection assets={assets} onSubmit={onSubmit} />
            </aside>
          </div>
        </div>
      </div>
    </Fragment>
  );
}

// <main className="flex-1">
// <div className="p-6">
//   <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//     <h1 className="text-2xl font-semibold text-gray-900">
//       Dashboard
//     </h1>
//   </div>
//   <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 sm:p-6">
//     {/* Your content */}
//     {props.children}
//   </div>
// </div>
// </main>

// sidebar navigation
// {/* <div className="flex flex-shrink-0 items-center px-4">
// <Image
//   className="h-auto w-auto"
//   src={AbstradeLogo}
//   alt="Abstrade"
// />
// </div>
// <div className="mt-5 h-0 flex-1 overflow-y-auto">
// <div>
//   {/* Items above Divider */}
//   <nav className="flex-1 space-y-1 px-2 pb-2">
//     {barNavigation
//       .filter(
//         (item) =>
//           userSettingsNav.findIndex(
//             (_item) => _item.name == item.name
//           ) > -1
//       )
//       .map((item) => (
//         <a
//           key={item.name}
//           href={item.href}
//           className={classNames(
//             item.current
//               ? "bg-gray-100 text-gray-900"
//               : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
//             "group flex items-center rounded-md px-2 py-2 text-sm font-medium"
//           )}
//         >
//           <item.icon
//             className={classNames(
//               item.current
//                 ? "text-gray-500"
//                 : "text-gray-400 group-hover:text-gray-500",
//               "mr-3 h-6 w-6 flex-shrink-0"
//             )}
//             aria-hidden="true"
//           />
//           {item.name}
//         </a>
//       ))}
//   </nav>
//   <Divider
//     Icon={
//       sidebarExpanded ? ChevronLeftIcon : ChevronRightIcon
//     }
//     setSidebarExpanded={setSidebarExpanded}
//   />
//   {/* Items below Divider */}
//   <nav className="flex-1 space-y-1 p-2">
//     {userSettingsNav.map((item) => (
//       <a
//         key={item.name}
//         href={item.href}
//         className={classNames(
//           item.current
//             ? "bg-gray-100 text-gray-900"
//             : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
//           "group flex items-center rounded-md px-2 py-2 text-sm font-medium"
//         )}
//       >
//         <item.icon
//           className={classNames(
//             item.current
//               ? "text-gray-500"
//               : "text-gray-400 group-hover:text-gray-500",
//             "mr-3 h-6 w-6 flex-shrink-0"
//           )}
//           aria-hidden="true"
//         />
//         {item.name}
//       </a>
//     ))}
//   </nav>
// </div>
// </div> */}
