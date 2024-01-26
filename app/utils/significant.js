import { Fraction, JSBI } from '@narfex/sdk';

const SIGNIFICANT_DIGITS = 10;
const PRECISION = new Fraction(JSBI.BigInt(1), JSBI.BigInt(10**SIGNIFICANT_DIGITS))

const significant = fraction => {
  if (!fraction || fraction.lessThan(PRECISION)) return '0';
  return fraction.toSignificant(SIGNIFICANT_DIGITS);
};

export default significant;
