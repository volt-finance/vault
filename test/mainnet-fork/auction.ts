import { ethers } from "hardhat";
import { utils, BigNumber, providers, constants } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import {
    MockERC20,
    OpynPerpVault,
    IWETH,
    IEasyAuction,
    VoltAction,
    IOToken,
} from "../../typechain";


describe("Goerli: Gnosis Auction", function () {
    let shortAction: VoltAction;
    // asset used by this action: in this case, weth
    let weth: IWETH;
    let usdc: MockERC20;

    let accounts: SignerWithAddress[] = [];
    let owner: SignerWithAddress;
    let depositor1: SignerWithAddress;
    let depositor2: SignerWithAddress;

    // core
    let vault: OpynPerpVault;
    let action: VoltAction;
    let oToken: IOToken;

    let easyAuction: IEasyAuction;
    let provider: providers.JsonRpcProvider;
    let auctionDeadline: number;
    let auctionId: BigNumber;


    /**
     *
     * CONSTANTS
     *
     */
    const day = 86400;
    const easyAuctionAddress = "0x1fbab40c338e2e7243da945820ba680c92ef8281";
    const opynOwner = "0xC61042a7e9a6fe7E738550f24030D37Ecb296DC0";
    const usdcAddress = "0xd87ba7a50b2e7e660f678a895e4b72e7cb4ccd9c";
    const wethAddress = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";

    const vaultAddress = "0xd6e7014C8f28f8c55025b395058f8C62d35677c9";
    const actionAddress = "0xd7A89B6a341c99E8Bdbad9E0fC8CBd14edB0E9e1";
    const tokenAddress = "0x6E7Ca9e6fFd41ed2094dfD659176b2EbEe160a71";

    this.beforeAll("Set accounts", async () => {
        provider = ethers.provider;

        accounts = await ethers.getSigners();
        const [_owner, _depositor1, _depositor2] = accounts;
        owner = _owner;

        depositor1 = _depositor1;
        depositor2 = _depositor2;
        console.log('owner:', owner.address);
        console.log('depositor1:', depositor1.address);
        console.log('depositor2:', depositor2.address);
    });

    this.beforeAll("Connect to goerli contracts", async () => {
        weth = (await ethers.getContractAt("IWETH", wethAddress)) as IWETH;
        usdc = (await ethers.getContractAt("MockERC20", usdcAddress)) as MockERC20;

        vault = (await ethers.getContractAt("OpynPerpVault", vaultAddress)) as OpynPerpVault;
        action = (await ethers.getContractAt("VoltAction", actionAddress)) as VoltAction;
        oToken = (await ethers.getContractAt("IOToken", tokenAddress)) as IOToken;
        easyAuction = (await ethers.getContractAt("IEasyAuction", easyAuctionAddress)) as IEasyAuction;
    });

    it("owner mints and starts auction", async () => {
        const minPremium = utils.parseEther("3");
        // const collateralAmount = await weth.balanceOf(actionAddress);
        // console.log("WETH collateralAmount:", collateralAmount.toString());
        // for test
        const collateralAmount = utils.parseEther("0.1");

        const mintAmount = collateralAmount.div(1e10).toString();
        const sellAmount = mintAmount;

        const blockNumber = await provider.getBlockNumber();
        const block = await provider.getBlock(blockNumber);
        const currentTimestamp = block.timestamp;
        auctionDeadline = currentTimestamp + day * 1;

        const minimalBidAmountPerOrder = 0.1 * 1e8; // min bid each order: 0.1 otoken
        const minFundingThreshold = 0;

        console.log("collateralAmount:", collateralAmount.toString());
        console.log("mintAmount:", mintAmount.toString());
        console.log("sellAmount:", sellAmount.toString());
        console.log("auctionDeadline:", auctionDeadline.toString());
        console.log("minimalBidAmountPerOrder:", minimalBidAmountPerOrder.toString());
        console.log("minFundingThreshold:", minFundingThreshold.toString());

        const easyAuctionOTokenBefore = await oToken.balanceOf(easyAuctionAddress);
        console.log("easyAuctionOTokenBefore:", easyAuctionOTokenBefore.toString());


        // mint and sell oTokens
        await action.mintAndStartAuction(
            collateralAmount,
            mintAmount,
            sellAmount,
            auctionDeadline, // order cancel deadline
            auctionDeadline,
            minPremium,
            minimalBidAmountPerOrder,
            minFundingThreshold,
            false
        );
        auctionId = await easyAuction.auctionCounter();
        console.log("auctionId:", auctionId.toString());

        const easyAuctionOTokenAfter = await oToken.balanceOf(easyAuctionAddress);
        console.log("easyAuctionOTokenAfter:", easyAuctionOTokenAfter.toString());
    });
});
