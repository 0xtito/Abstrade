import { ethers, utils } from 'ethers';
const MUMBAI_URL = "https://polygon-mumbai.g.alchemy.com/v2/To0qIM1veVl-PpwFTYCJC7POi7_0ejvG";
//const MUMBAI_URL = "https://rpc.gnosischain.com";
const abi = [{ "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "tokenOut", "type": "address" }, { "indexed": true, "internalType": "address", "name": "tokenIn", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "expiry", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "id", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amountOut", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "rate", "type": "uint256" }], "name": "UpdateLimitOrder", "type": "event" }, { "inputs": [{ "internalType": "uint256", "name": "_orderId", "type": "uint256" }, { "internalType": "address", "name": "_filler", "type": "address" }, { "internalType": "uint256", "name": "_fillAmount", "type": "uint256" }, { "internalType": "bytes", "name": "_params", "type": "bytes" }], "name": "fillLimitOrder", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "idCounter", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "limitOrders", "outputs": [{ "internalType": "address", "name": "tokenOut", "type": "address" }, { "internalType": "address", "name": "tokenIn", "type": "address" }, { "internalType": "uint256", "name": "expiry", "type": "uint256" }, { "internalType": "uint256", "name": "id", "type": "uint256" }, { "internalType": "uint256", "name": "amountOut", "type": "uint256" }, { "internalType": "uint256", "name": "rate", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_tokenOut", "type": "address" }, { "internalType": "address", "name": "_tokenIn", "type": "address" }, { "internalType": "uint256", "name": "_expiry", "type": "uint256" }, { "internalType": "uint256", "name": "_id", "type": "uint256" }, { "internalType": "uint256", "name": "_amountOut", "type": "uint256" }, { "internalType": "uint256", "name": "_rate", "type": "uint256" }], "name": "updateLimitOrders", "outputs": [], "stateMutability": "nonpayable", "type": "function" }];


const provider = new ethers.providers.JsonRpcProvider(MUMBAI_URL);
const WETH = "0xE1e67212B1A4BF629Bdf828e08A3745307537ccE";
const MATIC = "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889";
const WBTC = "0x4B5A0F4E00bC0d6F16A593Cae27338972614E713"
const smartWallet1 = "0x5ca1bf637469a6b4934679e000efc53a30285cfe";

//Assuming pairs MATIC/WETH & MATIC/WBTC & WETH/WBTC

async function main() {

    //event UpdateLimitOrder(address indexed tokenOut, address indexed tokenIn, uint256 indexed expiry,
    //uint256 id,uint256 amountOut,uint256 rate)
    //event without data {isTrusted: true, data: '{"event":"subscribed","feed":"book_ui_1","product_ids":["PI_XBTUSD"]}', origin: 'wss://www.cryptofacilities.com', lastEventId: '', source: null, …}
    //First time {numLevels:25, feed: 'book_ui_1_snapshot', product_id: 'PI_XBTUSD',asks: [[1000, 1], [1002, 1]],bids: [[1000, 1], [1002, 1]]} 
    //{feed: 'book_ui_1_snapshot', product_id: "PI_XBTUSD",asks: [[1000, 1], [1002, 1]],bids: [[1000, 1], [1002, 1]]} 


    interface Iprices {
        numLevels: 25,
        feed: 'book_ui_1_snapshot',
        product_id: string;
        asks: number[][];
        bids: number[][];
    }

    //First Test MATIC/WETH
    let iface: utils.Interface = new utils.Interface(abi);
    const contract = new ethers.Contract(smartWallet1, iface, provider);
    const events = contract.filters.UpdateLimitOrder([MATIC, WETH], [WETH, MATIC]);
    const logs = await contract.queryFilter(events, 33080129);


    let maticWethBidAsk: Iprices = { numLevels: 25, feed: 'book_ui_1_snapshot', product_id: '', bids: [], asks: [] };
    maticWethBidAsk.product_id = "MATIC_WETH";
    let maticWethBidMap = new Map();
    let maticWethAskMap = new Map();
    for (let i = 0; i < logs.length; i++) {
        let amountOut = parseInt(logs[0].args?.amountOut._hex, 16) / 18 ** 10;
        let rate = parseInt(logs[0].args?.rate._hex, 16) / 18 ** 10;
        //let bitPair: number[] = [amountOut, rate];
        if (logs[i].args?.tokenOut == MATIC) {
            if (maticWethBidMap.has(amountOut)) {
                //maticWethBidAsk.bids.push(bitPair);
                let newRate = rate + maticWethBidMap.get(amountOut);
                maticWethBidMap.set(amountOut, newRate);
            } else { maticWethBidMap.set(amountOut, rate); }
        }
        else {
            if (maticWethAskMap.has(amountOut)) {
                //maticWethBidAsk.asks.push(bitPair);
                let newRate = rate + maticWethAskMap.get(amountOut);
                maticWethAskMap.set(amountOut, rate);
            } else { maticWethAskMap.set(amountOut, rate); }
        }
    }

    maticWethBidAsk.asks = Array.from(maticWethAskMap.keys()).map(key => [key, maticWethAskMap.get(key)])
    maticWethBidAsk.bids = Array.from(maticWethBidMap.keys()).map(key => [key, maticWethBidMap.get(key)])

    //////////////////////////////////////////////////////////////////////
    const events2 = contract.filters.UpdateLimitOrder([MATIC, WBTC], [WBTC, MATIC]);
    let auxTest = await contract.queryFilter(events2, 33080129);

    let maticWbtcBidAsk: Iprices = { numLevels: 25, feed: 'book_ui_1_snapshot', product_id: '', bids: [], asks: [] };
    maticWbtcBidAsk.product_id = "MATIC_WBTC";
    for (let i = 0; i < auxTest.length; i++) {
        let amountOut = parseInt(auxTest[0].args?.amountOut._hex, 16) / 18 ** 10;
        let rate = parseInt(auxTest[0].args?.rate._hex, 16) / 18 ** 10;
        let bitPair: number[] = [amountOut, rate];
        if (auxTest[i].args?.tokenOut === MATIC) {
            maticWbtcBidAsk.bids.push(bitPair);
        }
        else {
            maticWbtcBidAsk.asks.push(bitPair);
        }
    }

    const events3 = contract.filters.UpdateLimitOrder([WETH, WBTC], [WBTC, WETH]);
    let auxTest1 = await contract.queryFilter(events3, 33080129);
    let wethWbtcBidAsk: Iprices = { numLevels: 25, feed: 'book_ui_1_snapshot', product_id: '', bids: [], asks: [] };
    wethWbtcBidAsk.product_id = "WETH_WBTC";
    for (let i = 0; i < auxTest1.length; i++) {
        let amountOut = parseInt(auxTest1[0].args?.amountOut._hex, 16) / 18 ** 10;
        let rate = parseInt(auxTest1[0].args?.rate._hex, 16) / 18 ** 10;

        if (auxTest1[i].args?.tokenOut === WETH) {
            let bitPair: number[] = [amountOut, rate];
            wethWbtcBidAsk.bids.push(bitPair);
        }
        else {
            let bitPair: number[] = [amountOut, rate];
            wethWbtcBidAsk.asks.push(bitPair);
        }

    }



    //console.log(`{numLevels:25, feed: 'book_ui_1_snapshot',product_id: `, maticWethAsk.product_id, `asks:`, maticWethAsk.asks, `,bids:`, maticWethBid.bids, `}`);
    //let aux = `{numLevels:25, feed: 'book_ui_1_snapshot',product_id: ` + maticWethAsk.product_id + `,asks:` + maticWethAsk.asks + `,bids:` + maticWethBid.bids;
    //console.log(aux);
    //First time {numLevels:25, feed: 'book_ui_1_snapshot', product_id: 'PI_XBTUSD',asks: [[1000, 1], [1002, 1]],bids: [[1000, 1], [1002, 1]]} 
    let aux = `{"numLevels":25, "feed": "book_ui_1_snapshot","product_id": "PI_XBTUSD", "asks": [[ 126033.92537662096, 198.8535267053353 ],[ 126033.92537662096, 198.8535267053353 ],[ 126033.92537662096, 198.8535267053353 ]], "bids": [[ 126033.92537662096, 198.8535267053353 ],[ 126033.92537662096, 198.8535267053353 ],[ 126033.92537662096, 198.8535267053353 ]] }`;

    console.log(maticWbtcBidAsk);
    console.log("Son los mismos precios?")
    console.log(maticWethBidAsk);
    console.log("Quizas no")
    console.log(wethWbtcBidAsk);



    //console.log("ha funcionado", maticWethBid);
    //console.log("ha funcionado", maticWethAsk);
    /*
    console.log(logs[0].args?.tokenOut);
    console.log(logs[0].args?.tokenIn);
    console.log(parseInt(logs[0].args?.expiry._hex, 16));
    console.log(parseInt(logs[0].args?.id._hex, 16));
    console.log(parseInt(logs[0].args?.amountOut._hex, 16));
    console.log(parseInt(logs[0].args?.rate._hex, 16)); */
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
