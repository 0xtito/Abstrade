const { ethers } = require("hardhat");
const { SimpleAccountAPI } = require("@account-abstraction/sdk");

// Function to abstract away the creation and sending of a user op to the Entry Point
sendUserOpToEntryPoint = async (method, params, owner) => {

    // Get LimitOrderAccount Contract already deployed on Gnosis Chain
    limitOrderAccount = (await ethers.getContractFactory("LimitOrderAccount"))
    .attach("0x29F418bCEa98925CC9f2FE16259B9cCB93486Bf6");

    // Instantiate the SimpleAccountAPI
    simpleAccountAPI = new SimpleAccountAPI({
        provider: ethers.provider, 
        entryPointAddress: entryPoint.address,
        owner: loa_contract_owner,
    });
    // Create a user op
    createUnsignedUserOp = (calldata, nonce) => {
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
    // Custom gas settings
    GAS_SETTINGS = {
        gasLimit: 1000000,
        maxFeePerGas: ethers.utils.parseUnits("3", "gwei"),
        maxPriorityFeePerGas: ethers.utils.parseUnits("1", "gwei"),
    };

    // Generate calldata for user operation
    calldata = limitOrderAccount.interface.encodeFunctionData(method, params);

    // Get the current nonce
    nonce = await limitOrderAccount.nonce();

    // Create the unsigned user op
    const unsignedUserOp = createUnsignedUserOp(calldata, nonce);

    // Sign the user op
    const op = await simpleAccountAPI.signUserOp(unsignedUserOp);
    
    // Get Entry Point contract already deployed on Gnosis Chain
    const entryPointInterface = require("@account-abstraction/contracts/artifacts/EntryPoint.json");
        entryPoint = (await ethers.getContractFactory(
            entryPointInterface.abi,
            entryPointInterface.bytecode
        )).attach("0x0576a174D229E3cFA37253523E645A78A0C91B57");
    
    // Send user op to Entry Point
    await entryPoint.handleOps([op], owner.getAddress(), GAS_SETTINGS);
}

//  ***** Create a limit order ***** 

// Limit Order Account contract owner
loa_contract_owner = await ethers.provider.getSigner(0);
// Set order expiry
block = await ethers.provider.getBlock('latest');
order_ttl = 3600; // one hour
expiry = block.timestamp + order_ttl;
// Set order amount
order_amount = BigInt(1000*1e18); // for example 1,000 xDAI
// token_in desired price for the order
token_in_price = 25000;
// Calculate the rate based on desired token out price
rate = BigInt(Math.round(1e9/token_in_price));
// We assume xDAI will always be the token_out
token_out = "0x0000000000000000000000000000000000000000"; // native xDAI
// ERC20 address for token_in (for example WBTC)
token_in = "0x8e5bBbb09Ed1ebdE8674Cda39A0c169401db4252";

await sendUserOpToEntryPoint('createLimitOrder', [token_out, token_in, expiry, order_amount, rate], loa_contract_owner);



// ***** Cancel an existing order ***** 

await sendUserOpToEntryPoint('cancelLimitOrder', [order_id], loa_contract_owner);


//  ***** Fill an existing order ***** 

// Get Sample Filler contract deployed on Gnosis Chain
sampleFiller = (await ethers.getContractFactory("SampleFiller")).attach("0xC881FACAA2e58E682b2a44E0A4243b9abd99F3Cc");
amount_to_fill = BigInt(300*1e18) // for example 300 xDAI

await sendUserOpToEntryPoint('fillLimitOrder', [order_id, sampleFiller.address, amount_to_fill, 0], loa_contract_owner);

