import { run, ethers } from "hardhat";

async function main() {
  await run("compile");

  // assets on goerli
  const weth = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6' // weth
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
    weth, 
    swap,
    controller,
    vaultType
  );

  console.log(`🍣 MyAction deployed at ${action.address}`)

  await vault.init(
    weth, // asset (weth)
    deployer.address, // owner.address,
    deployer.address, // feeRecipient
    weth,
    18,
    'MyVault share',
    'MVs',
    [action.address]
  )

  // deploy ETH Proxy to support ETH deposit
  const ETHProxy = await ethers.getContractFactory('ETHProxy');
  const proxy = await ETHProxy.deploy(vault.address, weth);
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
      weth, 
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
      weth
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
