const { expect, assert } = require('chai');
const { ethers } = require("hardhat");
const crypto = require('crypto');

describe("Abstrade", () => {

    before(async () => {
        // EOA Wallets
        deployer_eoa = await ethers.provider.getSigner(0);
        loa_contract_owner = await ethers.provider.getSigner(1);

        // Entry Point Contract Deployment
        const entryPointContractArtifact = require("@account-abstraction/contracts/artifacts/EntryPoint.json");
        const EntryPoint = await ethers.getContractFactory(entryPointContractArtifact.abi, entryPointContractArtifact.bytecode);
        entryPoint = await EntryPoint.deploy();
        await entryPoint.deployed()

        // LimitOrderAccountFactory Contract Deployment
        const LimitOrderAccountFactory = await ethers.getContractFactory("LimitOrderAccountFactory");
        limitOrderAccountFactory = await LimitOrderAccountFactory.deploy(entryPoint.address);
        salt = "0x" + crypto.randomBytes(32).toString("hex");
        await limitOrderAccountFactory.createAccount(loa_contract_owner.getAddress(), salt);
        limitOrderAccountAddress = await limitOrderAccountFactory.getAddress(loa_contract_owner.getAddress(), salt);
        limitOrderAccount = (await ethers.getContractFactory("LimitOrderAccount")).attach(limitOrderAccountAddress);

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

    });
    describe("Test functionality directly from the owner EOA", () => {
        before(async () => {
            order_id = 1;
            expiry = 1000000000000;
            order_amount = BigInt(1000*1e18); // 1,000 xDAI
            BTC_price = 25000;
            rate = BigInt(Math.round(1e9/BTC_price));
            token_out = xdai.address;
            token_in = wbtc.address;
            // Fund the the limit order account and filler contracts with ERC-20 tokens
            initial_contract_funds = BigInt(10000*1e18); // 10,000 xDAI
            await xdai.transfer(limitOrderAccount.address, initial_contract_funds);
            initial_filler_funds = BigInt(10*1e18); // 10 WBTC
            await wbtc.transfer(sampleFiller.address, initial_filler_funds);
        });
        it("should add a new order", async () => {
            await limitOrderAccount.connect(loa_contract_owner).createLimitOrder(token_out, token_in, expiry, order_amount, rate);
            let limit_order = await limitOrderAccount.limitOrders(order_id);
            assert.equal(limit_order.tokenOut, token_out);
            assert.equal(limit_order.tokenIn, token_in);
            assert.equal(limit_order.expiry, expiry);
            assert.equal(limit_order.orderAmount, order_amount);
            assert.equal(limit_order.rate, rate);
        });
        it("should cancel an existing order", async () => {
            await limitOrderAccount.connect(loa_contract_owner).cancelLimitOrder(order_id);
            let limit_order = await limitOrderAccount.limitOrders(order_id);
            assert.equal(limit_order.expiry, 0);
        });
        it("should partially fill an existing order", async () => {
            await limitOrderAccount.connect(loa_contract_owner).createLimitOrder(token_out, token_in, expiry, order_amount, rate);
            order_id += 1;
            for (let i=0; i<3; i++) { 
                let limit_order = await limitOrderAccount.limitOrders(order_id);
                let already_filled_amount = BigInt(limit_order.filledAmount);
                let amount_to_fill = BigInt(300*1e18); // 300 xDAI
                await limitOrderAccount.connect(loa_contract_owner).fillLimitOrder(order_id, sampleFiller.address, amount_to_fill, 0);
                limit_order = await limitOrderAccount.limitOrders(order_id);
                assert.equal(BigInt(limit_order.filledAmount), already_filled_amount + amount_to_fill);
            } 
        });
        it("should revert if order is expired", async () => {
            let short_expiry = 1;
            order_id += 1;
            await limitOrderAccount.connect(loa_contract_owner).createLimitOrder(token_out, token_in, short_expiry, order_amount, rate);
            limit_order = await limitOrderAccount.limitOrders(order_id);
            await expect(limitOrderAccount.connect(loa_contract_owner)
                .fillLimitOrder(order_id, sampleFiller.address, BigInt(300*1e18), 0))
                .to.be.revertedWith("order is not valid");      
        });
    });

});
