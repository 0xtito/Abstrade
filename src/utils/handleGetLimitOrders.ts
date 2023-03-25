import { ethers } from "ethers";
import LimitOrderAccountABI from "../contracts/artifacts/LimitOrderAccount.json";
import { erc20ABI } from "wagmi";
import { AAProvider } from "../interfaces/AAProvider";

/**
 * @title LimitOrder Retriever
 * @auther @pumpedlunch
 */
interface LimitOrder {
  pair: string;
  type: string;
  price: string;
  amount: string;
  total: string;
  filled: string;
  expiry: string;
  status: string;
  id: number;
}

const formatNumber = (str: string, dig: number) => {
  const num = Number(str);
  if (num >= (10 ^ (dig - 1))) {
    return Math.round(num).toString();
  } else {
    return num.toPrecision(dig);
  }
};

export const getLimitOrders = async (provider: AAProvider, address: string) => {
  //   const provider = new ethers.providers.JsonRpcProvider(
  //     "https://rpc.ankr.com/gnosis"
  //   ); // TODO: replace with signer
  const limitOrderAccount = new ethers.Contract(
    address as string, // TODO: replace with user account address
    LimitOrderAccountABI.abi,
    provider
  );

  const _limitOrders: LimitOrder[] = [];
  //set limit to 100 for now to prevent unbounded loop
  for (let i = 1; i < 50; i++) {
    let limitOrderData = await limitOrderAccount.limitOrders(i);

    // test dummy data
    // const limitOrderData = {
    //   tokenIn:"0x8e5bBbb09Ed1ebdE8674Cda39A0c169401db4252", //"0x0000000000000000000000000000000000000000",
    //   tokenOut:"0x0000000000000000000000000000000000000000", //"0x8e5bBbb09Ed1ebdE8674Cda39A0c169401db4252",
    //   orderAmount: "4000000000000",
    //   filledAmount: "8000000000000",
    //   rate: "30000", // "30000000000000",
    //   expiry: "100000000"
    // }

    // break loop once we get past end of orders
    if (Number(limitOrderData.orderAmount) === 0) {
      break;
    }

    let orderType: string;
    let price: string;
    let tokenOutDecimals: number;
    let tokenInDecimals: number;
    let tokenOutSymbol: string;
    let tokenInSymbol: string;

    if (limitOrderData.tokenOut === ethers.constants.AddressZero) {
      orderType = "Buy";

      tokenOutDecimals = 18;
      tokenOutSymbol = "xDAI";

      const tokenInContract = new ethers.Contract(
        limitOrderData.tokenIn,
        erc20ABI,
        provider
      );
      tokenInSymbol = await tokenInContract.symbol();
      tokenInDecimals = await tokenInContract.decimals();

      price = (
        1 / Number(ethers.utils.formatUnits(limitOrderData.rate, "gwei"))
      ).toString(); //check this for decimals
    } else if (limitOrderData.tokenIn === ethers.constants.AddressZero) {
      orderType = "Sell";

      tokenInDecimals = 18;
      tokenInSymbol = "xDAI";

      const tokenOutContract = new ethers.Contract(
        limitOrderData.tokenOut,
        erc20ABI,
        provider
      );
      tokenOutSymbol = await tokenOutContract.symbol();
      tokenOutDecimals = await tokenOutContract.decimals();

      price = ethers.utils.formatUnits(limitOrderData.rate, "gwei");
    } else {
      console.log("unsupported pairing ignored");
      break;
    }

    let orderStatus: string;

    if (limitOrderData.amount <= limitOrderData.filled) {
      orderStatus = "Fulfilled";
    } else if (limitOrderData.expiry < Date.now() / 1000) {
      orderStatus = "Cancelled";
    } else orderStatus = "Open";

    const limitOrderFormatted: LimitOrder = {
      pair:
        orderType === "Buy"
          ? `${tokenInSymbol}/${tokenOutSymbol}`
          : `${tokenOutSymbol}/${tokenInSymbol}`,
      type: orderType,
      price: formatNumber(price, 4),
      amount: formatNumber(
        ethers.utils.formatEther(limitOrderData.orderAmount),
        4
      ),
      total: formatNumber(
        (
          Number(price) *
          Number(ethers.utils.formatEther(limitOrderData.orderAmount))
        ).toString(),
        4
      ),
      filled: formatNumber(
        limitOrderData.filledAmount
          .div(limitOrderData.orderAmount)
          .mul(100)
          .toString(),
        3
      ),
      expiry: new Date(Number(limitOrderData.expiry) * 1000).toDateString(),
      status: orderStatus,
      id: i,
    };
    _limitOrders.push(limitOrderFormatted);
  }

  //   setLimitOrders(_limitOrders);
  return _limitOrders;
};
