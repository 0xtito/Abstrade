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



const MUMBAI_URL = "https://rpc.gnosischain.com";
const abi = [{ "inputs": [{ "internalType": "contract IEntryPoint", "name": "_entryPoint", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "newAccount", "type": "address" }], "name": "newAccount", "type": "event" }, { "inputs": [], "name": "accountImplementation", "outputs": [{ "internalType": "contract LimitOrderAccount", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "uint256", "name": "salt", "type": "uint256" }], "name": "createAccount", "outputs": [{ "internalType": "contract LimitOrderAccount", "name": "ret", "type": "address" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "uint256", "name": "salt", "type": "uint256" }], "name": "getAddress", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }]
const abi2 = [{ "inputs": [{ "internalType": "contract IEntryPoint", "name": "anEntryPoint", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "previousAdmin", "type": "address" }, { "indexed": false, "internalType": "address", "name": "newAdmin", "type": "address" }], "name": "AdminChanged", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "beacon", "type": "address" }], "name": "BeaconUpgraded", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint8", "name": "version", "type": "uint8" }], "name": "Initialized", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "contract IEntryPoint", "name": "entryPoint", "type": "address" }, { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }], "name": "SimpleAccountInitialized", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "tokenOut", "type": "address" }, { "indexed": true, "internalType": "address", "name": "tokenIn", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "expiry", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "id", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "orderAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "filledAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "rate", "type": "uint256" }], "name": "UpdateLimitOrder", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "implementation", "type": "address" }], "name": "Upgraded", "type": "event" }, { "inputs": [], "name": "addDeposit", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }], "name": "cancelLimitOrder", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_tokenOut", "type": "address" }, { "internalType": "address", "name": "_tokenIn", "type": "address" }, { "internalType": "uint256", "name": "_expiry", "type": "uint256" }, { "internalType": "uint256", "name": "_orderAmount", "type": "uint256" }, { "internalType": "uint256", "name": "_rate", "type": "uint256" }], "name": "createLimitOrder", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "entryPoint", "outputs": [{ "internalType": "contract IEntryPoint", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "dest", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }, { "internalType": "bytes", "name": "func", "type": "bytes" }], "name": "execute", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address[]", "name": "dest", "type": "address[]" }, { "internalType": "bytes[]", "name": "func", "type": "bytes[]" }], "name": "executeBatch", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }, { "internalType": "address payable", "name": "_filler", "type": "address" }, { "internalType": "uint256", "name": "_fillAmount", "type": "uint256" }, { "internalType": "bytes", "name": "_params", "type": "bytes" }], "name": "fillLimitOrder", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "getDeposit", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "anOwner", "type": "address" }], "name": "initialize", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "limitOrders", "outputs": [{ "internalType": "address", "name": "tokenOut", "type": "address" }, { "internalType": "address", "name": "tokenIn", "type": "address" }, { "internalType": "uint256", "name": "expiry", "type": "uint256" }, { "internalType": "uint256", "name": "orderAmount", "type": "uint256" }, { "internalType": "uint256", "name": "filledAmount", "type": "uint256" }, { "internalType": "uint256", "name": "rate", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "nonce", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "proxiableUUID", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newImplementation", "type": "address" }], "name": "upgradeTo", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newImplementation", "type": "address" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "upgradeToAndCall", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "uint256", "name": "nonce", "type": "uint256" }, { "internalType": "bytes", "name": "initCode", "type": "bytes" }, { "internalType": "bytes", "name": "callData", "type": "bytes" }, { "internalType": "uint256", "name": "callGasLimit", "type": "uint256" }, { "internalType": "uint256", "name": "verificationGasLimit", "type": "uint256" }, { "internalType": "uint256", "name": "preVerificationGas", "type": "uint256" }, { "internalType": "uint256", "name": "maxFeePerGas", "type": "uint256" }, { "internalType": "uint256", "name": "maxPriorityFeePerGas", "type": "uint256" }, { "internalType": "bytes", "name": "paymasterAndData", "type": "bytes" }, { "internalType": "bytes", "name": "signature", "type": "bytes" }], "internalType": "struct UserOperation", "name": "userOp", "type": "tuple" }, { "internalType": "bytes32", "name": "userOpHash", "type": "bytes32" }, { "internalType": "uint256", "name": "missingAccountFunds", "type": "uint256" }], "name": "validateUserOp", "outputs": [{ "internalType": "uint256", "name": "validationData", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address payable", "name": "withdrawAddress", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "withdrawDepositTo", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "stateMutability": "payable", "type": "receive" }]

