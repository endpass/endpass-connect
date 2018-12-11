import Web3 from 'web3';

export default new Web3(
  new Web3.providers.HttpProvider('https://eth-mainnet.endpass.com:2083'),
);
