const { assert } = require('chai');


describe("Abstrade", () => {
    let order_creator;

    before(async () => {
        // LimitOrderSCW Contract Deployment
        const LimitOrderSCW = await ethers.getContractFactory("LimitOrderSCW");
        limitOrderSCW = await LimitOrderSCW.deploy();
        await limitOrderSCW.deployed()

        // SampleFiller Contract Deployment
        const SampleFiller = await ethers.getContractFactory("SampleFiller");
        sampleFiller = await SampleFiller.deploy();
        await sampleFiller.deployed()

        // xDAI Token Contract Deployment
        const xDAI = await ethers.getContractFactory("xDAI");
        xdai = await xDAI.deploy();
        await xdai.deployed();

        // WBTC Token Contract Deployment
        const WBTC = await ethers.getContractFactory("WBTC");
        wbtc = await WBTC.deploy();
        await wbtc.deployed();

        // Market participants
        eoa_wallet = await ethers.provider.getSigner(0);
    });
    describe("Test basic order functionality", () => {
        it("should add a new order", async () => {
            const expiry = 1000000000000;
            amount_out = BigInt(1000*1e18); // 1,000 xDAI
            const BTC_price = 25000;
            const rate = BigInt(Math.round(1e18/BTC_price));
            token_out = xdai.address;
            token_in = wbtc.address;
            await limitOrderSCW.connect(eoa_wallet).createOrder(token_out, token_in, expiry, amount_out, rate);
            let orderId = 1;
            let limit_order = await limitOrderSCW.limitOrders(orderId);
            assert.equal(limit_order.tokenOut, token_out);
            assert.equal(limit_order.tokenIn, token_in);
            assert.equal(limit_order.expiry, expiry);
            assert.equal(limit_order.amountOut, amount_out);
            assert.equal(limit_order.rate, rate);
            assert.equal(limit_order.id, orderId);
        });
        it("should exactly fill an existing order", async () => {
            let orderId = 1;
            initial_contract_funds = BigInt(10000*1e18); // 10,000 xDAI
            await xdai.transfer(limitOrderSCW.address, initial_contract_funds);
            initial_filler_funds = BigInt(10*1e18); // 10 WBTC
            await wbtc.transfer(sampleFiller.address, initial_filler_funds);
            amount_to_fill = BigInt(1000*1e18) // 1,000 xDAI
            await limitOrderSCW.connect(eoa_wallet).fillLimitOrder(orderId, sampleFiller.address, amount_to_fill, 0);
            let limit_order = await limitOrderSCW.limitOrders(orderId);
            assert.equal(limit_order.expiry, 1);
            assert.equal(limit_order.amountOut, 0); // 0 xDAI remain in the order
        });
        it("should partially fill an existing order", async () => {
            await limitOrderSCW.connect(eoa_wallet).createOrder(xdai.address, wbtc.address, 1000000000000, BigInt(1000*1e18), BigInt(Math.round(1e18/25000)));
            let orderId = 2;
            amount_to_fill = BigInt(300*1e18) // 300 xDAI
            await limitOrderSCW.connect(eoa_wallet).fillLimitOrder(orderId, sampleFiller.address, amount_to_fill, 0);
            let limit_order = await limitOrderSCW.limitOrders(orderId);
            assert.equal(limit_order.amountOut, BigInt(700*1e18)); // 700 xDAI remain in the order
        });
        it("should revert if order id doesn't exist", async () => {
            let ex;
            let orderId = 0; // Dummy order id
            try {
                await limitOrderSCW.connect(eoa_wallet).fillLimitOrder(orderId, sampleFiller.address, BigInt(300*1e18), 0);
            }
            catch (_ex) {
                ex = _ex;
            }
            assert(ex, 'Order ID does not exist. Expected transaction to revert!');
        });
        it("should revert if order is expired", async () => {
            let ex;
            await limitOrderSCW.connect(eoa_wallet).createOrder(xdai.address, wbtc.address, 100, BigInt(1000*1e18), BigInt(Math.round(1e18/25000)));
            try {
                await limitOrderSCW.connect(eoa_wallet).fillLimitOrder(3, sampleFiller.address, BigInt(300*1e18), 0);
            }
            catch (_ex) {
                ex = _ex;
            }
            assert(ex, 'Order is expired. Expected transaction to revert!');
        });

    });

});
