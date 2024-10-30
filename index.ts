import { HopApi, HopApiOptions } from "@hop.ag/sdk";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { SerializedSignature } from '@mysten/sui.js/cryptography';
import { div, ONE, lightBlue, green, red } from './utils/utils';
import * as dotenv from 'dotenv';

dotenv.config();

const { schema, secretKey } = decodeSuiPrivateKey(process.env.SUI_PRIVATE_KEY || "");
export const keypair = Ed25519Keypair.fromSecretKey(secretKey);

const RPC_URL = getFullnodeUrl("mainnet");
const sui_client = new SuiClient({ url: RPC_URL });

const HOP_API_OPTIONS: HopApiOptions = {
  api_key: process.env.HOP_API_KEY || "",
  fee_bps: 0,
  fee_wallet: process.env.FEE_WALLET || "",
};

const HOP_SDK = new HopApi(RPC_URL, HOP_API_OPTIONS);

// Token constants
const SUI_TOKEN = "0x2::sui::SUI";
const USDC_TOKEN = "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN";

async function executeTradeIfProfitable(
  amountIn: bigint = BigInt(ONE),
  tokenA: string = SUI_TOKEN,
  tokenB: string = USDC_TOKEN
) {
  try {
    const quoteResult = await performRoundTripQuote(amountIn, tokenA, tokenB);

    // 估算 gas 费用（这里假设每次交易的 gas 费用为 2e8 SUI）
    const estimatedGasFee = BigInt(4e5); // 两次交易的总 gas 费用

    if (quoteResult.profitOrLoss > estimatedGasFee) {
      console.log(green("Profitable trade detected. Executing trade..."));

      const txA2B = await HOP_SDK.fetchTx({
        trade: quoteResult.quoteA2B.trade,
        sui_address: keypair.getPublicKey().toSuiAddress(),
        gas_budget: 2e8,
        max_slippage_bps: 100,
        return_output_coin_argument: false,
      });

      const txBytesA2B = await txA2B.transaction.build({ client: sui_client });
      const signDataA2B = await Transaction.from(txBytesA2B).sign({ signer: keypair });
      const serializedSignatureA2B: SerializedSignature = signDataA2B.signature;

      const txB2A = await HOP_SDK.fetchTx({
        trade: quoteResult.quoteB2A.trade,
        sui_address: keypair.getPublicKey().toSuiAddress(),
        gas_budget: 2e8,
        max_slippage_bps: 100,
        return_output_coin_argument: false,
      });

      const txBytesB2A = await txB2A.transaction.build({ client: sui_client });
      const signDataB2A = await Transaction.from(txBytesB2A).sign({ signer: keypair });
      const serializedSignatureB2A: SerializedSignature = signDataB2A.signature;

      const txBytesA2BBase64 = Buffer.from(txBytesA2B).toString('base64');
      const txBytesB2ABase64 = Buffer.from(txBytesB2A).toString('base64');

      // 准备执行交易包
      const response = await fetch('https://rpc.suiflow.io', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'sui_executeTransactionBlockBundle',
          params: [
            [txBytesA2BBase64, txBytesB2ABase64],
            [[serializedSignatureA2B], [serializedSignatureB2A]]
          ]
        })
      });

      // console.log("Transaction bundle executed:", response);
      const bundleResult = await response.json();
      console.log("Transaction bundle executed:", bundleResult);

    } else {
      console.log(red("Trade is not profitable. Skipping execution."));
    }
  } catch (error) {
    console.error("An error occurred during trade execution:", error);
  }
}

async function performRoundTripQuote(
  amountIn: bigint,
  tokenA: string,
  tokenB: string
) {
  // 这里保留之前 performRoundTripQuote 函数的实现
  // ...
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

  // 返回结果
  return {
    quoteA2B,
    quoteB2A,
    roundTripRatio,
    profitOrLoss,
    tokenA,
    tokenB
  };
}

