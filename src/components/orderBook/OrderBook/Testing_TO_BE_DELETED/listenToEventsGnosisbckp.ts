import { ethers, utils } from 'ethers';
const MUMBAI_URL = "https://rpc.gnosischain.com";
const abi = [{ "inputs": [{ "internalType": "contract IEntryPoint", "name": "_entryPoint", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "newAccount", "type": "address" }], "name": "newAccount", "type": "event" }, { "inputs": [], "name": "accountImplementation", "outputs": [{ "internalType": "contract LimitOrderAccount", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "uint256", "name": "salt", "type": "uint256" }], "name": "createAccount", "outputs": [{ "internalType": "contract LimitOrderAccount", "name": "ret", "type": "address" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "uint256", "name": "salt", "type": "uint256" }], "name": "getAddress", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }]
const abi2 = [{ "inputs": [{ "internalType": "contract IEntryPoint", "name": "anEntryPoint", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "previousAdmin", "type": "address" }, { "indexed": false, "internalType": "address", "name": "newAdmin", "type": "address" }], "name": "AdminChanged", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "beacon", "type": "address" }], "name": "BeaconUpgraded", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint8", "name": "version", "type": "uint8" }], "name": "Initialized", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "contract IEntryPoint", "name": "entryPoint", "type": "address" }, { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }], "name": "SimpleAccountInitialized", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "tokenOut", "type": "address" }, { "indexed": true, "internalType": "address", "name": "tokenIn", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "expiry", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "id", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "orderAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "filledAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "rate", "type": "uint256" }], "name": "UpdateLimitOrder", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "implementation", "type": "address" }], "name": "Upgraded", "type": "event" }, { "inputs": [], "name": "addDeposit", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }], "name": "cancelLimitOrder", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_tokenOut", "type": "address" }, { "internalType": "address", "name": "_tokenIn", "type": "address" }, { "internalType": "uint256", "name": "_expiry", "type": "uint256" }, { "internalType": "uint256", "name": "_orderAmount", "type": "uint256" }, { "internalType": "uint256", "name": "_rate", "type": "uint256" }], "name": "createLimitOrder", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "entryPoint", "outputs": [{ "internalType": "contract IEntryPoint", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "dest", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }, { "internalType": "bytes", "name": "func", "type": "bytes" }], "name": "execute", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address[]", "name": "dest", "type": "address[]" }, { "internalType": "bytes[]", "name": "func", "type": "bytes[]" }], "name": "executeBatch", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }, { "internalType": "address payable", "name": "_filler", "type": "address" }, { "internalType": "uint256", "name": "_fillAmount", "type": "uint256" }, { "internalType": "bytes", "name": "_params", "type": "bytes" }], "name": "fillLimitOrder", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "getDeposit", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "anOwner", "type": "address" }], "name": "initialize", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "limitOrders", "outputs": [{ "internalType": "address", "name": "tokenOut", "type": "address" }, { "internalType": "address", "name": "tokenIn", "type": "address" }, { "internalType": "uint256", "name": "expiry", "type": "uint256" }, { "internalType": "uint256", "name": "orderAmount", "type": "uint256" }, { "internalType": "uint256", "name": "filledAmount", "type": "uint256" }, { "internalType": "uint256", "name": "rate", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "nonce", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "proxiableUUID", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newImplementation", "type": "address" }], "name": "upgradeTo", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newImplementation", "type": "address" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "upgradeToAndCall", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "uint256", "name": "nonce", "type": "uint256" }, { "internalType": "bytes", "name": "initCode", "type": "bytes" }, { "internalType": "bytes", "name": "callData", "type": "bytes" }, { "internalType": "uint256", "name": "callGasLimit", "type": "uint256" }, { "internalType": "uint256", "name": "verificationGasLimit", "type": "uint256" }, { "internalType": "uint256", "name": "preVerificationGas", "type": "uint256" }, { "internalType": "uint256", "name": "maxFeePerGas", "type": "uint256" }, { "internalType": "uint256", "name": "maxPriorityFeePerGas", "type": "uint256" }, { "internalType": "bytes", "name": "paymasterAndData", "type": "bytes" }, { "internalType": "bytes", "name": "signature", "type": "bytes" }], "internalType": "struct UserOperation", "name": "userOp", "type": "tuple" }, { "internalType": "bytes32", "name": "userOpHash", "type": "bytes32" }, { "internalType": "uint256", "name": "missingAccountFunds", "type": "uint256" }], "name": "validateUserOp", "outputs": [{ "internalType": "uint256", "name": "validationData", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address payable", "name": "withdrawAddress", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "withdrawDepositTo", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "stateMutability": "payable", "type": "receive" }]

const provider = new ethers.providers.JsonRpcProvider(MUMBAI_URL);
const WETH = "0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1";
const xDAI = "0x0000000000000000000000000000000000000000";
const WBTC = "0x8e5bbbb09ed1ebde8674cda39a0c169401db4252"
//const smartWallet1 = "0x5ca1bf637469a6b4934679e000efc53a30285cfe";
const smartWalletFactory = "0xf37255D9F2f1c1AfdF10FedE072d934733e7e983";

