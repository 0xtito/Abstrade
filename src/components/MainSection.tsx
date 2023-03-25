import React from "react";

import { TradingViewWidget } from "../components/TradingViewWidget";
import { PositionsSection } from "./PositionsSection";
import { TestChart } from "../components/TestChart";
import { useContext } from "react";

import { MainPageContext } from "../contexts/MainPageContext";

export function MainSection() {
  return (
    <div className="flex flex-col w-full h-full">
      <TestChart />
      <PositionsSection />
    </div>
  );
}
