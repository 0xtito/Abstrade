import { createContext } from "react";

import { mainNavigation, assets, userSettingsNav } from "../utils/constants";

import { MainPageContextInterface } from "../interfaces";

// const _mainNavigation = [

const fullBarNav = mainNavigation.concat(userSettingsNav);

export const MainPageContext = createContext<MainPageContextInterface>({
  sidebar: {
    sidebarNavigation: fullBarNav,
    setSidebarNavigation: () =>
      console.log("setsidearNavigation is still the default value"),
  },
  modal: {
    openModal: false,
    setOpenModal: () => console.log("setOpenModal is still the default value"),
  },
  confirmed: {
    confirmed: false,
    setConfirmed: () => console.log("setConfirmed is still the default value"),
  },
  order: {
    order: {
      pair: "",
      price: 0,
      amount: 0,
      total: 0,
    },
    setOrder: () => console.log("setOrder is still the default value"),
  },
  asset: {
    selectedAsset: assets[0],
    setSelectedAsset: () =>
      console.log("setSelectedAsset is still the default value"),
  },
});