async function monitorAndExecuteTrades(
  amountIn: bigint = BigInt(ONE),
  tokenA: string = SUI_TOKEN,
  tokenB: string = USDC_TOKEN,
  intervalMs: number = 60000 // 默认每分钟检查一次
) {
  while (true) {
    try {
      console.log("Checking for profitable trades...");
      await executeTradeIfProfitable(amountIn, tokenA, tokenB);
    } catch (error) {
      console.error("An error occurred during trade monitoring:", error);
    }

    // 等待指定的时间间隔
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
}


// 启动监控
monitorAndExecuteTrades(BigInt(200000000), SUI_TOKEN, USDC_TOKEN, 20000);
// Auto-generated comment - 2025-07-13 14:23:16.541320

// Auto-generated comment - 2025-07-13 14:23:16.555666

// Auto-generated comment - 2025-07-13 14:23:16.754985

// Auto-generated comment - 2025-07-13 14:23:16.759243

// Auto-generated comment - 2025-07-13 14:23:16.763265

// Auto-generated comment - 2025-07-13 14:23:16.772989

// Auto-generated comment - 2025-07-13 14:23:16.891542

// Auto-generated comment - 2025-07-13 14:23:16.895970

// Auto-generated comment - 2025-07-13 14:23:17.158867

// Auto-generated comment - 2025-07-13 14:23:17.189520

// Auto-generated comment - 2025-07-13 14:23:17.199034

// Auto-generated comment - 2025-07-13 14:23:17.215987

// Auto-generated comment - 2025-07-13 14:23:17.354093

// Auto-generated comment - 2025-07-13 14:23:17.482182

// Auto-generated comment - 2025-07-13 14:23:17.516916

// Auto-generated comment - 2025-07-13 14:23:17.621673

// Auto-generated comment - 2025-07-13 14:23:17.652060

// Auto-generated comment - 2025-07-13 14:23:17.931639

// Auto-generated comment - 2025-07-13 14:23:18.209308

// Auto-generated comment - 2025-07-13 14:23:18.227945

// Auto-generated comment - 2025-07-13 14:23:18.232281

// Auto-generated comment - 2025-07-13 14:23:18.272952

// Auto-generated comment - 2025-07-13 14:23:18.285171

// Auto-generated comment - 2025-07-13 14:23:18.289623

// Auto-generated comment - 2025-07-13 14:23:18.411843

// Auto-generated comment - 2025-07-13 14:23:18.416212

// Auto-generated comment - 2025-07-13 14:23:18.420707

// Auto-generated comment - 2025-07-13 14:23:18.939576

// Auto-generated comment - 2025-07-13 14:23:18.956309

// Auto-generated comment - 2025-07-13 14:23:18.960502

// Auto-generated comment - 2025-07-13 14:23:19.092126

// Auto-generated comment - 2025-07-13 14:23:19.208447

// Auto-generated comment - 2025-07-13 14:23:19.219044

// Auto-generated comment - 2025-07-13 14:23:19.334317

// Auto-generated comment - 2025-07-13 14:23:19.351085

// Auto-generated comment - 2025-07-13 14:23:19.355450

// Auto-generated comment - 2025-07-13 14:23:19.619644

// Auto-generated comment - 2025-07-13 14:23:19.755388

// Auto-generated comment - 2025-07-13 14:23:19.868845

// Auto-generated comment - 2025-07-13 14:23:19.986581

// Auto-generated comment - 2025-07-13 14:23:20.043331

// Auto-generated comment - 2025-07-13 14:23:20.163388

// Auto-generated comment - 2025-07-13 14:23:20.175814

// Auto-generated comment - 2025-07-13 14:23:20.192059

// Auto-generated comment - 2025-07-13 14:23:20.347589

// Auto-generated comment - 2025-07-13 14:23:20.351628

// Auto-generated comment - 2025-07-13 14:23:20.360901

// Auto-generated comment - 2025-07-13 14:23:20.366064

// Auto-generated comment - 2025-07-13 14:23:20.491067

// Auto-generated comment - 2025-07-13 14:23:20.495246

// Auto-generated comment - 2025-07-13 14:23:20.635041

// Auto-generated comment - 2025-07-13 14:23:20.761314

// Auto-generated comment - 2025-07-13 14:23:20.873143

// Auto-generated comment - 2025-07-13 14:23:21.024912

// Auto-generated comment - 2025-07-13 14:23:21.171542

// Auto-generated comment - 2025-07-13 14:23:21.301937

// Auto-generated comment - 2025-07-13 14:23:21.457564

// Auto-generated comment - 2025-07-13 14:23:21.491993

// Auto-generated comment - 2025-07-13 14:23:21.864499

// Auto-generated comment - 2025-07-13 14:23:21.888736

// Auto-generated comment - 2025-07-13 14:23:22.035140

// Auto-generated comment - 2025-07-13 14:24:37.252404

// Auto-generated comment - 2025-07-13 14:24:37.368687

// Auto-generated comment - 2025-07-13 14:24:37.373043

// Auto-generated comment - 2025-07-13 14:24:37.592742

// Auto-generated comment - 2025-07-13 14:24:37.736961

// Auto-generated comment - 2025-07-13 14:24:37.759866

// Auto-generated comment - 2025-07-13 14:24:37.999896

// Auto-generated comment - 2025-07-13 14:24:38.008983

// Auto-generated comment - 2025-07-13 14:24:38.017351

// Auto-generated comment - 2025-07-13 14:24:38.300513

// Auto-generated comment - 2025-07-13 14:24:39.209867

// Auto-generated comment - 2025-07-13 14:24:39.221274

// Auto-generated comment - 2025-07-13 14:24:39.490177

// Auto-generated comment - 2025-07-13 14:24:39.677438

// Auto-generated comment - 2025-07-13 14:24:48.156538

// Auto-generated comment - 2025-07-13 14:24:48.311059

// Auto-generated comment - 2025-07-13 14:24:48.365987

// Auto-generated comment - 2025-07-13 14:24:48.405025

// Auto-generated comment - 2025-07-13 14:24:48.413237

// Auto-generated comment - 2025-07-13 14:24:48.532357

// Auto-generated comment - 2025-07-13 14:24:48.541771

// Auto-generated comment - 2025-07-13 14:24:48.546047

// Auto-generated comment - 2025-07-13 14:24:48.588872

// Auto-generated comment - 2025-07-13 14:24:48.715833

// Auto-generated comment - 2025-07-13 14:24:49.077574

// Auto-generated comment - 2025-07-13 14:24:49.212322

// Auto-generated comment - 2025-07-13 14:24:49.217800

// Auto-generated comment - 2025-07-13 14:24:49.467173

// Auto-generated comment - 2025-07-13 14:24:49.493101

// Auto-generated comment - 2025-07-13 14:24:49.535789

// Auto-generated comment - 2025-07-13 14:24:49.658864

// Auto-generated comment - 2025-07-13 14:24:49.784507

// Auto-generated comment - 2025-07-13 14:24:49.803719

// Auto-generated comment - 2025-07-13 14:24:50.043759

// Auto-generated comment - 2025-07-13 14:24:50.048043

// Auto-generated comment - 2025-07-13 14:24:50.173577

// Auto-generated comment - 2025-07-13 14:24:50.201368
