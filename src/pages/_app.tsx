import "../styles/global.css";
import type { AppProps } from "next/app";
import NextHead from "next/head";
import React, { useEffect } from "react";
import { WagmiConfig } from "wagmi";

import { client } from "../wagmi";

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }
  return (
    <WagmiConfig client={client}>
      <NextHead>
        <title>Abstrade</title>
      </NextHead>

      {mounted && <Component {...pageProps} />}
    </WagmiConfig>
  );
}
