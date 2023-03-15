const hre = require("hardhat");
const ethers = require("ethers");

// DEPLOY VARIABLES (UPDATE FOR DESIRED NETWORK)

const WMATIC = "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889";
const WBTC = "0x4B5A0F4E00bC0d6F16A593Cae27338972614E713";
const WETH = "0xE1e67212B1A4BF629Bdf828e08A3745307537ccE";

const WBTCWETH = 14;
const WMATICWBTCW = 0.00004;
const WMATICWETH = 0.00071;

async function main() {
  // DEPLOY DECENTRALIST
  const LimitOrderAccount = await hre.ethers.getContractFactory("LimitOrderAccount");
  const limitOrderAccount =  await LimitOrderAccount.deploy(); //LimitOrderAccount.attach("0x1aC8d2777CEA66851C71DE57548E4D08EcD160fE")
  let tx1 = await limitOrderAccount.deployed();

  tx1 = await tx1.deployTransaction.wait();

  console.log(`LimitOrderAccount deployed to ${limitOrderAccount.address}`);

  const txs = [];

  await limitOrderAccount.updateLimitOrders(WBTC, WETH, 1678750000, 0, ethers.utils.parseEther("0.45"), ethers.utils.parseEther(WBTCWETH.toString()));
  await limitOrderAccount.updateLimitOrders(WBTC, WETH, 1679750000, 0, ethers.utils.parseEther("10"), ethers.utils.parseEther(WBTCWETH.toString()));
  await limitOrderAccount.updateLimitOrders(WBTC, WETH, 1500000000, 0, ethers.utils.parseEther(".00005"), ethers.utils.parseEther(WBTCWETH.toString()));

  await limitOrderAccount.updateLimitOrders(WMATIC, WETH, 1678750000, 0, ethers.utils.parseEther("0.45"), ethers.utils.parseEther(WMATICWETH.toString()));
  await limitOrderAccount.updateLimitOrders(WMATIC, WETH, 1679750000, 0, ethers.utils.parseEther("10"), ethers.utils.parseEther(WMATICWETH.toString()));
  await limitOrderAccount.updateLimitOrders(WMATIC, WETH, 1678850000, 0, ethers.utils.parseEther(".00005"), ethers.utils.parseEther(WMATICWETH.toString()));

  await limitOrderAccount.updateLimitOrders(WBTC, WMATIC, 1678750000, 0, ethers.utils.parseEther("0.45"), ethers.utils.parseEther((1/WMATICWBTCW).toString()));
await limitOrderAccount.updateLimitOrders(WBTC, WMATIC, 1679750000, 0, ethers.utils.parseEther("10"), ethers.utils.parseEther((1/WMATICWBTCW).toString()));
await limitOrderAccount.updateLimitOrders(WBTC, WMATIC, 1678850000, 0, ethers.utils.parseEther(".00005"), ethers.utils.parseEther((1/WMATICWBTCW).toString()));

  await limitOrderAccount.updateLimitOrders(WETH, WBTC, 1678750000, 0, ethers.utils.parseEther("0.45"), ethers.utils.parseEther((1/WBTCWETH).toString()));
await limitOrderAccount.updateLimitOrders(WETH, WBTC, 1679750000, 0, ethers.utils.parseEther("10"), ethers.utils.parseEther((1/WBTCWETH).toString()));
await limitOrderAccount.updateLimitOrders(WETH, WBTC, 1500000000, 0, ethers.utils.parseEther(".00005"), ethers.utils.parseEther((1/WBTCWETH).toString()));

  await limitOrderAccount.updateLimitOrders(WETH, WMATIC, 1678750000, 0, ethers.utils.parseEther("0.45"), ethers.utils.parseEther((1/WMATICWETH).toString()));
await limitOrderAccount.updateLimitOrders(WETH, WMATIC, 1679750000, 0, ethers.utils.parseEther("10"), ethers.utils.parseEther((1/WMATICWETH).toString()));
await limitOrderAccount.updateLimitOrders(WETH, WMATIC, 1500000000, 0, ethers.utils.parseEther(".00005"), ethers.utils.parseEther((1/WMATICWETH).toString()));

  await limitOrderAccount.updateLimitOrders(WMATIC, WBTC, 1678750000, 0, ethers.utils.parseEther("0.45"), ethers.utils.parseEther((WMATICWBTCW).toString()));
  await limitOrderAccount.updateLimitOrders(WMATIC, WBTC, 1678750000, 0, ethers.utils.parseEther("10"), ethers.utils.parseEther((WMATICWBTCW).toString()));
  await limitOrderAccount.updateLimitOrders(WMATIC, WBTC, 1678850000, 0, ethers.utils.parseEther(".00005"), ethers.utils.parseEther((WMATICWBTCW).toString()));

  console.log("txs sent")
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
