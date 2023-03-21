import hre, { ethers } from "hardhat";
import { parseEther } from 'ethers/lib/utils'
import { SimpleAccountAPI } from "@account-abstraction/sdk/dist/src/SimpleAccountAPI.js";
import { DetailsForUserOp, UserOperationStruct } from '../src/interfaces/index';
import EntryPointABI from '../ABIs/EntryPoint.json';
const IEntryPoint = new ethers.utils.Interface(EntryPointABI);
import SimpleAccountABI from '../ABIs/SimpleAccount.json';
const ISimpleAccount = new ethers.utils.Interface(SimpleAccountABI);

const ENTRY_POINT_ADD = '0x0576a174D229E3cFA37253523E645A78A0C91B57';
const SIMPLE_ACCOUNT_ADD = '0xCe4BCd8227059ee5797b81BaFaaB9353bBB13d98';

(async () => {

    const provider = ethers.provider;
    const [signer] = await ethers.getSigners();
    console.log(signer.address);

    console.log('+++++1')
    const simpleAccount = new ethers.Contract(SIMPLE_ACCOUNT_ADD, ISimpleAccount, signer) // await new SimpleAccountAPI({provider: provider, signer: signer, entryPointAddress: ENTRY_POINT_ADD});
    const simpleAccountAPI = await new SimpleAccountAPI({provider: provider, owner: signer, entryPointAddress: ENTRY_POINT_ADD});
    console.log('+++++2')
    /*     const userOpDetails: DetailsForUserOp = {target: signer.address, value: parseEther('0.0000000001'), data: '0x', 
        // gasLimit: , 
        maxFeePerGas: ethers.utils.parseUnits('10', 'gwei'),
        maxPriorityFeePerGas: ethers.utils.parseUnits('2', 'gwei')}; 

        const signedUserOp = await simpleAccount.createUnsignedUserOp(userOpDetails);
    */
    const calldata =  ISimpleAccount.encodeFunctionData('execute', [signer.address, "100", "0x"]); // await simpleAccount.encodeExecute({target: signer.address, value: 100, data: '0x' })



    console.log('+++++3')
    const unsignedUserOp: UserOperationStruct = {
        sender: SIMPLE_ACCOUNT_ADD,
        nonce: '0',
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

    console.log('+++++4')

    const signedUserOp = await simpleAccountAPI.signUserOp(unsignedUserOp);

    console.log('+++++ SIGNED USER OP')
    console.log(signedUserOp)

    const entryPoint = new ethers.Contract(ENTRY_POINT_ADD, EntryPointABI, signer);

    console.log('+++++sending to entry point')

    const GAS_SETTINGS = {
        gasLimit: 1000000,
        maxFeePerGas: ethers.utils.parseUnits("3", "gwei"),
        maxPriorityFeePerGas: ethers.utils.parseUnits("1", "gwei"),
    };
    const tx2 = await entryPoint.handleOps([signedUserOp], signer.address, GAS_SETTINGS)
    console.log('+++++tx response')
    console.log(tx2);
    console.log('+++++ tx receipt')
    console.log(await tx2.wait());
})();