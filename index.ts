// src/index.ts

import { getEachTokenRatio } from './utils/tradingUtils';

async function main() {
  try {
    await getEachTokenRatio()
  } catch (error) {
    console.error("An error occurred in main:", error);
  }
}

main();