import LimitOrderAccount from "../../../contracts/artifacts/LimitOrderAccount.json";
import LimitOrderAccountFactory from "../../../contracts/artifacts/LimitOrderAccountFactory.json";


const WETH = "0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1";
const xDAI = "0x0000000000000000000000000000000000000000";
const WBTC = "0x8e5bbbb09ed1ebde8674cda39a0c169401db4252";
const GNO = "0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb"
const AccountFactoryAddress = "0xf37255D9F2f1c1AfdF10FedE072d934733e7e983";

const bids: number[][] = useAppSelector(selectBids);
const asks: number[][] = useAppSelector(selectAsks);

export function MainIndex() {


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
      
      const xDaiGnoPrice = async (productId: string) => {
        askPrice.product_id = productId;
        const xDaiId = productId.split("_")[0];
        const tokenB = productId.split("_")[1];
        for (let i = 0; i < logsLimitOrderAccountFactory.length; i++) {
    
          const eventsAccountXdaiWeth = limitOrderAccount.filters.UpdateLimitOrder([xDAI, GNO], [GNO, xDAI]);
          }

        };
    
        processMessages(JSON.stringify(xDAIWethBidAsk));
        //console.log("Can I call it in string?", JSON.stringify(maticWethBidAsk));
        setValue(!value);
    
      }
}