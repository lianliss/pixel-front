export function classNames() {
  let result = [];
  
  [].concat(Array.prototype.slice.call(arguments)).forEach(function (item) {
    if (!item) {
      return;
    }
    switch (typeof item === 'undefined' ? 'undefined' : typeof item) {
      case 'string':
        result.push(item);
        break;
      case 'object':
        Object.keys(item).forEach(function (key) {
          if (item[key]) {
            result.push(key);
          }
        });
        break;
      default:
        result.push('' + item);
    }
  });
  
  return result.join(' ');
}

export const getFixedNumber = (number, fixedNumber) => {
  if (!fixedNumber) return number;
  
  if (typeof number === 'string') {
    const indexOfFraction = number.indexOf('.') || number.indexOf(',');
    return indexOfFraction
      ? number.slice(0, indexOfFraction + (fixedNumber + 1))
      : number;
  }
  
  return Number(Number(number).toFixed(fixedNumber));
};

export { default as wei } from './wei';
export { default as processError } from './processError';
