import baseTokens from 'const/baseTokens';
import _ from 'lodash';

/**
 * Returns all possible pairs combinations with entered tokens and base tokens
 * @param token0 {object}
 * @param token1 {object}
 * @returns {Array} - pairs
 */
const getAllPairsCombinations = (token0, token1, chainId = 56) => {

  let tokens = _.uniqBy([
    token0,
    token1,
    ...baseTokens.filter(t => t.chainId === chainId)
  ], 'address');

  const pairs = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    for (let j = i + 1; j < tokens.length; j++) {
      pairs.push([
        tokens[i],
        tokens[j],
      ]);
    }
  }

  return pairs;
};

export default getAllPairsCombinations;
