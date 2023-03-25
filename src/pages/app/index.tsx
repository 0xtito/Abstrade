import React from "react";
import { useState, useEffect } from "react";
import { DashboardLayout } from "../../layouts";
import { TradingViewWidget, MainSection } from "../../components";

import { mainNavigation, assets, userSettingsNav } from "../../utils/constants";
import {
  MainPageContext,
  // sidebarNavigation,
  // setsidearNavigation,
  // openModal,
  // setOpenModal,
  // confirmed,
  // setConfirmed,
  // order,
  // setOrder,
  // selectedAsset,
  // setSelectedAsset,
} from "../../contexts/MainPageContext";

const fullBarNav = mainNavigation.concat(userSettingsNav);

// BTC - id: 943e8 / symbol: BINANCE:BTCDAI
// ETH - id: e89cf / symbol: BINANCE:ETHDAI
// GNO - id: 71cc4 / symbol: COINBASE:GNOUSD

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarNavigation, setSidebarNavigation] = useState(fullBarNav);
  // const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [order, setOrder] = useState({
    pair: "",
    price: 0,
    amount: 0,
    total: 0,
  });
  const [selectedAsset, setSelectedAsset] = useState(assets[0]);

  // this will then be used to use inside all the components, and should help with the chart component
  // const MainPageContext = createContext({
  //   sidebar: {
  //     sidebarNavigation,
  //     setsidearNavigation,
  //   },
  //   modal: {
  //     openModal,
  //     setOpenModal,
  //   },
  //   order: {
  //     order,
  //     setOrder,
  //   },
  //   asset: {
  //     selectedAsset,
  //     setSelectedAsset,
  //   },
  // });

  const initialData = [
    { time: "2018-12-22", value: 32.51 },
    { time: "2018-12-23", value: 31.11 },
    { time: "2018-12-24", value: 27.02 },
    { time: "2018-12-25", value: 27.32 },
    { time: "2018-12-26", value: 25.17 },
    { time: "2018-12-27", value: 28.89 },
    { time: "2018-12-28", value: 25.46 },
    { time: "2018-12-29", value: 23.92 },
    { time: "2018-12-30", value: 22.68 },
    { time: "2018-12-31", value: 22.67 },
  ];

  return (
    <MainPageContext.Provider
      value={{
        sidebar: {
          sidebarNavigation,
          setSidebarNavigation,
        },
        modal: {
          openModal,
          setOpenModal,
        },
        confirmed: {
          confirmed,
          setConfirmed,
        },
        order: {
          order,
          setOrder,
        },
        asset: {
          selectedAsset,
          setSelectedAsset,
        },
      }}
    >
      <DashboardLayout>
        <MainSection />
      </DashboardLayout>
    </MainPageContext.Provider>
  );
}
