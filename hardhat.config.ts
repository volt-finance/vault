import '@nomiclabs/hardhat-waffle';
import "@nomiclabs/hardhat-etherscan";
import '@typechain/hardhat';
import "solidity-coverage"
import "hardhat-prettier";
import "hardhat-contract-sizer";
// import "hardhat-gas-reporter";

import * as fs from 'fs';
import * as dotenv from 'dotenv'

dotenv.config()

const mnemonic = fs.existsSync('.secret')
  ? fs
      .readFileSync('.secret')
      .toString()
      .trim()
  : "test test test test test test test test test test test junk"
// const mnemonic = 'test test test test test test test test test test test junk'


const infuraKey = process.env.INFURA_KEY
const etherscanKey = process.env.ETHERSCAN_KEY

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

export default {
  networks: {
    // localhost: {
    //   url: 'http://127.0.0.1:8545',
    //   accounts: ['0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e'],
    // },
    hardhat: {
      allowUnlimitedContractSize: true,
    },
    localhost: {
      forking: {
        url: `https://mainnet.infura.io/v3/${infuraKey}`,
        enabled: process.env.FORK === 'true'
      },
      gas: 12000000,
      blockGasLimit: 0x1fffffffffffff,
      allowUnlimitedContractSize: true,
      accounts: ['0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e'],
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${infuraKey}`,
      accounts:['19d1127ce175c7374cd37fd4f41bfbf2308a09802a1cc4619f0800181b74c35f'],
      gas: 12000000,
      // accounts: {
      //   mnemonic: mnemonic,
      // },
    },
    // ropsten: {
    //   url: `https://ropsten.infura.io/v3/${infuraKey}`,
    //   accounts: {
    //     mnemonic: mnemonic,
    //   },
    // },
  },
  solidity: '0.7.6',
  settings: {
    optimizer: {
      enabled: true,
      runs: 1
    }
  },
  typechain: {
    outDir: 'typechain',
    target: 'ethers-v5',
  },
  contractSizer: {
    alphaSort: true,
  },
  etherscan: {
    apiKey: etherscanKey
  },
  mocha: {
    timeout: 150000
  }
};
