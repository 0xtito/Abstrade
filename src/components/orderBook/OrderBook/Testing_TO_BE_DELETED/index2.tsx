import React, { FunctionComponent, useEffect, useState } from 'react';
import useWebSocket from "react-use-websocket";

import TitleRow from "./TitleRow";
import { Container, TableContainer } from "./styles";
import PriceLevelRow from "./PriceLevelRow";
import Spread from "../Spread";
import { useAppDispatch, useAppSelector } from '../../hooks';
import { addAsks, addBids, addExistingState, selectAsks, selectBids } from './orderbookSlice';
import { MOBILE_WIDTH, ORDERBOOK_LEVELS } from "../../constants";
import Loader from "../Loader";
import DepthVisualizer from "../DepthVisualizer";
import { PriceLevelRowContainer } from "./PriceLevelRow/styles";
import { ProductsMap } from "../../App";
import { formatNumber } from "../../helpers";
import { ethers, utils } from 'ethers';

const WSS_FEED_URL: string = 'wss://www.cryptofacilities.com/ws/v1';



const MUMBAI_URL = "https://polygon-mumbai.g.alchemy.com/v2/To0qIM1veVl-PpwFTYCJC7POi7_0ejvG";
const abi = [{ "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "tokenOut", "type": "address" }, { "indexed": true, "internalType": "address", "name": "tokenIn", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "expiry", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "id", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amountOut", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "rate", "type": "uint256" }], "name": "UpdateLimitOrder", "type": "event" }, { "inputs": [{ "internalType": "uint256", "name": "_orderId", "type": "uint256" }, { "internalType": "address", "name": "_filler", "type": "address" }, { "internalType": "uint256", "name": "_fillAmount", "type": "uint256" }, { "internalType": "bytes", "name": "_params", "type": "bytes" }], "name": "fillLimitOrder", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "idCounter", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "limitOrders", "outputs": [{ "internalType": "address", "name": "tokenOut", "type": "address" }, { "internalType": "address", "name": "tokenIn", "type": "address" }, { "internalType": "uint256", "name": "expiry", "type": "uint256" }, { "internalType": "uint256", "name": "id", "type": "uint256" }, { "internalType": "uint256", "name": "amountOut", "type": "uint256" }, { "internalType": "uint256", "name": "rate", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_tokenOut", "type": "address" }, { "internalType": "address", "name": "_tokenIn", "type": "address" }, { "internalType": "uint256", "name": "_expiry", "type": "uint256" }, { "internalType": "uint256", "name": "_id", "type": "uint256" }, { "internalType": "uint256", "name": "_amountOut", "type": "uint256" }, { "internalType": "uint256", "name": "_rate", "type": "uint256" }], "name": "updateLimitOrders", "outputs": [], "stateMutability": "nonpayable", "type": "function" }];

const provider = new ethers.providers.JsonRpcProvider(MUMBAI_URL);
const WETH = "0xE1e67212B1A4BF629Bdf828e08A3745307537ccE";
const MATIC = "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889";
const WBTC = "0x4B5A0F4E00bC0d6F16A593Cae27338972614E713"
const smartWallet1 = "0x5ca1bf637469a6b4934679e000efc53a30285cfe";


interface Iprices {
  numLevels: 25,
  feed: 'book_ui_1_snapshot',
  product_id: string;
  asks: number[][];
  bids: number[][];
}

export enum OrderType {
  BIDS,
  ASKS
}

interface OrderBookProps {
  windowWidth: number;
  productId: string;
  isFeedKilled: boolean;
}

interface Delta {
  bids: number[][];
  asks: number[][];
}

let currentBids: number[][] = []
let currentAsks: number[][] = []


const OrderBook: FunctionComponent<OrderBookProps> = ({ windowWidth, productId, isFeedKilled }) => {
  const bids: number[][] = useAppSelector(selectBids);
  const asks: number[][] = useAppSelector(selectAsks);
  const dispatch = useAppDispatch();

  const [value, setValue] = useState(true);

  let iface: utils.Interface = new utils.Interface(abi);
  const contract = new ethers.Contract(smartWallet1, iface, provider);

  const maticWethPrice = async () => {
    const events = contract.filters.UpdateLimitOrder([MATIC, WETH], [WETH, MATIC]);
    let auxTest = await contract.queryFilter(events, 33080129);
    let maticWethBidAsk: Iprices = { numLevels: 25, feed: 'book_ui_1_snapshot', product_id: '', bids: [], asks: [] };
    maticWethBidAsk.product_id = "MATIC_WETH";
    for (let i = 0; i < auxTest.length; i++) {
      const events = contract.filters.UpdateLimitOrder([MATIC, WETH], [WETH, MATIC]);
      let auxTest = await contract.queryFilter(events, 33080129);
      let amountOut = parseInt(auxTest[0].args?.amountOut._hex, 16) / 18 ** 10;
      let rate = parseInt(auxTest[0].args?.rate._hex, 16) / 18 ** 10;

      if (auxTest[i].args?.tokenOut === MATIC) {
        let bitPair: number[] = [amountOut, rate];
        maticWethBidAsk.bids.push(bitPair);
      }
      else {
        let bitPair: number[] = [amountOut, rate];
        maticWethBidAsk.asks.push(bitPair);
      }

    }

    //console.log("Can I call it?", maticWethBidAsk);
    processMessages(JSON.stringify(maticWethBidAsk));
    //console.log("Can I call it in string?", JSON.stringify(maticWethBidAsk));
    setValue(!value);

  };

  const maticWbtcPrice = async () => {
    const events = contract.filters.UpdateLimitOrder([MATIC, WBTC], [WBTC, MATIC]);
    let auxTest = await contract.queryFilter(events, 33080129);
    let maticWbtcBidAsk: Iprices = { numLevels: 25, feed: 'book_ui_1_snapshot', product_id: '', bids: [], asks: [] };
    maticWbtcBidAsk.product_id = "MATIC_WBTC";
    for (let i = 0; i < auxTest.length; i++) {
      let amountOut = parseInt(auxTest[0].args?.amountOut._hex, 16) / 18 ** 10;
      let rate = parseInt(auxTest[0].args?.rate._hex, 16) / 18 ** 10;

      if (auxTest[i].args?.tokenOut === MATIC) {
        let bitPair: number[] = [amountOut, rate];
        maticWbtcBidAsk.bids.push(bitPair);
      }
      else {
        let bitPair: number[] = [amountOut, rate];
        maticWbtcBidAsk.asks.push(bitPair);
      }

    }

    //console.log("Can I call it?", maticWethBidAsk);
    processMessages(JSON.stringify(maticWbtcBidAsk));
    //console.log("Can I call it in string?", JSON.stringify(maticWbtcBidAsk));
    setValue(!value);

  };

  const wethWbtcPrice = async () => {
    const events = contract.filters.UpdateLimitOrder([WETH, WBTC], [WBTC, WETH]);
    let auxTest = await contract.queryFilter(events, 33080129);
    let wethWbtcBidAsk: Iprices = { numLevels: 25, feed: 'book_ui_1_snapshot', product_id: '', bids: [], asks: [] };
    wethWbtcBidAsk.product_id = "WETH_WBTC";
    for (let i = 0; i < auxTest.length; i++) {
      let amountOut = parseInt(auxTest[0].args?.amountOut._hex, 16) / 18 ** 10;
      let rate = parseInt(auxTest[0].args?.rate._hex, 16) / 18 ** 10;

      if (auxTest[i].args?.tokenOut === WETH) {
        let bitPair: number[] = [amountOut, rate];
        wethWbtcBidAsk.bids.push(bitPair);
      }
      else {
        let bitPair: number[] = [amountOut, rate];
        wethWbtcBidAsk.asks.push(bitPair);
      }

    }

    //console.log("Can I call it?", maticWethBidAsk);
    processMessages(JSON.stringify(wethWbtcBidAsk));
    //console.log("Can I call it in string?", JSON.stringify(maticWbtcBidAsk));
    setValue(!value);

  };




  //let aux = `{"numLevels":25, "feed": "book_ui_1_snapshot","product_id": "PI_XBTUSD", "asks": [[ 126033.92537662096, 198.8535267053353 ],[ 126033.92537662096, 198.8535267053353 ],[ 126033.92537662096, 198.8535267053353 ]], "bids": [[ 126033.92537662096, 198.8535267053353 ],[ 126033.92537662096, 198.8535267053353 ],[ 126033.92537662096, 198.8535267053353 ]] }`;
  //let aux2 = `{"asks": [[ 126033.92537662096, 198.8535267053353 ],[ 126033.92537662096, 198.8535267053353 ],[ 126033.92537662096, 198.8535267053353 ]], "bids": [[ 126033.92537662096, 198.8535267053353 ],[ 126033.92537662096, 198.8535267053353 ],[ 126033.92537662096, 198.8535267053353 ]] }`


  const { sendJsonMessage, getWebSocket } = useWebSocket(WSS_FEED_URL, {
    onOpen: () => console.log('WebSocket connection opened.'),
    onClose: () => console.log('WebSocket connection closed.'),
    shouldReconnect: (closeEvent) => true,
    //onMessage: (event: WebSocketEventMap['message']) => //processMessages(aux)
    onMessage: (event: WebSocketEventMap['message']) => console.log("pasamos por aqui")
  });

  const processMessages = (event: string) => {
    const response = JSON.parse(event);
    if (response.numLevels) {
      dispatch(addExistingState(response));
    } else {
      process(response);
    }
  };

  useEffect(() => {
    function connect(product: string) {
      const unSubscribeMessage = {
        event: 'unsubscribe',
        feed: 'book_ui_1',
        product_ids: [ProductsMap[product]]
      };
      sendJsonMessage(unSubscribeMessage);

      const subscribeMessage = {
        event: 'subscribe',
        feed: 'book_ui_1',
        product_ids: [product]
      };
      sendJsonMessage(subscribeMessage);
    }

    if (isFeedKilled) {
      getWebSocket()?.close();
    } else {
      connect(productId);
      if (productId === "MATIC_WETH") {
        maticWethPrice()
      } else {
        if (productId === "MATIC_WBTC") {
          maticWbtcPrice();
        } else { wethWbtcPrice(); }

      }
      //processMessages(aux)
    }
  }, [isFeedKilled, productId, value, sendJsonMessage, getWebSocket]);


  const process = (data: Delta) => {
    if (data?.bids?.length > 0) {
      currentBids = [...currentBids, ...data.bids];
      if (currentBids.length > ORDERBOOK_LEVELS) {
        dispatch(addBids(currentBids));
        currentBids = [];
        currentBids.length = 0;
      }
    }
    if (data?.asks?.length >= 0) {
      currentAsks = [...currentAsks, ...data.asks];

      if (currentAsks.length > ORDERBOOK_LEVELS) {
        dispatch(addAsks(currentAsks));
        currentAsks = [];
        currentAsks.length = 0;
      }
    }
  };


  const formatPrice = (arg: number): string => {
    return arg.toLocaleString("en", { useGrouping: true, minimumFractionDigits: 2 })
  };

  const buildPriceLevels = (levels: number[][], orderType: OrderType = OrderType.BIDS): React.ReactNode => {
    const sortedLevelsByPrice: number[][] = [...levels].sort(
      (currentLevel: number[], nextLevel: number[]): number => {
        let result: number = 0;
        if (orderType === OrderType.BIDS || windowWidth < MOBILE_WIDTH) {
          result = nextLevel[0] - currentLevel[0];
        } else {
          result = currentLevel[0] - nextLevel[0];
        }
        return result;
      }
    );

    return (
      sortedLevelsByPrice.map((level, idx) => {
        const calculatedTotal: number = level[2];
        const total: string = formatNumber(calculatedTotal);
        const depth = level[3];
        const size: string = formatNumber(level[1]);
        const price: string = formatPrice(level[0]);

        return (
          <PriceLevelRowContainer key={idx + depth}>
            <DepthVisualizer key={depth} windowWidth={windowWidth} depth={depth} orderType={orderType} />
            <PriceLevelRow key={size + total}
              total={total}
              size={size}
              price={price}
              reversedFieldsOrder={orderType === OrderType.ASKS}
              windowWidth={windowWidth} />
          </PriceLevelRowContainer>
        );
      })
    );
  };

  return (
    <Container>
      {bids.length && asks.length ?
        <>
          <TableContainer>
            {windowWidth > MOBILE_WIDTH && <TitleRow windowWidth={windowWidth} reversedFieldsOrder={false} />}
            <div>{buildPriceLevels(bids, OrderType.BIDS)}</div>
          </TableContainer>
          <Spread bids={bids} asks={asks} />
          <TableContainer>
            <TitleRow windowWidth={windowWidth} reversedFieldsOrder={true} />
            <div>
              {buildPriceLevels(asks, OrderType.ASKS)}
            </div>
          </TableContainer>
        </> :
        <Loader />}
    </Container>
  )
};

export default OrderBook;
