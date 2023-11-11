export const ONE = 1000000000;
// src/utils/utils.ts

// ... 其他现有的导出 ...

// ANSI 转义码
const RESET = "\x1b[0m";
const LIGHT_BLUE = "\x1b[94m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";

export function lightBlue(text: string): string {
  return `${LIGHT_BLUE}${text}${RESET}`;
}

export function green(text: string): string {
  return `${GREEN}${text}${RESET}`;
}

export function red(text: string): string {
  return `${RED}${text}${RESET}`;
}

export function div(numerator: bigint, denominator: bigint, decimalPlaces: number = 6): string {
    // 检查除数是否为零
    if (denominator === 0n) {
      throw new Error("Division by zero");
    }
  
    // 设置精度
    const precision = 10n ** BigInt(decimalPlaces);
  
    // 处理负数情况
    const isNegative = (numerator < 0n) !== (denominator < 0n);
    numerator = numerator < 0n ? -numerator : numerator;
    denominator = denominator < 0n ? -denominator : denominator;
  
    // 执行除法
    let result = (numerator * precision) / denominator;
  
    // 四舍五入
    const remainder = (numerator * precision) % denominator;
    if (remainder * 2n >= denominator) {
      result += 1n;
    }
  
    // 转换结果为字符串
    let resultString = result.toString();
  
    // 添加小数点
    if (decimalPlaces > 0) {
      resultString = resultString.padStart(decimalPlaces + 1, '0');
      resultString = resultString.slice(0, -decimalPlaces) + '.' + resultString.slice(-decimalPlaces);
    }
  
    // 处理负数
    if (isNegative) {
      resultString = '-' + resultString;
    }
  
    // 移除尾随的零和不必要的小数点
    resultString = resultString.replace(/\.?0+$/, '');
  
    return resultString;
  }
// Auto-generated comment - 2025-07-13 14:23:16.571998

// Auto-generated comment - 2025-07-13 14:23:16.606094

// Auto-generated comment - 2025-07-13 14:23:17.025682

// Auto-generated comment - 2025-07-13 14:23:17.032266

// Auto-generated comment - 2025-07-13 14:23:17.150933

// Auto-generated comment - 2025-07-13 14:23:17.207531

// Auto-generated comment - 2025-07-13 14:23:17.492055

// Auto-generated comment - 2025-07-13 14:23:17.657641

// Auto-generated comment - 2025-07-13 14:23:17.674923

// Auto-generated comment - 2025-07-13 14:23:18.089330

// Auto-generated comment - 2025-07-13 14:23:18.094459

// Auto-generated comment - 2025-07-13 14:23:18.264613

// Auto-generated comment - 2025-07-13 14:23:18.302436

// Auto-generated comment - 2025-07-13 14:23:18.406629

// Auto-generated comment - 2025-07-13 14:23:18.432301

// Auto-generated comment - 2025-07-13 14:23:18.812770

// Auto-generated comment - 2025-07-13 14:23:18.917511

// Auto-generated comment - 2025-07-13 14:23:18.933751

// Auto-generated comment - 2025-07-13 14:23:18.943814

// Auto-generated comment - 2025-07-13 14:23:19.342744

// Auto-generated comment - 2025-07-13 14:23:19.359552

// Auto-generated comment - 2025-07-13 14:23:19.465395

// Auto-generated comment - 2025-07-13 14:23:19.476290

// Auto-generated comment - 2025-07-13 14:23:19.748728

// Auto-generated comment - 2025-07-13 14:23:19.976456

// Auto-generated comment - 2025-07-13 14:23:19.990792

// Auto-generated comment - 2025-07-13 14:23:20.007798

// Auto-generated comment - 2025-07-13 14:23:20.149247

// Auto-generated comment - 2025-07-13 14:23:20.331069

// Auto-generated comment - 2025-07-13 14:23:20.335277

// Auto-generated comment - 2025-07-13 14:23:20.512883

// Auto-generated comment - 2025-07-13 14:23:20.516976

// Auto-generated comment - 2025-07-13 14:23:20.645688

// Auto-generated comment - 2025-07-13 14:23:20.865853

// Auto-generated comment - 2025-07-13 14:23:21.009907

// Auto-generated comment - 2025-07-13 14:23:21.013890

// Auto-generated comment - 2025-07-13 14:23:21.180741

// Auto-generated comment - 2025-07-13 14:23:21.497130

// Auto-generated comment - 2025-07-13 14:23:21.892893

// Auto-generated comment - 2025-07-13 14:23:21.906624

// Auto-generated comment - 2025-07-13 14:23:21.911919

// Auto-generated comment - 2025-07-13 14:23:22.048091

// Auto-generated comment - 2025-07-13 14:24:37.143904

// Auto-generated comment - 2025-07-13 14:24:37.256805

// Auto-generated comment - 2025-07-13 14:24:38.004383

// Auto-generated comment - 2025-07-13 14:24:38.013182

// Auto-generated comment - 2025-07-13 14:24:38.047161

// Auto-generated comment - 2025-07-13 14:24:38.151637

// Auto-generated comment - 2025-07-13 14:24:38.304819

// Auto-generated comment - 2025-07-13 14:24:38.445597

// Auto-generated comment - 2025-07-13 14:24:38.561875

// Auto-generated comment - 2025-07-13 14:24:38.689529

// Auto-generated comment - 2025-07-13 14:24:38.700633

// Auto-generated comment - 2025-07-13 14:24:38.822181

// Auto-generated comment - 2025-07-13 14:24:38.833723

// Auto-generated comment - 2025-07-13 14:24:38.945170

// Auto-generated comment - 2025-07-13 14:24:39.225618

// Auto-generated comment - 2025-07-13 14:24:39.504104

// Auto-generated comment - 2025-07-13 14:24:39.542694

// Auto-generated comment - 2025-07-13 14:24:39.681731

// Auto-generated comment - 2025-07-13 14:24:48.282399

// Auto-generated comment - 2025-07-13 14:24:48.294925

// Auto-generated comment - 2025-07-13 14:24:48.372619

// Auto-generated comment - 2025-07-13 14:24:48.381963

// Auto-generated comment - 2025-07-13 14:24:48.400821

// Auto-generated comment - 2025-07-13 14:24:48.599675

// Auto-generated comment - 2025-07-13 14:24:48.938035
