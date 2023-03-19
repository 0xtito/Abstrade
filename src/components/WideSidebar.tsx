import React, { forwardRef, ForwardedRef } from "react";

import Image from "next/image";
import { Divider } from "../components";
// import AbstradeLogo from "../static/images/abstrade_logo_light.png";
import AbstradeLogo from "../static/images/abstrade-v2-light.png";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

import { classNames } from "../utils";
import { SidebarNavigationProps } from "../interfaces";
import { handleSideBarToggle } from "../utils";

// export function WideSidebar(props: SidebarNavigationProps) {
export const WideSidebar = forwardRef(
  (props: SidebarNavigationProps, ref: ForwardedRef<HTMLDivElement>) => {
    const {
      sidebarExpanded,
      setSidebarExpanded,
      sidebarNavigation,
      setSidebarNavigation,
      mainNavigation,
      userSettingsNav,
    } = props;

    return (
      <div
        ref={ref}
        className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col"
      >
        <div className="flex flex-grow flex-col overflow-y-auto border-r border-gray-200 bg-white">
          <div className="absolute inset-y-0 left-0 md:static md:flex-shrink-0">
            <Image
              height={200}
              className="h-auto w-auto"
              src={AbstradeLogo}
              alt="Abstrade"
            />
          </div>
          <div className="mt-5 flex flex-grow flex-col">
            <div>
              {/* Items above Divider */}
              <nav className="flex-1 space-y-1 px-2 pb-2">
                {sidebarNavigation
                  .filter(
                    (fullBar_item) =>
                      mainNavigation.findIndex((_item) => {
                        console.log(_item.name, fullBar_item.name);
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
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                        "group flex items-center rounded-md px-2 py-2 text-sm font-medium"
                      )}
                    >
                      <item.icon
                        className={classNames(
                          item.current
                            ? "text-gray-500"
                            : "text-gray-400 group-hover:text-gray-500",
                          "mr-3 h-6 w-6 flex-shrink-0"
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </a>
                  ))}
              </nav>
              <Divider
                Icon={sidebarExpanded ? ChevronLeftIcon : ChevronRightIcon}
                setSidebarExpanded={setSidebarExpanded}
                sidebarExpanded={sidebarExpanded}
              />
              {/* Items below Divider */}
              <nav className="flex-1 space-y-1 p-2">
                {sidebarNavigation
                  .filter(
                    (fullBar_item) =>
                      userSettingsNav.findIndex((_item) => {
                        console.log(_item.name, fullBar_item.name);
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
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                        "group flex items-center rounded-md px-2 py-2 text-sm font-medium"
                      )}
                    >
                      <item.icon
                        className={classNames(
                          item.current
                            ? "text-gray-500"
                            : "text-gray-400 group-hover:text-gray-500",
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
);
