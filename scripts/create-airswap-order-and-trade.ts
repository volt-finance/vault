import { ethers } from "hardhat";
import { BigNumber } from 'ethers'
import { createOrder, signOrder } from '@airswap/utils';

async function main() {

  // edit these
  const otokenToBuy = '0xc8C204a7dD92BAb2b83c7684567387f43d6c245E' // sender token
  const actionAddress = '0x6E1b2127D026D3f22fCC2F5afc07D571A7691fb2' // my action 

  // goerli weth and airswap address
  const wethAddress = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'
  const swap = '0x18C90516a38Dd7B779A8f6C19FA698F0F4Efc7FC'
  
  const [owner, signer] = await ethers.getSigners();

  // amount of otoken to buy
  const senderAmount = (0.1 * 1e8).toString()
  const collateralAmount = (0.1 * 1e18).toString()

  // amount of weth signer is paying
  const signerAmount = (0.05 * 1e18).toString()

  // use the second address derived from the mnemonic
  
  const order = createOrder({
    signer: {
      wallet: signer.address,
      token: wethAddress,
      amount: signerAmount,
    },
    sender: {
      wallet: actionAddress,
      token: otokenToBuy,
      amount: senderAmount,
    },
    expiry: parseInt((Date.now() / 1000).toString()) + 86400
  })

  const signedOrder = await signOrder(order, signer, swap);

  // check signer weth allowance
  const weth = await ethers.getContractAt('IWETH', wethAddress);

  const allowance: BigNumber = await weth.allowance(signer.address, swap)
  if (allowance.lt(signerAmount)) {
    await weth.connect(signer).approve(swap, signerAmount);
  }

  // Owner the order!
  const myAction = await ethers.getContractAt('VaultAction', actionAddress);
  const tx = await myAction.connect(owner).mintAndTradeAirSwapOTC(collateralAmount, senderAmount, signedOrder)
  console.log(`🍜 OTC order executed done. tx: ${tx.hash}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
