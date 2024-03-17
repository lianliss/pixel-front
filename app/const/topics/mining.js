import {encodeEventSignature} from 'web3-eth-abi';
import ABI from 'const/ABI/PXLs';

const getEventTopic = (abi, name) => encodeEventSignature(
  abi.find(t => t.type === 'event' && t.name === name)
);

const events = {};
[
  'ReferReward',
].map(event => {
  events[event] = getEventTopic(ABI, event);
});

export default events;