//Assuming pairs xDAI/WETH & xDAI/WBTC & WETH/WBTC

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

    //First Test xDAI/WETH
    let iface: utils.Interface = new utils.Interface(abi);
    const limitOrderAccountFactory = new ethers.Contract("0xf37255D9F2f1c1AfdF10FedE072d934733e7e983", iface, provider);

    /////////////////////////////////////////////////////////////////
    const events = limitOrderAccountFactory.filters.newAccount();
    const logsLimitOrderAccountFactory = await limitOrderAccountFactory.queryFilter(events, 27086500);
    console.log(logsLimitOrderAccountFactory[0].args?.newAccount);
    let limitOrderAccounts: any[] = [];
    limitOrderAccounts.push(logsLimitOrderAccountFactory[0].args?.newAccount);
    //console.log("limitOrderAccounts", limitOrderAccounts);//[0x29F418bCEa98925CC9f2FE16259B9cCB93486Bf6]
    //console.log("limitOrderAccounts array", limitOrderAccounts[0]);

    let iface2: utils.Interface = new utils.Interface(abi2);
    const limitOrderAccount = new ethers.Contract("0x29F418bCEa98925CC9f2FE16259B9cCB93486Bf6", iface2, provider);
    const eventsAccount = limitOrderAccount.filters.UpdateLimitOrder([xDAI, WETH], [WETH, xDAI]);
    const logs = await limitOrderAccountFactory.queryFilter(eventsAccount, 27086500);

    let xDAIWethBidAsk: Iprices = { numLevels: 25, feed: 'book_ui_1_snapshot', product_id: '', bids: [], asks: [] };
    xDAIWethBidAsk.product_id = "xDAI_WETH";
    let xDAIWethBidMap = new Map();
    let xDAIWethAskMap = new Map();
    for (let i = 0; i < logs.length; i++) {
        let amountOut = parseInt(logs[i].args?.amountOut._hex, 16) / 10 ** 18;
        let rate = parseInt(logs[i].args?.rate._hex, 16) / 10 ** 18;
        if (logs[i].args?.tokenOut == xDAI) {
            if (xDAIWethBidMap.has(amountOut)) {
                let newRate = rate + xDAIWethBidMap.get(amountOut);
                xDAIWethBidMap.set(amountOut, newRate);
            } else { xDAIWethBidMap.set(amountOut, rate); }
        }
        else {
            if (xDAIWethAskMap.has(amountOut)) {
                let newRate = rate + xDAIWethAskMap.get(amountOut);
                xDAIWethAskMap.set(amountOut, rate);
            } else { xDAIWethAskMap.set(amountOut, rate); }
        }
    }

    xDAIWethBidAsk.asks = Array.from(xDAIWethAskMap.keys()).map(key => [key, xDAIWethAskMap.get(key)])
    xDAIWethBidAsk.bids = Array.from(xDAIWethBidMap.keys()).map(key => [key, xDAIWethBidMap.get(key)])

    //////////////////////////////////////////////////////////////////////
    const events2 = limitOrderAccount.filters.UpdateLimitOrder([xDAI, WBTC], [WBTC, xDAI]);
    let auxTest = await limitOrderAccount.queryFilter(events2, 27086500);
    //let como = (parseInt(auxTest[0].args?.orderAmount._hex, 16) / (10 ** 18)) - (parseInt(auxTest[0].args?.filledAmount._hex, 16) / (10 ** 18))
    //let blocknumerCom = auxTest[0].blockNumber
    //let idcomo = parseInt(auxTest[0].args?.id._hex, 16)
    //console.log("blocknumber", como);

    //First grouping 
    let auxTestGrouping: number[][] = [];
    for (let i = 0; i < auxTest.length; i++) {
        let blocknumerId = auxTest[i].blockNumber;
        let id = parseInt(auxTest[i].args?.id._hex, 16)
        let tokenOut = auxTest[i].args?.tokenOut
        let amountOut = (parseInt(auxTest[i].args?.orderAmount._hex, 16) / (10 ** 18)) - (parseInt(auxTest[i].args?.filledAmount._hex, 16) / (10 ** 18))
        let rate = parseInt(auxTest[i].args?.rate._hex, 16);
        let expiry = parseInt(auxTest[i].args?.expiry._hex, 16);
        auxTestGrouping.push([blocknumerId, id, tokenOut, amountOut, rate, expiry])
    }
    console.log("auxTestGrouping", auxTestGrouping);
    let auxTestGroupingRemoveDup: number[][] = [];
    for (let i = 0; i < auxTestGrouping.length; i++) {
        for (let j = 0; j < auxTestGrouping.length; j++) {
            if (auxTestGrouping[i][1] == auxTestGrouping[j][1] && auxTestGrouping[i][0] < auxTestGrouping[j][0]) {
                auxTestGrouping.splice(i, 1);
            }
        }
    }

    console.log("auxTestGroupingAfter", auxTestGrouping);



    let xDAIWbtcBidAsk: Iprices = { numLevels: 25, feed: 'book_ui_1_snapshot', product_id: '', bids: [], asks: [] };
    xDAIWbtcBidAsk.product_id = "xDAI_WBTC";
    let xDAIWbtcBidMap = new Map();
    let xDAIWbtcAskMap = new Map();
    for (let i = 0; i < auxTest.length; i++) {
        let amountOut = parseInt(auxTest[i].args?.amountOut._hex, 16) / 10 ** 18;
        let rate = parseInt(auxTest[i].args?.rate._hex, 16) / 10 ** 18;
        if (auxTest[i].args?.tokenOut == xDAI) {
            if (xDAIWbtcBidMap.has(amountOut)) {
                let newRate = rate + xDAIWbtcBidMap.get(amountOut);
                xDAIWbtcBidMap.set(amountOut, newRate);
            } else { xDAIWbtcBidMap.set(amountOut, rate); }
        }
        else {
            if (xDAIWbtcAskMap.has(amountOut)) {
                let newRate = rate + xDAIWbtcAskMap.get(amountOut);
                xDAIWbtcAskMap.set(amountOut, rate);
            } else { xDAIWbtcAskMap.set(amountOut, rate); }
        }
    }
    xDAIWbtcBidAsk.asks = Array.from(xDAIWethAskMap.keys()).map(key => [key, xDAIWbtcAskMap.get(key)])
    xDAIWbtcBidAsk.bids = Array.from(xDAIWethBidMap.keys()).map(key => [key, xDAIWbtcBidMap.get(key)])

    ////////////////////////////////////////////////////////////////////////////////
    const events3 = limitOrderAccount.filters.UpdateLimitOrder([WETH, WBTC], [WBTC, WETH]);
    let auxTest1 = await limitOrderAccount.queryFilter(events3, 27086500);
    let wethWbtcBidAsk: Iprices = { numLevels: 25, feed: 'book_ui_1_snapshot', product_id: '', bids: [], asks: [] };
    wethWbtcBidAsk.product_id = "WETH_WBTC";
    let wethWbtcBidMap = new Map();
    let wethWbtcAskMap = new Map();
    for (let i = 0; i < auxTest1.length; i++) {
        let amountOut = parseInt(auxTest1[i].args?.amountOut._hex, 16) / 10 ** 18;
        let rate = parseInt(auxTest1[i].args?.rate._hex, 16) / 10 ** 18;

        if (auxTest1[i].args?.tokenOut == WETH) {
            if (wethWbtcBidMap.has(amountOut)) {
                let newRate = rate + wethWbtcBidMap.get(amountOut);
                wethWbtcBidMap.set(amountOut, newRate);
            } else { wethWbtcBidMap.set(amountOut, rate); }
        }
        else {
            if (wethWbtcAskMap.has(amountOut)) {
                let newRate = rate + wethWbtcAskMap.get(amountOut);
                wethWbtcAskMap.set(amountOut, rate);
            } else { wethWbtcAskMap.set(amountOut, rate); }
        }

    }

    wethWbtcBidAsk.asks = Array.from(xDAIWethAskMap.keys()).map(key => [key, wethWbtcAskMap.get(key)])
    wethWbtcBidAsk.bids = Array.from(xDAIWethBidMap.keys()).map(key => [key, wethWbtcBidMap.get(key)])

    //console.log(`{numLevels:25, feed: 'book_ui_1_snapshot',product_id: `, xDAIWethAsk.product_id, `asks:`, xDAIWethAsk.asks, `,bids:`, xDAIWethBid.bids, `}`);
    //let aux = `{numLevels:25, feed: 'book_ui_1_snapshot',product_id: ` + xDAIWethAsk.product_id + `,asks:` + xDAIWethAsk.asks + `,bids:` + xDAIWethBid.bids;
    //console.log(aux);
    //First time {numLevels:25, feed: 'book_ui_1_snapshot', product_id: 'PI_XBTUSD',asks: [[1000, 1], [1002, 1]],bids: [[1000, 1], [1002, 1]]} 
    let aux = `{"numLevels":25, "feed": "book_ui_1_snapshot","product_id": "PI_XBTUSD", "asks": [[ 126033.92537662096, 198.8535267053353 ],[ 126033.92537662096, 198.8535267053353 ],[ 126033.92537662096, 198.8535267053353 ]], "bids": [[ 126033.92537662096, 198.8535267053353 ],[ 126033.92537662096, 198.8535267053353 ],[ 126033.92537662096, 198.8535267053353 ]] }`;

    console.log(xDAIWbtcBidAsk);
    console.log("Son los mismos precios?")
    console.log(xDAIWethBidAsk);
    console.log("Quizas no")
    console.log(wethWbtcBidAsk);



    //console.log("ha funcionado", xDAIWethBid);
    //console.log("ha funcionado", xDAIWethAsk);
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
