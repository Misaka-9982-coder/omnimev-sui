export const ONE = 1000000000;

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