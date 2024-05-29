import { ethers } from "ethers";
import * as dotenv from "dotenv";

// load env variables
dotenv.config();

// connect to the blast node
const provider = new ethers.JsonRpcProvider(process.env.BLAST_RPC_URL);
// short form of ABI for USDB contract
const ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];
// create USDB contract instance
const usdbContract = new ethers.Contract(
  process.env.USDB_CONTRACT_ADDRESS ?? "",
  ABI,
  provider
);

async function getLastNUniqueAddresses(requestedAddressesSize: number) {
  // get the latest block number
  let latestBlock = await provider.getBlockNumber();

  const blocksPerFetch = 500; // number of blocks to fetch per call
  let startBlock = latestBlock - blocksPerFetch;
  let uniqueAddresses: Set<string> = new Set();

  // loop to fetch and process events until we have n unique addresses
  while (uniqueAddresses.size < requestedAddressesSize && startBlock > 0) {
    // fetch the Transfer events within the block range
    const events = (await usdbContract.queryFilter(
      "Transfer",
      startBlock,
      latestBlock
    )) as ethers.EventLog[];

    // process events
    for (const event of events) {
      const { from, to } = event.args;
      uniqueAddresses.add(from);
      if (uniqueAddresses.size >= requestedAddressesSize) break;
      uniqueAddresses.add(to);
      if (uniqueAddresses.size >= requestedAddressesSize) break;
    }

    // update the block range for the next iteration
    latestBlock = startBlock;
    startBlock = latestBlock - blocksPerFetch;
  }

  // convert the set to an array and return the last n unique addresses
  return Array.from(uniqueAddresses).slice(0, requestedAddressesSize);
}

(async () => {
  let n = process.argv[2] ? parseInt(process.argv[2]) : 1000; // default number of unique addresses to fetch

  console.time("task1");
  const addresses = await getLastNUniqueAddresses(n);

  console.table(addresses);
  console.timeEnd("task1");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
