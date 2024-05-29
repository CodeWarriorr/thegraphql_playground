import { Account, execute } from "../.graphclient";

const accountQuery = `#graphql
  query accounts($limit: Int!, $skip: Int = 0){
    accounts(first: $limit, skip: $skip, orderBy: lastTransferTimestamp, orderDirection: desc) {
      id
      balance
      lastTransferBlockNo
      lastTransferTxIndex
      lastTransferTimestamp
    }
  }
`;

// fetch accounts from the subgraph
const getAccounts = async (limit: number, skip: number) => {
  const result = await execute(accountQuery, {
    limit: limit,
    skip: skip,
  });
  return result.data.accounts;
};

// fetch n accounts from the subgraph (fetches in batches of 1000)
const getNAccounts = async (n: number) => {
  const accounts = [];
  let left = n;
  let skip = 0;
  while (left > 0) {
    const result = await getAccounts(Math.min(left, 1000), skip);
    accounts.push(...result);
    left -= 1000;
    skip += 1000;
  }
  return accounts;
};

(async () => {
  const n = process.argv[2] ? parseInt(process.argv[2]) : 1000;
  const interval = process.argv[3] ? parseInt(process.argv[3]) : 1;

  let isRunning = false;
  let accounts: Account[] = [];

  // fetch accounts every interval seconds
  setInterval(async () => {
    if (isRunning) {
      return;
    }
    isRunning = true;
    console.time("task2");
    accounts = await getNAccounts(n);

    // sort accounts by last transfer timestamp and tx index
    accounts = accounts.sort((a, b) => {
      return (
        a.lastTransferTimestamp - b.lastTransferTimestamp ||
        a.lastTransferTxIndex - b.lastTransferTxIndex
      );
    });

    isRunning = false;

    // display the accounts in form of a table
    console.table(accounts.slice(0, n));
    console.timeEnd("task2");
  }, interval * 1000);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
