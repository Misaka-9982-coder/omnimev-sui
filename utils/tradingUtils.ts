// src/utils/tradingUtils.ts

import { HopApi, HopApiOptions } from "@hop.ag/sdk";
import { getFullnodeUrl } from "@mysten/sui/client";
import { div, ONE, lightBlue, green, red } from './utils';
import * as dotenv from 'dotenv';

dotenv.config();

const RPC_URL = getFullnodeUrl("mainnet");

const HOP_API_OPTIONS: HopApiOptions = {
  api_key: process.env.HOP_API_KEY || "",
  fee_bps: 0,
  fee_wallet: process.env.FEE_WALLET || "",
};

const HOP_SDK = new HopApi(RPC_URL, HOP_API_OPTIONS);

// Token constants
const SUI_TOKEN = "0x2::sui::SUI";
const USDC_TOKEN = "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN";

export async function getEachTokenRatio() {
  const tokens = (await HOP_SDK.fetchTokens()).tokens;
  for (const token of tokens) {
    try {
      if (token.coin_type !== SUI_TOKEN) {
        console.log(lightBlue(token.name));
        const result = await performRoundTripQuote(BigInt(ONE), SUI_TOKEN, token.coin_type);
        console.log("Round trip completed, trip ratio:", result.roundTripRatio);
        console.log()
      }
    } catch (error) {
      console.error(red("An error occurred during round trip quote:"), error);
      console.log()
    }
  }
}

export async function performRoundTripQuote(
  amountIn: bigint = BigInt(ONE) * BigInt(10),
  tokenA: string = SUI_TOKEN,
  tokenB: string = USDC_TOKEN
) {
  try {
    const quoteA2B = await HOP_SDK.fetchQuote({
      token_in: tokenA,
      token_out: tokenB,
      amount_in: amountIn,
    });

    console.log(`${tokenA} to ${tokenB} amount out:`, quoteA2B.amount_out_with_fee);

    const quoteB2A = await HOP_SDK.fetchQuote({
      token_in: tokenB,
      token_out: tokenA,
      amount_in: BigInt(quoteA2B.amount_out_with_fee),
    });

    console.log(`${tokenB} to ${tokenA} amount out:`, quoteB2A.amount_out_with_fee);

    const roundTripRatio = div(quoteB2A.amount_out_with_fee, amountIn);
    const profitOrLoss = quoteB2A.amount_out_with_fee - amountIn;

    if (profitOrLoss > 0n) {
      console.log(green("Profit:"), profitOrLoss.toString());
      console.log("Round trip ratio:", green(`${roundTripRatio}`));
      

    } else if (profitOrLoss < 0n) {
      console.log(red("Loss:"), profitOrLoss.toString());
      console.log("Round trip ratio:", red(`${roundTripRatio}`));
    } else {
      console.log(lightBlue("Break even"));
    }

    return {
      quoteA2B,
      quoteB2A,
      roundTripRatio,
      profitOrLoss,
      tokenA,
      tokenB
    };
  } catch (error) {
    throw error;
  }
}

// Auto-generated comment - 2025-07-13 14:23:16.559948

// Auto-generated comment - 2025-07-13 14:23:16.600575

// Auto-generated comment - 2025-07-13 14:23:16.739345

// Auto-generated comment - 2025-07-13 14:23:16.743876

// Auto-generated comment - 2025-07-13 14:23:16.768681

// Auto-generated comment - 2025-07-13 14:23:16.781941

// Auto-generated comment - 2025-07-13 14:23:17.004870

// Auto-generated comment - 2025-07-13 14:23:17.137713

// Auto-generated comment - 2025-07-13 14:23:17.175368

// Auto-generated comment - 2025-07-13 14:23:17.179630

// Auto-generated comment - 2025-07-13 14:23:17.220248

// Auto-generated comment - 2025-07-13 14:23:17.341482

// Auto-generated comment - 2025-07-13 14:23:17.460127

// Auto-generated comment - 2025-07-13 14:23:17.487726

// Auto-generated comment - 2025-07-13 14:23:17.496299

// Auto-generated comment - 2025-07-13 14:23:17.501754

// Auto-generated comment - 2025-07-13 14:23:17.639661

// Auto-generated comment - 2025-07-13 14:23:17.647566

// Auto-generated comment - 2025-07-13 14:23:17.692148

// Auto-generated comment - 2025-07-13 14:23:17.922505

// Auto-generated comment - 2025-07-13 14:23:18.240746

// Auto-generated comment - 2025-07-13 14:23:18.246272

// Auto-generated comment - 2025-07-13 14:23:18.250743

