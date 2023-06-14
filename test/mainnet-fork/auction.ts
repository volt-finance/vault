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

const QUEUE_START = "0x0000000000000000000000000000000000000000000000000000000000000001";

describe("Goerli: Gnosis Auction", function () {
    let shortAction: VoltAction;
    // asset used by this action: in this case, weth
    let weth: IWETH;
    let usdc: MockERC20;

    let accounts: SignerWithAddress[] = [];
    let owner: SignerWithAddress;
    let depositor1: SignerWithAddress;
    let depositor2: SignerWithAddress;
    let buyer1: SignerWithAddress;

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

    const vaultAddress = "0x12453Cd2575bcb98F3FA1B2D5D1bdF69f12e32e4";
    const actionAddress = "0x7a9DeB970a508167f0111C8A13C74Cf39CC1F6dA";
    const tokenAddress = "0x3a9F08732ecB8A92f8db70d66085426941a9Bb21";

    this.beforeAll("Set accounts", async () => {
        provider = ethers.provider;

        accounts = await ethers.getSigners();
        const [_owner, _depositor1, _depositor2] = accounts;
        owner = _owner;
        buyer1 = _depositor1;

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

    it.only("p1 participate in first auction", async () => {
        // const auctionId = "103"; // expire date: Jun 16
        const auctionId = "105"; // expire date: Jun 14
        const buyer1BoughtAmount = 0.01 * 1e8; // 0.02 otoken
        const buyer1Premium = utils.parseEther("1");

        // await weth.connect(buyer1).deposit({ value: utils.parseEther("0.1") });
        // await weth.connect(buyer1).approve(easyAuction.address, ethers.constants.MaxUint256);
        const tx01 =await easyAuction.connect(buyer1).registerUser(buyer1.address);
        const txResult01 = await tx01.wait();
        console.log("txResult01:", txResult01);

        const tx = await easyAuction.connect(buyer1).placeSellOrders(
            auctionId,
            [buyer1BoughtAmount], // 0.02 otoken
            [buyer1Premium], // 1 eth
            [QUEUE_START],
            "0x00"
        );

        const txResult02 = await tx.wait();
        console.log("txResult02:", txResult02);
    });

});
