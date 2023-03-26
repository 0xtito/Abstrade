import { useAccount, useConnect } from "wagmi";
import { Fragment, useEffect } from "react";
import { WalletDropDown } from "./FrontPageWalletDropDown";
import {
  GoogleLogo,
  FacebookLogo,
  DiscordLogo,
  GithubLogo,
  TwitterLogo,
} from "../static/images";
import { useRouter } from "next/router";

export function SignIn() {
  const { connect, connectors } = useConnect();

  const socialProviderAndLogo = {
    google: <GoogleLogo />,
    facebook: <FacebookLogo />,
    twitter: <TwitterLogo />,
    discord: <DiscordLogo />,
    github: <GithubLogo />,
  };

  return (
    <Fragment>
      <div className="flex min-h-full flex-col justify-center sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* <Image moved this too the main index.tsx page
            className="mx-auto h-auto w-auto"
            src={AbstradeLogo}
            alt="Your Company"
          /> */}
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            A new era of Trading
          </h2>
        </div>
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <svg
            className="relative left-[calc(50%-11rem)] -z-10 h-[21.1875rem] max-w-none -translate-x-1/2 rotate-[30deg] sm:left-[calc(50%-30rem)] sm:h-[42.375rem]"
            viewBox="0 0 1155 678"
          >
            <path
              fill="url(#45de2b6b-92d5-4d68-a6a0-9b9b2abad533)"
              fillOpacity=".3"
              d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
            />
            <defs>
              <linearGradient
                id="45de2b6b-92d5-4d68-a6a0-9b9b2abad533"
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
        <div className="mt-8 border-1 border-gray-200 rounded-lg p-4 shadow-2xl sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="grid grid-cols-1 gap-3">
              {connectors
                .filter(
                  (_connector) =>
                    Object.entries(socialProviderAndLogo).findIndex(
                      (id) => id[0] === _connector.id
                    ) !== -1
                )
                .map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      connect({ connector: item });
                      console.log(item);
                    }}
                    className="inline-flex w-full justify-center align-middle rounded-md bg-white py-2 px-4 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0 hover:cursor-pointer"
                  >
                    <span className="sr-only">
                      Sign in with{" "}
                      {item.id.charAt(0).toUpperCase() + item.id.slice(1)}
                    </span>
                    {
                      socialProviderAndLogo[
                        item.id as keyof typeof socialProviderAndLogo
                      ]
                    }

                    <p className="block text-sm font-medium text-gray-900">
                      Sign in with{" "}
                      {item.id.charAt(0).toUpperCase() + item.id.slice(1)}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}
