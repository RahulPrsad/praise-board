const fs=require('node:fs');
fs.copyFileSync('node_modules/ethers/dist/ethers.min.js','dist/ethers.min.js');
if(!fs.existsSync('dist/config.json')) fs.writeFileSync('dist/config.json',JSON.stringify({address:null,chainId:11155111,rpcUrl:'https://ethereum-sepolia-rpc.publicnode.com'}));
console.log('Static site ready in dist/');
