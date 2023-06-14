// for goerli
const vault = '0x12453Cd2575bcb98F3FA1B2D5D1bdF69f12e32e4';
const weth = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6';
const swap = '0x18C90516a38Dd7B779A8f6C19FA698F0F4Efc7FC';
const controller = '0x45fD0117d2eE5d70840880cCDcD3e03Dc328aef1';
const easyAuction = '0x1fbab40c338e2e7243da945820ba680c92ef8281'; // https://github.com/gnosis/ido-contracts/blob/e5ec2e696c2e1b68fe79a7ddc792b231d60fdf8c/deployments/goerli/EasyAuction.json
const vaultType = 0;

module.exports = [
    vault,
    weth,
    swap,
    easyAuction,
    controller,
    vaultType
];