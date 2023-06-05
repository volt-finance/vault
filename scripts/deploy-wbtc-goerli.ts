import { run, ethers } from "hardhat";

async function main() {
  await run("compile");

  // assets on goerli
  const wbtc = '0xC04B0d3107736C32e19F1c62b2aF67BE61d63a05' // wbtc
  const swap = '0x18C90516a38Dd7B779A8f6C19FA698F0F4Efc7FC'
  const controller = '0x45fD0117d2eE5d70840880cCDcD3e03Dc328aef1'
  const vaultType = 0

  const [deployer,] = await ethers.getSigners();
  console.log('deployer:', ethers.utils.formatEther(await deployer.getBalance()));

  // Deploy the PerpVault contract first
  const OpynPerpVault = await ethers.getContractFactory('OpynPerpVault');
  const vault = await OpynPerpVault.deploy();

  await vault.deployed();

  console.log(`🍩 Vault deployed at ${vault.address}`)

  const MyAction = await ethers.getContractFactory('MyAction');
  const action = await MyAction.deploy(
    vault.address,
    wbtc, 
    swap,
    controller,
    vaultType
  );

  console.log(`🍣 MyAction deployed at ${action.address}`)

  await vault.init(
    wbtc, // asset (wbtc)
    deployer.address, // owner.address,
    deployer.address, // feeRecipient
    wbtc,
    18,
    'Volt Finance share',
    'Volt',
    [action.address]
  )

  // deploy ETH Proxy to support ETH deposit
  const ETHProxy = await ethers.getContractFactory('ETHProxy');
  const proxy = await ETHProxy.deploy(vault.address, wbtc);
  await proxy.deployed();
  console.log(`🍙 Proxy deployed at ${proxy.address}`)


  // verify contracts at the end, so we make sure etherscan is aware of their existence
  // verify the vault
  await run("verify:verify", {
    address: vault.address, 
    network: ethers.provider.network
  })

  // verify the action
  await run("verify:verify", {
    address: action.address, 
    network: ethers.provider.network,
    constructorArguments: [
      vault.address,
      wbtc, 
      swap,
      controller,
      vaultType
    ]
  })  

  // verify the proxy
  await run("verify:verify", {
    address: proxy.address, 
    network: ethers.provider.network,
    constructorArguments: [
      vault.address,
      wbtc
    ]
  })  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
