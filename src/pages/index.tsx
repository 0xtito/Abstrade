import React, { useEffect } from "react";
import { useAccount, useConnect } from "wagmi";
import { SignIn } from "../components/SignIn";
import AbstradeLogo from "../static/images/abstrade-v2-light.png";
import Image from "next/image";
import { Spinner } from "../components/Spinner";
import { useRouter } from "next/router";

function Page() {
  const { isConnected, isConnecting, connector } = useAccount();
  const { connect, connectors } = useConnect();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      router.push("/app");
    }
  }, [isConnected]);

  return (
    <div className="max-h-screen">
      <div className="flex min-h-full flex-col justify-center pt-12 sm:px-6 lg:px-8 ">
        <Image
          className="mx-auto h-auto w-auto"
          src={AbstradeLogo}
          alt="Your Company"
        />
      </div>
      {isConnecting || isConnected ? (
        <div className="flex flex-col items-center pt-10">
          <Spinner />
          <p className="mt-10 text-lg">Signing you in now...</p>
        </div>
      ) : (
        <SignIn />
      )}

      {/* <SignIn />
      <Spinner withFramerMotion={false} /> */}
      <div className="absolute inset-x-0 top-[calc(50%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(50%-17rem)]">
        <svg
          className="relative left-[calc(50%+3rem)] h-[21.1875rem] max-w-none -translate-x-1/2 sm:left-[calc(50%+36rem)] sm:h-[42.375rem]"
          viewBox="0 0 1155 678"
        >
          <path
            fill="url(#ecb5b0c9-546c-4772-8c71-4d3f06d544bc)"
            fillOpacity=".3"
            d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
          />
          <defs>
            <linearGradient
              id="ecb5b0c9-546c-4772-8c71-4d3f06d544bc"
              x1="1155.49"
              x2="-78.208"
              y1=".177"
              y2="474.645"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#9089FC" />
              <stop offset={1} stopColor="#FF80B5" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {/* {<Account />}
      <button onClick={() => connector?.disconnect()}>
        {isConnected ? "disconnect" : ""}
      </button> */}
    </div>
  );
  // return (
  //   <>
  //     <h1>wagmi + RainbowKit + Next.js</h1>

  //     <ConnectButton />
  //     {isConnected && <Account />}
  //   </>
  // );
}

export default Page;
