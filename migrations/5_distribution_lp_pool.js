const knownContracts = require('./known-contracts');
const { POOL_START_DATE } = require('./pools');

const Cash = artifacts.require('Cash');
const Share = artifacts.require('Share');
const Oracle = artifacts.require('Oracle');
const IERC20 = artifacts.require('IERC20');
// const MockEURS = artifacts.require('MockEURS');

const EURSBACLPToken_BASPool = artifacts.require('EURSBACLPTokenSharePool')
const EURSBASLPToken_BASPool = artifacts.require('EURSBASLPTokenSharePool')

const UniswapV2Factory = artifacts.require('UniswapV2Factory');

module.exports = async (deployer, network, accounts) => {
  const uniswapFactory = ['dev'].includes(network)
    ? await UniswapV2Factory.deployed()
    : await UniswapV2Factory.at(knownContracts.UniswapV2Factory[network]);
  const eurs = await IERC20.at(knownContracts.EURS[network]);

  const oracle = await Oracle.deployed();

  const eurs_bac_lpt = await oracle.pairFor(uniswapFactory.address, Cash.address, eurs.address);
  const eurs_bas_lpt = await oracle.pairFor(uniswapFactory.address, Share.address, eurs.address);

  await deployer.deploy(EURSBACLPToken_BASPool, Share.address, eurs_bac_lpt, POOL_START_DATE);
  await deployer.deploy(EURSBASLPToken_BASPool, Share.address, eurs_bas_lpt, POOL_START_DATE);
};
