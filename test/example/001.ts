import { ethers, waffle } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";


describe("Volt Vault", function() {
    let accounts: SignerWithAddress[] = [];

    let owner: SignerWithAddress;
    let depositor1: SignerWithAddress;
    let depositor2: SignerWithAddress;
    let optionSeller: SignerWithAddress;
    let freeRecipient: SignerWithAddress;

    this.beforeAll("Set accounts", async () => {
        accounts = await ethers.getSigners();
        const [_owner, _freeRecipient, _depositor1, _depositor2, _seller] = accounts;
        owner = _owner;
        freeRecipient = _freeRecipient;
        depositor1 = _depositor1;
        depositor2 = _depositor2;
        optionSeller = _seller;
    })

})