// Auto-generated comment - 2025-07-13 14:23:18.256294

// Auto-generated comment - 2025-07-13 14:23:18.437405

// Auto-generated comment - 2025-07-13 14:23:18.655595

// Auto-generated comment - 2025-07-13 14:23:18.668908

// Auto-generated comment - 2025-07-13 14:23:18.773518

// Auto-generated comment - 2025-07-13 14:23:18.952200

// Auto-generated comment - 2025-07-13 14:23:19.202723

// Auto-generated comment - 2025-07-13 14:23:19.213679

// Auto-generated comment - 2025-07-13 14:23:19.338565

// Auto-generated comment - 2025-07-13 14:23:19.470807

// Auto-generated comment - 2025-07-13 14:23:20.019975

// Auto-generated comment - 2025-07-13 14:23:20.026285

// Auto-generated comment - 2025-07-13 14:23:20.039141

// Auto-generated comment - 2025-07-13 14:23:20.339541

// Auto-generated comment - 2025-07-13 14:23:20.355738

// Auto-generated comment - 2025-07-13 14:23:20.529155

// Auto-generated comment - 2025-07-13 14:23:20.756785

// Auto-generated comment - 2025-07-13 14:23:21.000631

// Auto-generated comment - 2025-07-13 14:23:21.044265

// Auto-generated comment - 2025-07-13 14:23:21.193511

// Auto-generated comment - 2025-07-13 14:23:21.328849

// Auto-generated comment - 2025-07-13 14:23:21.337351

// Auto-generated comment - 2025-07-13 14:23:21.464175

// Auto-generated comment - 2025-07-13 14:23:21.469448

// Auto-generated comment - 2025-07-13 14:23:21.608520

// Auto-generated comment - 2025-07-13 14:23:21.740460

// Auto-generated comment - 2025-07-13 14:23:21.897305

// Auto-generated comment - 2025-07-13 14:23:22.158671

// Auto-generated comment - 2025-07-13 14:24:37.135412

// Auto-generated comment - 2025-07-13 14:24:37.362597

// Auto-generated comment - 2025-07-13 14:24:37.482622

// Auto-generated comment - 2025-07-13 14:24:37.597553

// Auto-generated comment - 2025-07-13 14:24:37.610033

// Auto-generated comment - 2025-07-13 14:24:37.614301

// Auto-generated comment - 2025-07-13 14:24:37.753354

// Auto-generated comment - 2025-07-13 14:24:38.156660

// Auto-generated comment - 2025-07-13 14:24:38.164605

// Auto-generated comment - 2025-07-13 14:24:38.168983

// Auto-generated comment - 2025-07-13 14:24:38.173200

// Auto-generated comment - 2025-07-13 14:24:38.288464

// Auto-generated comment - 2025-07-13 14:24:38.309119

// Auto-generated comment - 2025-07-13 14:24:38.318710

// Auto-generated comment - 2025-07-13 14:24:38.435723

// Auto-generated comment - 2025-07-13 14:24:38.684145

// Auto-generated comment - 2025-07-13 14:24:38.827971

// Auto-generated comment - 2025-07-13 14:24:39.055710

// Auto-generated comment - 2025-07-13 14:24:39.072823

// Auto-generated comment - 2025-07-13 14:24:39.216627

// Auto-generated comment - 2025-07-13 14:24:39.229884

// Auto-generated comment - 2025-07-13 14:24:39.358551

// Auto-generated comment - 2025-07-13 14:24:39.365418

// Auto-generated comment - 2025-07-13 14:24:48.165050

// Auto-generated comment - 2025-07-13 14:24:48.305734

// Auto-generated comment - 2025-07-13 14:24:48.324010

// Auto-generated comment - 2025-07-13 14:24:48.342589

// Auto-generated comment - 2025-07-13 14:24:48.346807

// Auto-generated comment - 2025-07-13 14:24:48.361670

// Auto-generated comment - 2025-07-13 14:24:48.528111

// Auto-generated comment - 2025-07-13 14:24:48.569373

// Auto-generated comment - 2025-07-13 14:24:48.583535

// Auto-generated comment - 2025-07-13 14:24:49.204426

// Auto-generated comment - 2025-07-13 14:24:49.503889

// Auto-generated comment - 2025-07-13 14:24:49.531420

// Auto-generated comment - 2025-07-13 14:24:49.649890

// Auto-generated comment - 2025-07-13 14:24:49.772427

// Auto-generated comment - 2025-07-13 14:24:50.205890

// Auto-generated comment - 2025-07-13 14:24:50.214613