const provider = new ethers.providers.JsonRpcProvider(MUMBAI_URL);
const WETH = "0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1";
const xDAI = "0x0000000000000000000000000000000000000000";
const WBTC = "0x8e5bbbb09ed1ebde8674cda39a0c169401db4252";
const GNO = "0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb"
const AccountFactoryAddress = "0xf37255D9F2f1c1AfdF10FedE072d934733e7e983";




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

  const xDaiWethPrice = async () => {
    let iface: utils.Interface = new utils.Interface(abi);
    const limitOrderAccountFactory = new ethers.Contract(AccountFactoryAddress, iface, provider);
    const events = limitOrderAccountFactory.filters.newAccount();

    const logsLimitOrderAccountFactory = await limitOrderAccountFactory.queryFilter(events, 27086500);
    let xDAIWethBidAsk: Iprices = { numLevels: 25, feed: 'book_ui_1_snapshot', product_id: '', bids: [], asks: [] };
    xDAIWethBidAsk.product_id = "xDAI_WETH";

    for (let i = 0; i < logsLimitOrderAccountFactory.length; i++) {
      let newAccount = (logsLimitOrderAccountFactory[i].args?.newAccount);
      let iface2: utils.Interface = new utils.Interface(abi2);
      const limitOrderAccount = new ethers.Contract(newAccount, iface2, provider);

      const eventsAccountXdaiWeth = limitOrderAccount.filters.UpdateLimitOrder([xDAI, WETH], [WETH, xDAI]);
      let logsxDaiWeth = await limitOrderAccount.queryFilter(eventsAccountXdaiWeth, 27086500);


      let auxTestGrouping: number[][] = [];
      for (let i = 0; i < logsxDaiWeth.length; i++) {
        let blocknumerId = logsxDaiWeth[i].blockNumber;
        let id = parseInt(logsxDaiWeth[i].args?.id._hex, 16)
        let tokenOut = logsxDaiWeth[i].args?.tokenOut
        let amountOut = (parseInt(logsxDaiWeth[i].args?.orderAmount._hex, 16) / (10 ** 18)) - (parseInt(logsxDaiWeth[i].args?.filledAmount._hex, 16) / (10 ** 18))
        //let rate = parseInt(logsxDaiWeth[i].args?.rate._hex, 16);
        let rate = 10 ** 9 / (parseInt(logsxDaiWeth[i].args?.rate._hex, 16));
        let expiry = parseInt(logsxDaiWeth[i].args?.expiry._hex, 16);
        //auxTestGrouping.push([blocknumerId, id, tokenOut, amountOut, rate, expiry])
        auxTestGrouping.push([blocknumerId, id, tokenOut, rate, amountOut, expiry])

      }
      console.log("auxTestGrouping", auxTestGrouping)
      let auxTestGroupingRemoveDup: number[][] = [];
      for (let i = 0; i < auxTestGrouping.length; i++) {
        for (let j = 0; j < auxTestGrouping.length; j++) {
          if (auxTestGrouping[i][1] === auxTestGrouping[j][1] && auxTestGrouping[i][0] < auxTestGrouping[j][0]) {
            auxTestGrouping.splice(i, 1);
          }
        }
      }
      for (let i = 0; i < auxTestGrouping.length; i++) {
        if (auxTestGrouping[i][5] !== 0) {
          if (auxTestGrouping[i][2].toString() === xDAI) {
            let bitPair: number[] = [auxTestGrouping[i][3], auxTestGrouping[i][4]];
            xDAIWethBidAsk.bids.push(bitPair);
          }
          else {

            let bitPair: number[] = [auxTestGrouping[i][3], auxTestGrouping[i][4]];
            xDAIWethBidAsk.asks.push(bitPair);
          }
        }
      }
    };
    //console.log("xDAIWethBidAsk", xDAIWethBidAsk)
    processMessages(JSON.stringify(xDAIWethBidAsk));
    setValue(!value);
  }

  const xDaiWbtcPrice = async () => {
    let iface: utils.Interface = new utils.Interface(abi);
    const limitOrderAccountFactory = new ethers.Contract(AccountFactoryAddress, iface, provider);
    const events = limitOrderAccountFactory.filters.newAccount();
    const logsLimitOrderAccountFactory = await limitOrderAccountFactory.queryFilter(events, 27086500);

    let xDAIWethBidAsk: Iprices = { numLevels: 25, feed: 'book_ui_1_snapshot', product_id: '', bids: [], asks: [] };
    xDAIWethBidAsk.product_id = "xDAI_WBTC";
    for (let i = 0; i < logsLimitOrderAccountFactory.length; i++) {

      let newAccount = logsLimitOrderAccountFactory[i].args?.newAccount;
      let iface2: utils.Interface = new utils.Interface(abi2);
      const limitOrderAccount = new ethers.Contract(newAccount, iface2, provider);
      const eventsAccountXdaiWeth = limitOrderAccount.filters.UpdateLimitOrder([xDAI, WBTC], [WBTC, xDAI]);
      let logsxDaiWeth = await limitOrderAccount.queryFilter(eventsAccountXdaiWeth, 27086500);


      let auxTestGrouping: number[][] = [];
      for (let i = 0; i < logsxDaiWeth.length; i++) {
        let blocknumerId = logsxDaiWeth[i].blockNumber;
        let id = parseInt(logsxDaiWeth[i].args?.id._hex, 16)
        let tokenOut = logsxDaiWeth[i].args?.tokenOut
        let amountOut = (parseInt(logsxDaiWeth[i].args?.orderAmount._hex, 16) / (10 ** 18)) - (parseInt(logsxDaiWeth[i].args?.filledAmount._hex, 16) / (10 ** 18))
        //let rate = parseInt(logsxDaiWeth[i].args?.rate._hex, 16);
        let rate = 10 ** 9 / (parseInt(logsxDaiWeth[i].args?.rate._hex, 16));
        let expiry = parseInt(logsxDaiWeth[i].args?.expiry._hex, 16);
        //auxTestGrouping.push([blocknumerId, id, tokenOut, amountOut, rate, expiry])
        auxTestGrouping.push([blocknumerId, id, tokenOut, rate, amountOut, expiry])

      }
      console.log("auxTestGrouping", auxTestGrouping)
      let auxTestGroupingRemoveDup: number[][] = [];
      for (let i = 0; i < auxTestGrouping.length; i++) {
        for (let j = 0; j < auxTestGrouping.length; j++) {
          if (auxTestGrouping[i][1] === auxTestGrouping[j][1] && auxTestGrouping[i][0] < auxTestGrouping[j][0]) {
            auxTestGrouping.splice(i, 1);
          }
        }
      }
      for (let i = 0; i < auxTestGrouping.length; i++) {
        if (auxTestGrouping[i][5] !== 0) {
          if (auxTestGrouping[i][2].toString() === xDAI) {
            let bitPair: number[] = [auxTestGrouping[i][3], auxTestGrouping[i][4]];
            xDAIWethBidAsk.bids.push(bitPair);
          }
          else {

            let bitPair: number[] = [auxTestGrouping[i][3], auxTestGrouping[i][4]];
            xDAIWethBidAsk.asks.push(bitPair);
          }
        }
      }
    };
    //console.log("xDAIWethBidAsk", xDAIWethBidAsk)
    processMessages(JSON.stringify(xDAIWethBidAsk));
    setValue(!value);
  };

  const xDaiGnoPrice = async () => {
    let iface: utils.Interface = new utils.Interface(abi);
    const limitOrderAccountFactory = new ethers.Contract(AccountFactoryAddress, iface, provider);
    const events = limitOrderAccountFactory.filters.newAccount();
    let logsLimitOrderAccountFactory = await limitOrderAccountFactory.queryFilter(events, 27086500);
    let xDAIWethBidAsk: Iprices = { numLevels: 25, feed: 'book_ui_1_snapshot', product_id: '', bids: [], asks: [] };
    xDAIWethBidAsk.product_id = "xDAI_GNO";
    for (let i = 0; i < logsLimitOrderAccountFactory.length; i++) {
      let newAccount = (logsLimitOrderAccountFactory[i].args?.newAccount);

      let iface2: utils.Interface = new utils.Interface(abi2);
      const limitOrderAccount = new ethers.Contract(newAccount, iface2, provider);

      const eventsAccountXdaiWeth = limitOrderAccount.filters.UpdateLimitOrder([xDAI, GNO], [GNO, xDAI]);
      const logsxDaiWeth = await limitOrderAccount.queryFilter(eventsAccountXdaiWeth, 27086500);

      let auxTestGrouping: number[][] = [];
      for (let i = 0; i < logsxDaiWeth.length; i++) {
        let blocknumerId = logsxDaiWeth[i].blockNumber;
        let id = parseInt(logsxDaiWeth[i].args?.id._hex, 16)
        let tokenOut = logsxDaiWeth[i].args?.tokenOut
        let amountOut = (parseInt(logsxDaiWeth[i].args?.orderAmount._hex, 16) / (10 ** 18)) - (parseInt(logsxDaiWeth[i].args?.filledAmount._hex, 16) / (10 ** 18))
        let rate = 10 ** 9 / (parseInt(logsxDaiWeth[i].args?.rate._hex, 16));
        let expiry = parseInt(logsxDaiWeth[i].args?.expiry._hex, 16);
        //auxTestGrouping.push([blocknumerId, id, tokenOut, amountOut, rate, expiry])
        auxTestGrouping.push([blocknumerId, id, tokenOut, rate, amountOut, expiry])
      }

      let auxTestGroupingRemoveDup: number[][] = [];
      for (let i = 0; i < auxTestGrouping.length; i++) {
        for (let j = 0; j < auxTestGrouping.length; j++) {
          if (auxTestGrouping[i][1] === auxTestGrouping[j][1] && auxTestGrouping[i][0] < auxTestGrouping[j][0]) {
            auxTestGrouping.splice(i, 1);
          }
        }
      }

      for (let i = 0; i < auxTestGroupingRemoveDup.length; i++) {
        if (auxTestGroupingRemoveDup[i][5] !== 0) {
          if (auxTestGroupingRemoveDup[i][2].toString() === xDAI) {
            let bitPair: number[] = [auxTestGroupingRemoveDup[i][3], auxTestGroupingRemoveDup[i][4]];
            xDAIWethBidAsk.bids.push(bitPair);
          }
          else {

            let bitPair: number[] = [auxTestGroupingRemoveDup[i][3], auxTestGroupingRemoveDup[i][4]];
            xDAIWethBidAsk.asks.push(bitPair);
          }
        }
      }
    };

    processMessages(JSON.stringify(xDAIWethBidAsk));
    //console.log("Can I call it in string?", JSON.stringify(maticWethBidAsk));
    setValue(!value);

  }


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
      if (productId === "xDAI_WETH") {
        xDaiWethPrice()
      } else {
        if (productId === "xDAI_WBTC") {
          xDaiWbtcPrice();
        } else { xDaiGnoPrice(); }

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
