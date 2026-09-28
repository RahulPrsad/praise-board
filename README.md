# The Praise Board

A permissionless thank-you wall for Ifeoma’s community bus timetable. Solidity + Hardhat + ethers v6; a lightweight, responsive static frontend. No platform fee, server database, custodial wallet, or owner-controlled supporter list.

## Delivery status

**Sepolia contract: not deployed yet.** No address or testnet transaction is claimed. Deployment requires the local `.env` values and a funded Sepolia burner wallet. The UI intentionally shows an empty deployment-pending state until these are configured. This repository is prepared locally; publishing it to a public GitHub repository requires your GitHub access.

## Run

Requires Node.js 22+ and an Ethereum browser wallet.

```sh
npm ci
npm test
npm run build
npm start
```

Open http://127.0.0.1:4173. `.env` is already created locally and ignored by Git. For a fresh clone, copy `.env.example` to `.env`.

## Deploy with QuickNode

1. Create an Ethereum Sepolia endpoint in QuickNode. Put its HTTPS URL in `QUICKNODE_SEPOLIA_URL` in `.env`.
2. Create a fresh burner wallet. Put its private key in `DEPLOYER_PRIVATE_KEY` locally. Never share it, commit it, or use a wallet holding real assets.
3. Request Sepolia ETH for that wallet from https://faucet.quicknode.com/ethereum/sepolia (eligibility and availability are controlled by the faucet).
4. Set `BENEFICIARY_ADDRESS` to Ifeoma’s wallet. Check it carefully: it is immutable, and only that address can withdraw.
5. Run `npm run deploy:sepolia`. The script checks the chain, deploys through QuickNode, waits two confirmations, saves `deployments/sepolia.json`, configures the page, and appends the actual deployed address to this README.
6. Run `npm run build` and publish `dist/` to static hosting. The private QuickNode endpoint is never bundled. The browser uses `PUBLIC_SEPOLIA_RPC`, which must be a public or explicitly browser-safe endpoint.
7. Connect a funded commuter wallet, switch to Sepolia, and send `0.001` ETH with a note. Save the confirmed transaction URL as your demo evidence.

## Hackathon demo (90 seconds)

- Explain the problem: 9,000 commuters rely on a volunteer’s timetable; existing tip services impose fees and access restrictions.
- Open the page and connect a wallet. Demonstrate the wrong-network recovery.
- Send a small Sepolia tip and a note. Show the wallet prompt, pending state, confirmed message, and on-chain wall entry.
- Open the contract link and inspect the `TipReceived` event in the transaction receipt. Read the same tip with `getTip`.
- Connect the beneficiary wallet and withdraw. Show that the permanent tip history remains.

## Trust and architecture

`tip(name,note)` atomically stores the sender, value, timestamp, name and note, updates total lifetime tips, and emits `TipReceived` with the array index. The frontend reads paginated contract storage at one block height per refresh. Storage is the source of truth; events provide independently inspectable receipts. No off-chain database, local storage, or fabricated cards populate the wall.

The most recent 20 entries load initially; earlier entries are paginated. Reads refresh every 12 seconds and immediately after a confirmed receipt. A network failure is visibly marked; old records are not presented as fresh. One confirmation is shown in the UI, not finality: chain reorganizations can change recent entries, and the next refresh reconciles them. Public RPCs are infrastructure dependencies; readers can choose another endpoint or inspect the contract independently.

Names are self-asserted, not verified identities. User text is rendered with `textContent`. Notes are permanent and public; there is no owner deletion, editing, or moderation. Names are limited to 40 UTF-8 bytes and notes to 280, enforced on both sides. Wallet addresses remain the canonical identity. Sepolia ETH has no monetary value; the interface does not imply dollar pricing.

## Treasury and contract limits

Tips accumulate in the contract. Only the immutable beneficiary can withdraw the entire available balance, always to that same address. There is no fee recipient, administrator upgrade, pause, arbitrary payout address, or ownership transfer. Withdrawal uses a reentrancy lock and checked external call; failure reverts. A lost beneficiary key permanently prevents withdrawals. Direct plain ETH transfers revert; forced ETH can increase balance without creating a supporter record, so lifetime tips and withdrawable balance are intentionally separate.

The beneficiary may be a smart-contract wallet capable of receiving ETH. Each tip stores data on-chain, trading gas cost for simple permanent retrieval. No mainnet deployment is configured. This is a tested hackathon implementation, not an independently audited production contract.

## Validation

`npm test` exercises persisted records and emitted events, zero tips, name and multibyte note boundaries, authorization, withdrawal history, pagination and invalid deployment/direct transfer paths. Before claiming acceptance, complete the real Sepolia transaction demo above; local tests do not replace it.

## Public repository

After signing in with GitHub CLI, create a public repository from this directory:

```sh
git init
git add .
git commit -m "Build Praise Board dApp"
gh repo create praise-board --public --source=. --push
```

Check `git status --ignored` before pushing: `.env` and `node_modules` must remain ignored. Include the generated deployment JSON and updated README after deploying. Keep deployment credentials out of screenshots and recordings.

## References

- ethers v6: https://docs.ethers.org/v6/single-page/
- Hardhat: https://v2.hardhat.org/hardhat-runner/docs/getting-started
- Ethereum deployment: https://ethereum.org/developers/docs/smart-contracts/deploying/

MIT licensed. See LICENSE.

Local verification: Solidity 0.8.28 compiled successfully; all 5 contract tests passed. Frontend JavaScript syntax and HTTP serving passed. A workspace-scoped Hardhat settings adapter was used for this sandbox’s filesystem restrictions. Wallet UI and real Sepolia transaction remain unverified. Optional WebMCP read-tool browser validation was unavailable.
