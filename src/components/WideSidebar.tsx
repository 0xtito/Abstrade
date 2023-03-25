import React, { forwardRef, ForwardedRef } from "react";

import Image from "next/image";
import { Divider } from "../components";
import AbstradeLogo from "../static/images/abstrade-v2-white-letters-no-background.png";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

import { classNames } from "../utils";
import { SidebarNavigationProps } from "../interfaces";
import { handleSideBarToggle } from "../utils";

export function WideSidebar(props: SidebarNavigationProps) {
  const {
    sidebarNavigation,
    setSidebarNavigation,
    mainNavigation,
    userSettingsNav,
  } = props;
  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col ">
      <div className="flex flex-grow flex-col overflow-y-auto border-r bg-gray-800 border-gray-800">
        <div className="flex inset-y-0 left-0 md:static md:flex-shrink-0 place-content-center">
          <Image
            width={230}
            className="h-auto"
            src={AbstradeLogo}
            alt="Abstrade"
          />
        </div>
        <div className="mt-5 flex flex-grow flex-col">
          <div>
            {/* Items above Divider */}
            <nav className="flex-1 bg-gray-800 space-y-1 px-2 pb-2">
              {sidebarNavigation
                .filter(
                  (fullBar_item) =>
                    mainNavigation.findIndex((_item) => {
                      return _item.name == fullBar_item.name;
                    }) > -1
                )
                .map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={() =>
                      handleSideBarToggle({
                        item,
                        sidebarNavigation,
                        setSidebarNavigation,
                      })
                    }
                    className={classNames(
                      item.current
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white",
                      "group flex items-center rounded-md px-2 py-2 text-sm font-medium"
                    )}
                  >
                    <item.icon
                      className={classNames(
                        item.current
                          ? "text-gray-300"
                          : "text-gray-400 group-hover:text-gray-300",
                        "mr-3 h-6 w-6 flex-shrink-0"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </a>
                ))}
            </nav>
            <Divider />
            {/* Items below Divider */}
            <nav className="flex-1 space-y-1 p-2">
              {sidebarNavigation
                .filter(
                  (fullBar_item) =>
                    userSettingsNav.findIndex((_item) => {
                      return _item.name == fullBar_item.name;
                    }) > -1
                )
                .map((item) => (
                  <a
                    key={item.name}
                    onClick={() =>
                      handleSideBarToggle({
                        item,
                        sidebarNavigation,
                        setSidebarNavigation,
                      })
                    }
                    href={item.href}
                    className={classNames(
                      item.current
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white",
                      "group flex items-center rounded-md px-2 py-2 text-sm font-medium"
                    )}
                  >
                    <item.icon
                      className={classNames(
                        item.current
                          ? "text-gray-300"
                          : "text-gray-400 group-hover:text-gray-300",
                        "mr-3 h-6 w-6 flex-shrink-0"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </a>
                ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
