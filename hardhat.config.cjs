require('dotenv').config();
require('@nomicfoundation/hardhat-ethers');
const { subtask } = require('hardhat/config');
const { TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD } = require('hardhat/builtin-tasks/task-names');
subtask(TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD).setAction(async ({ solcVersion }) => ({ compilerPath: require.resolve('solc/soljson.js'), isSolcJs: true, version: solcVersion, longVersion: require('solc').version() }));
module.exports = { solidity: {version: '0.8.28', settings: {optimizer: {enabled:true,runs:200}, evmVersion:'cancun'}}, networks: {sepolia: {url:process.env.QUICKNODE_SEPOLIA_URL || 'https://ethereum-sepolia-rpc.publicnode.com', chainId:11155111, accounts:process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : []}} };
