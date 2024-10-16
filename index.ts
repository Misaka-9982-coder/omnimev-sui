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
  amountIn: bigint = BigInt(ONE) * BigInt(10),
  tokenA: string = SUI_TOKEN,
  tokenB: string = USDC_TOKEN
) {
  try {
    const result = await performRoundTripQuote(amountIn, tokenA, tokenB);

    // 估算 gas 费用（这里假设每次交易的 gas 费用为 2e8 SUI）
    const estimatedGasFee = BigInt(4e5); // 两次交易的总 gas 费用

    if (result.profitOrLoss > estimatedGasFee) {
      console.log(green("Profitable trade detected. Executing trade..."));

      const txA2B = await HOP_SDK.fetchTx({
        trade: result.quoteA2B.trade,
        sui_address: keypair.getPublicKey().toSuiAddress(),
        gas_budget: 2e8,
        max_slippage_bps: 100,
        return_output_coin_argument: false,
      });

      const txBytesA2B = await txA2B.transaction.build({ client: sui_client });
      const signDataA2B = await Transaction.from(txBytesA2B).sign({ signer: keypair });
      const serializedSignatureA2B: SerializedSignature = signDataA2B.signature;

      const resA2B = await sui_client.executeTransactionBlock({
        transactionBlock: txBytesA2B,
        signature: [serializedSignatureA2B],
      });

      console.log("Transaction A to B executed:", resA2B);

      // 等待交易确认
      const confirmedTxA2B = await sui_client.waitForTransaction({
        digest: resA2B.digest,
        timeout: 30000, // 30 秒超时
      });
      
      console.log("Transaction A to B confirmed:", confirmedTxA2B);

      // 等待并检查 TokenB 余额
      const expectedTokenBAmount = BigInt(result.quoteA2B.amount_out_with_fee);
      await waitForTokenBalance(tokenB, expectedTokenBAmount);

      console.log(`Sufficient ${tokenB} balance detected. Proceeding with B to A trade.`);

      const txB2A = await HOP_SDK.fetchTx({
        trade: result.quoteB2A.trade,
        sui_address: keypair.getPublicKey().toSuiAddress(),
        gas_budget: 2e8,
        max_slippage_bps: 100,
        return_output_coin_argument: false,
      });

      const txBytesB2A = await txB2A.transaction.build({ client: sui_client });
      const signDataB2A = await Transaction.from(txBytesB2A).sign({ signer: keypair });
      const serializedSignatureB2A: SerializedSignature = signDataB2A.signature;

      const resB2A = await sui_client.executeTransactionBlock({
        transactionBlock: txBytesB2A,
        signature: [serializedSignatureB2A],
      });

      console.log("Transaction B to A executed:", resB2A);

      // 等待交易确认
      const confirmedTxB2A = await sui_client.waitForTransaction({
        digest: resB2A.digest,
        timeout: 30000, // 30 秒超时
      });

      console.log("Transaction B to A confirmed:", confirmedTxB2A);
    } else {
      console.log(red("Trade is not profitable. Skipping execution."));
    }
  } catch (error) {
    console.error("An error occurred during trade execution:", error);
  }
}

async function waitForTokenBalance(tokenType: string, expectedAmount: bigint, maxAttempts: number = 30, intervalMs: number = 1000) {
  for (let i = 0; i < maxAttempts; i++) {
    const balance = await sui_client.getBalance({
      owner: keypair.getPublicKey().toSuiAddress(),
      coinType: tokenType,
    });

    if (BigInt(balance.totalBalance) >= expectedAmount) {
      console.log(`Sufficient balance of ${tokenType} detected: ${balance.totalBalance}`);
      return;
    }

    console.log(`Waiting for ${tokenType} balance. Current: ${balance.totalBalance}, Expected: ${expectedAmount}`);
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  throw new Error(`Timeout waiting for sufficient ${tokenType} balance`);
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
  amountIn: bigint = BigInt(ONE) * BigInt(10),
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