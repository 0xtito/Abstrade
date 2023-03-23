const helpers = require("@nomicfoundation/hardhat-network-helpers");
const hre = require("hardhat");
const { ethers } = require("ethers");
const crypto = require('crypto');
const entryPointContractArtifact = require("@account-abstraction/contracts/artifacts/EntryPoint.json");
const fs = require('fs');
const { SimpleAccountAPI, wrapProvider } = require("@account-abstraction/sdk")


async function main() {
    //"0x6b73d9b538c633bcb45e01272bc793274ef2b7ad"
    const entryPointAddress = "0x0576a174D229E3cFA37253523E645A78A0C91B57";
    const entryPointAbi = JSON.parse(fs.readFileSync("./abi/entryPointAbi.json"));
    const sampleFillerAbi = JSON.parse(fs.readFileSync("./abi/SampleFiller.json"));
    const limitOrderAccountAbi = JSON.parse(fs.readFileSync("./abi/limitOrderAccountAbi.json"));
    const signer = await hre.ethers.getSigner(0);
    const signer2 = await hre.ethers.getSigner("0x3f38c44de590a070f464f2f176ed189e0dc1cbf8");
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY2, hre.ethers.provider);
    console.log("signer", signer.address);//0x6B73d9b538C633Bcb45E01272BC793274eF2B7Ad
    console.log("signer2", wallet.address);//0x3F38c44dE590a070F464f2f176ED189E0dc1cBf8

    const entryPoint = new ethers.Contract(entryPointAddress, entryPointAbi, signer);
    console.log("entryPointBalance", await hre.ethers.provider.getBalance(entryPoint.address));

    console.log("We will create an account Factory")
    const LimitOrderAccountFactory = await hre.ethers.getContractFactory("LimitOrderAccountFactory");
    const limitOrderAccountFactory = await LimitOrderAccountFactory.deploy(entryPoint.address);
    console.log("limitOrderAccountFactory create at:", limitOrderAccountFactory.address);//0xf37255D9F2f1c1AfdF10FedE072d934733e7e983

    console.log("Creating a OrderAccountAddress")
    salt = "0x" + crypto.randomBytes(32).toString("hex");
    await limitOrderAccountFactory.createAccount(signer2.getAddress(), salt);
    const limitOrderAccountAddress = await limitOrderAccountFactory.getAddress(signer2.getAddress(), salt);
    console.log("limitOrderAccountAddress address at: ", limitOrderAccountAddress);
    const limitOrderAccount = (await hre.ethers.getContractFactory("LimitOrderAccount")).attach(limitOrderAccountAddress);//0x29F418bCEa98925CC9f2FE16259B9cCB93486Bf6


    console.log("Samplefiller contract deployment")
    const SampleFiller = await hre.ethers.getContractFactory("SampleFiller");
    const sampleFiller = await SampleFiller.deploy();
    console.log("sampleFiller create at:", sampleFiller.address);//0xC881FACAA2e58E682b2a44E0A4243b9abd99F3Cc


    //Sending the first order
    //const limitOrderAccount = new ethers.Contract("0x29F418bCEa98925CC9f2FE16259B9cCB93486Bf6", limitOrderAccountAbi, signer);
    const order_id = 1;
    const nonce = (await limitOrderAccount.nonce()).toString();

    const expiry = 1000000000000;
    const order_amount = BigInt(1000 * 1e18); // 1,000 xDAI
    const BTC_price = 25000;
    const rate = BigInt(Math.round(1e9 / BTC_price));
    const token_out = "0x0000000000000000000000000000000000000000"; //xDai
    const token_in = "0x8e5bbbb09ed1ebde8674cda39a0c169401db4252";


    sendUserOpToEntryPoint = async (method, params, owner, nonce) => {
        const simpleAccountAPI = new SimpleAccountAPI({
            provider: hre.ethers.provider,
            entryPointAddress: entryPoint.address,
            owner: wallet,
        });
        const createUnsignedUserOp = (calldata) => {
            return {
                sender: limitOrderAccount.address,
                nonce: nonce,
                initCode: '0x',
                callData: calldata,
                callGasLimit: 200000, // auto-est 32018
                verificationGasLimit: 50000, // 35000 not enough
                preVerificationGas: '0', //paid to bundler
                maxFeePerGas: ethers.utils.parseUnits('0', 'gwei'),
                maxPriorityFeePerGas: ethers.utils.parseUnits('0', 'gwei'),
                paymasterAndData: '0x',
                signature: '',
            };
        }
        const GAS_SETTINGS = {
            gasLimit: 1000000,
            maxFeePerGas: ethers.utils.parseUnits("3", "gwei"),
            maxPriorityFeePerGas: ethers.utils.parseUnits("1", "gwei"),
        };
        let calldata = limitOrderAccount.interface.encodeFunctionData(method, params);
        const unsignedUserOp = createUnsignedUserOp(calldata);
        const op = await simpleAccountAPI.signUserOp(unsignedUserOp);
        const tx = await entryPoint.handleOps([op], owner.getAddress(), GAS_SETTINGS);
        console.log("my transaction", tx);
    }
    await sendUserOpToEntryPoint('createLimitOrder', [token_out, token_in, expiry, order_amount, rate], wallet, nonce);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});