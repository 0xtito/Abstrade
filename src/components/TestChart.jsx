// TradingViewWidget.jsx

import React, { useEffect, useRef, useContext } from "react";
import { Asset } from "../interfaces";
import { MainPageContext } from "../contexts/MainPageContext";

let tvScriptLoadingPromise;

export function TestChart() {
  const onLoadScriptRef = useRef();
  const { asset } = useContext(MainPageContext);
  const { selectedAsset } = asset;
  const { id, symbol } = selectedAsset.tvInfo;

  const [exchange, pair] = symbol.split(":");

  useEffect(() => {
    onLoadScriptRef.current = createWidget;

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement("script");
        script.id = "tradingview-widget-loading-script";
        script.src = "https://s3.tradingview.com/tv.js";
        script.type = "text/javascript";
        script.onload = resolve;

        document.head.appendChild(script);
      });
    }

    tvScriptLoadingPromise.then(
      () => onLoadScriptRef.current && onLoadScriptRef.current()
    );

    return () => (onLoadScriptRef.current = null);

    function createWidget() {
      if (
        document.getElementById(`tradingview_${id}`) &&
        "TradingView" in window
      ) {
        new window.TradingView.widget({
          autosize: true,
          symbol: symbol,
          interval: "D",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          container_id: `tradingview_${id}`,
        });
      }
    }
  }, [asset]);

  // useEffect(() => {}, []);

  return (
    <div className="tradingview-widget-container">
      <div id={`tradingview_${id}`} className="h-96" />
      <div className="tradingview-widget-copyright">
        <a
          href={`https://www.tradingview.com/symbols/${pair}/?exchange=${exchange}`}
        >
          {/* <span className="blue-text">Bitcoin chart</span> */}
        </a>{" "}
        {/* by TradingView */}
      </div>
    </div>
  );
}
