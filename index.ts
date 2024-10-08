import { HopApi, HopApiOptions } from "@hop.ag/sdk";
import { getFullnodeUrl } from "@mysten/sui/client";
import { div, ONE } from './utils';
import * as dotenv from 'dotenv';

dotenv.config();

const rpc_url = getFullnodeUrl("mainnet");

const hop_api_options: HopApiOptions = {
  api_key: process.env.HOP_API_KEY || "",
  fee_bps: 0,
  fee_wallet: "0x2",
};

const sdk = new HopApi(rpc_url, hop_api_options);

const quoteA2B = await sdk.fetchQuote({
  token_in: "0x2::sui::SUI",
  token_out: "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",
  amount_in:  BigInt(ONE),
});

console.log(quoteA2B.amount_out_with_fee)

const quoteB2A = await sdk.fetchQuote({
  token_in: "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",
  token_out: "0x2::sui::SUI",
  amount_in:  BigInt(quoteA2B.amount_out_with_fee),
});

console.log(quoteB2A.amount_out_with_fee)

console.log(div(quoteB2A.amount_out_with_fee, BigInt(ONE)));