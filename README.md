# USDB Token Transfers and Balances

## Node provider

The script uses the [BlastApi.io](https://blastapi.io) node provider to get the token transfers and balances.
Free plan covers up to 500 blocks per request, which is our main limitation in terms of fetching token transfers. Its free plan has also rate limiting, whitch severly impacts my possibilities.

## Installation

1. Install the dependencies:
```bash
npm i
```

2. Copy .env.example to .env and fill in the required values:
```bash
cp .env.example .env
```

## Task1

For the first task i've used only the BlastApi.io node provider RPC.

### How to run

```bash
make task1 n=1000
```

## Task2

For the second task i've used the graph. I've created a subgraph for the USDB token (blast mainnet), which is available at [here](https://api.studio.thegraph.com/query/76603/usdb/v0.0.4).

### How to run

```bash
make task2 n=10 i=0.5
```

## Limitations 

The main limitation for me was free plans of node providers and subgraph. 
Idealy i would use a full node to fetch the data. 

I've used the graph because it was impossible for me to fetch account balances with this much rate limiting. So I'm fetching ready to use data straight from the subgraph.
