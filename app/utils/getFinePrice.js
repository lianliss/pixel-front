const getFinePrice = (number, options = {}) => {
  const minPrice = typeof options.minPrice === 'undefined'
    ? 0.000001
    : options.minPrice;
  let price = Math.abs(number);
  let digits = 0;
  const minDigits = price < 1 ? 2 : 2;
  if (!price || price < minPrice) return '0.00';
  while (price < 100) {
    digits++;
    price *= 10;
  }
  return number > 1
    ? number.toFixed(Math.max(minDigits, digits))
      .split('') // 1000.22 to 1 000.22
      .reverse()
      .join('')
      .replace(/\d\d\d/g, '$& ')
      .split('')
      .reverse()
      .join('')
      .trim()
    : number.toFixed(Math.max(minDigits, digits));
};

export default getFinePrice;
