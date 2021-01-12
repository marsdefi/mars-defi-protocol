// https://docs.basis.cash/mechanisms/yield-farming
const INITIAL_BAC_FOR_POOLS = 50000;
const INITIAL_BAS_FOR_EURS_BAC = 750000;
const INITIAL_BAS_FOR_EURS_BAS = 250000;

const POOL_START_DATE = Date.parse('2021-01-19T00:00:00Z') / 1000;

const bacPools = [
  { contractName: 'BACDAIPool', token: 'DAI' },
  { contractName: 'BACSUSDPool', token: 'SUSD' },
  { contractName: 'BACUSDCPool', token: 'USDC' },
  { contractName: 'BACUSDTPool', token: 'USDT' },
  { contractName: 'BACyCRVPool', token: 'yCRV' },
];

const basPools = {
  EURSBAC: { contractName: 'EURSBACLPTokenSharePool', token: 'EURS_BAC-LPv2' },
  EURSBAS: { contractName: 'EURSBASLPTokenSharePool', token: 'EURS_BAS-LPv2' },
}

module.exports = {
  POOL_START_DATE,
  INITIAL_BAC_FOR_POOLS,
  INITIAL_BAS_FOR_EURS_BAC,
  INITIAL_BAS_FOR_EURS_BAS,
  bacPools,
  basPools,
};
