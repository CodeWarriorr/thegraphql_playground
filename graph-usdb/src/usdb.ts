import { Transfer as TransferEvent } from "../generated/USDB/USDB";
import { Transfer, Account } from "../generated/schema";
import { BigDecimal, BigInt, ethereum, Address } from "@graphprotocol/graph-ts";
import { USDB } from "../generated/USDB/USDB";

//fetch account details
export function fetchAccount(address: string): Account | null {
  //check if account details are already saved
  let account = Account.load(address);
  if (!account) {
    //if account details are not available
    //create new account
    account = new Account(address);
    account.balance = BigDecimal.fromString("0");
    account.lastTransferBlockNo = BigInt.fromI32(0);
    account.lastTransferTxIndex = BigInt.fromI32(0);
    account.lastTransferTimestamp = BigInt.fromI32(0);
    account.save();
  }
  return account;
}

//fetch the current balance of a contract token
export function fetchBalance(
  tokenAddress: Address,
  accountAddress: Address
): BigDecimal {
  let erc20 = USDB.bind(tokenAddress); //bind token
  //set default value
  let amount = BigDecimal.fromString("0");
  //get balance
  let tokenBalance = erc20.try_balanceOf(accountAddress);
  if (!tokenBalance.reverted) {
    amount = tokenBalance.value.toBigDecimal();
  }
  return amount;
}

export function handleTransfer(event: TransferEvent): void {
  // save transfer entity
  let transfer = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  transfer.from = event.params.from;
  transfer.to = event.params.to;
  transfer.value = event.params.value;

  transfer.blockNumber = event.block.number;
  transfer.blockTimestamp = event.block.timestamp;
  transfer.transactionHash = event.transaction.hash;

  transfer.save();

  //get account addresses from event
  let fromAddress = event.params.from.toHex();
  let toAddress = event.params.to.toHex();

  //fetch account details
  let fromAccount = fetchAccount(fromAddress);
  let toAccount = fetchAccount(toAddress);

  if (!fromAccount || !toAccount) {
    return;
  }

  // update from account balance and last transfer details
  fromAccount.balance = fetchBalance(event.address, event.params.from);
  fromAccount.lastTransferBlockNo = event.block.number;
  fromAccount.lastTransferTxIndex = event.transaction.index;
  fromAccount.lastTransferTimestamp = event.block.timestamp;
  fromAccount.save();

  // update from account balance and last transfer details
  toAccount.balance = fetchBalance(event.address, event.params.to);
  toAccount.lastTransferBlockNo = event.block.number;
  toAccount.lastTransferTxIndex = event.transaction.index;
  toAccount.lastTransferTimestamp = event.block.timestamp;
  toAccount.save();
}
