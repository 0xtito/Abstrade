import { useAccount, useConnect } from "wagmi";
import { Fragment, useEffect } from "react";
import { WalletDropDown } from "./MyWalletDropDown";
import {
  GoogleLogo,
  FacebookLogo,
  DiscordLogo,
  GithubLogo,
  TwitterLogo,
} from "../static/images";
import { Connector } from "wagmi";
import { Signer } from "ethers";
import * as ethers from "ethers";
import AbstradeLogo from "../static/images/abstrade-v2-light.png";
import Image from "next/image";
import { AASigner } from "../interfaces/AASigner";

interface SafeAuthConnector extends Connector {
  safeAuth: any;
}

export function SignIn() {
  const { connect, connectors } = useConnect();
  const { isConnected } = useAccount();

  // const authKit = connectors.find((connector) => connector.id === "safeAA");

  useEffect(() => {
    // if (authKit) {
    //   connect({ connector: authKit });
    // }
    // console.log(authKit);
    (async () => {
      const web3auth = connectors.find(
        (connector) => connector.id === "web3auth"
      );

      console.log(web3auth);

      if (web3auth) {
        const signer: AASigner = await web3auth.getSigner();
        console.log(signer);
        console.log(await signer.getAddress());
        // const _signer = signer.connect(signer.AAProvider);
        console.log(await signer.getGasPrice());

        // const gas = await signer.getGasPrice();
        // const msg = await signer.signMessage("Hello World");
        // const msg = await signer.
        // console.log(ethers.utils.formatEther(gas));
      }

      // const stuff = await authKit?.connect();
      // console.log(stuff.kit.signOut());
    })();
    //   authKit.SignIn();
  }, [isConnected]);

  const socialProviderAndLogo = {
    google: <GoogleLogo />,
    facebook: <FacebookLogo />,
    twitter: <TwitterLogo />,
    discord: <DiscordLogo />,
    github: <GithubLogo />,
  };

  return (
    <Fragment>
      <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8 ">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Image
            className="mx-auto h-auto w-auto"
            src={AbstradeLogo}
            alt="Your Company"
          />
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            A new era for web3 trading:
          </h2>
          <div className="flex mt-2 text-center text-sm text-gray-600 focus:border-collapse justify-center">
            Or
            <span className="ml-1 inline-block focus:border-collapse">
              <WalletDropDown>create your smart account</WalletDropDown>
            </span>
          </div>
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
