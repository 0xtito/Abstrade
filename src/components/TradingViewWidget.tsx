import React, { useEffect, useRef } from "react";
import { EffectCallback } from "react";
import { createChart, ColorType } from "lightweight-charts";

let tvScriptLoadingPromise = null;

// type EffectCallback = () => void | Destructor;

interface ChartProps {
  data: any;
  colors?: {
    backgroundColor?: string;
    lineColor?: string;
    textColor?: string;
    areaTopColor?: string;
    areaBottomColor?: string;
  };
}

/**
 * STILL NEED TO CONFIGURE THIS COMPONENT
 */
export function TradingViewWidget(props: ChartProps) {
  const {
    data,
    colors: {
      backgroundColor = "white",
      lineColor = "#2962FF",
      textColor = "black",
      areaTopColor = "#2962FF",
      areaBottomColor = "rgba(41, 98, 255, 0.28)",
    } = {},
  } = props;

  const chartContainer = document.createElement("div");
  chartContainer.id = "chart";
  const chartContainerRef = useRef<HTMLDivElement>(chartContainer);
  // const jsxChart = <div></div>
  // const mainChart = document.createElement("div");

  useEffect(() => {
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      height: 300,
    });
    chart.timeScale().fitContent();

    const newSeries = chart.addAreaSeries({
      lineColor,
      topColor: areaTopColor,
      bottomColor: areaBottomColor,
    });
    newSeries.setData(data);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);

      chart.remove();
    };
  }, [
    data,
    backgroundColor,
    lineColor,
    textColor,
    areaTopColor,
    areaBottomColor,
  ]);

  return <div className="flex min-w-fit" ref={chartContainerRef} />;
}
