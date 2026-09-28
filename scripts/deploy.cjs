const fs = require('node:fs');
const { ethers } = require('hardhat');
async function main() {
 if (!process.env.QUICKNODE_SEPOLIA_URL || !process.env.DEPLOYER_PRIVATE_KEY || !ethers.isAddress(process.env.BENEFICIARY_ADDRESS)) throw Error('Fill QUICKNODE_SEPOLIA_URL, DEPLOYER_PRIVATE_KEY and BENEFICIARY_ADDRESS in .env');
 if ((await ethers.provider.getNetwork()).chainId !== 11155111n) throw Error('Sepolia only');
 const board = await ethers.deployContract('PraiseBoard',[process.env.BENEFICIARY_ADDRESS]);
 const receipt = await board.deploymentTransaction().wait(2);
 const config = {address:await board.getAddress(), chainId:11155111, deploymentBlock:receipt.blockNumber, deploymentTransaction:receipt.hash, beneficiary:process.env.BENEFICIARY_ADDRESS, rpcUrl:process.env.PUBLIC_SEPOLIA_RPC || 'https://ethereum-sepolia-rpc.publicnode.com'};
 fs.mkdirSync('deployments',{recursive:true}); fs.writeFileSync('deployments/sepolia.json',JSON.stringify(config,null,2));
 fs.writeFileSync('dist/config.json',JSON.stringify(config,null,2));
 fs.appendFileSync('README.md',`\n## Sepolia deployment\nAddress: ${config.address}\nTransaction: https://sepolia.etherscan.io/tx/${receipt.hash}\n`);
 console.log('Deployed:',config.address);
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
