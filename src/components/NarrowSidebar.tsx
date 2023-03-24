import { Fragment, forwardRef, ForwardedRef } from "react";
import Image from "next/image";
import AbstradeLogo from "../static/images/abstrade-v2-light-only-logo.png";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

import { classNames } from "../utils";
import { Divider } from "./Divider";
import { SidebarNavigationProps } from "../interfaces";
import { handleSideBarToggle } from "../utils";

export const NarrowSidebar = forwardRef(
  (props: SidebarNavigationProps, ref: ForwardedRef<HTMLDivElement>) => {
    const {
      sidebarNavigation,
      setSidebarExpanded,
      mainNavigation,
      sidebarExpanded,
      setSidebarNavigation,
      userSettingsNav,
    } = props;

    const handleNavItemName = (name: string) => {
      switch (name) {
        case "Fiat On-ramp":
          return "Deposit";
        case "Place Orders":
          return "Trade";
        default:
          return name;
      }
    };

    return (
      <div ref={ref} className="flex h-full lg:fixed  lg:flex">
        <div className="hidden w-28 overflow-y-auto bg-gray-800 md:block">
          <div className="flex w-full flex-col items-center pb-6">
            <div className="absolute inset-y-0 md:static md:flex-shrink-0 bg-gray-700 w-28 place-content-center">
              <Image
                className="h-16 w-auto mx-auto"
                src={AbstradeLogo}
                alt="Abstrade"
              />
            </div>
            <div className="mt-1 w-full flex-1 space-y-1 px-2">
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
                    className={classNames(
                      item.current
                        ? "bg-gray-900 text-white"
                        : "text-gray-400 hover:bg-gray-700",
                      "group flex w-full flex-col items-center rounded-md py-2 px-3 text-xs font-medium"
                    )}
                    onClick={() =>
                      handleSideBarToggle({
                        item,
                        sidebarNavigation,
                        setSidebarNavigation,
                      })
                    }
                    aria-current={item.current ? "page" : undefined}
                  >
                    <item.icon
                      className={classNames(
                        item.current
                          ? "text-white"
                          : "text-gray-400 hover:bg-gray-700 group-hover:text-white",
                        "h-6 w-6"
                      )}
                      aria-hidden="true"
                    />
                    <span className="mt-2">{handleNavItemName(item.name)}</span>
                  </a>
                ))}
            </div>
            <Divider
              Icon={sidebarExpanded ? ChevronLeftIcon : ChevronRightIcon}
              setSidebarExpanded={setSidebarExpanded}
              sidebarExpanded={sidebarExpanded}
            />
            <div className="mt-1 w-full flex-1 space-y-1 px-2">
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
                    href={item.href}
                    className={classNames(
                      item.current
                        ? "bg-gray-900 text-white"
                        : "text-gray-400 hover:bg-gray-700",
                      "group flex w-full flex-col items-center rounded-md py-2 px-3 text-xs font-medium"
                    )}
                    onClick={() =>
                      handleSideBarToggle({
                        item,
                        sidebarNavigation,
                        setSidebarNavigation,
                      })
                    }
                    aria-current={item.current ? "page" : undefined}
                  >
                    <item.icon
                      className={classNames(
                        item.current
                          ? "text-white"
                          : "text-gray-400 hover:bg-gray-700 group-hover:text-white",
                        "h-6 w-6"
                      )}
                      aria-hidden="true"
                    />
                    <span className="mt-2">{item.name}</span>
                  </a>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
);
