const {
  basPools,
  INITIAL_BAS_FOR_EURS_BAC,
  INITIAL_BAS_FOR_EURS_BAS,
} = require('./pools');

// Pools
// deployed first
const Share = artifacts.require('Share');
const InitialShareDistributor = artifacts.require('InitialShareDistributor');

// ============ Main Migration ============

async function migration(deployer, network, accounts) {
  const unit = web3.utils.toBN(10 ** 18);
  const totalBalanceForEURSBAC = unit.muln(INITIAL_BAS_FOR_EURS_BAC)
  const totalBalanceForEURSBAS = unit.muln(INITIAL_BAS_FOR_EURS_BAS)
  const totalBalance = totalBalanceForEURSBAC.add(totalBalanceForEURSBAS);

  const share = await Share.deployed();

  const lpPoolEURSBAC = artifacts.require(basPools.EURSBAC.contractName);
  const lpPoolEURSBAS = artifacts.require(basPools.EURSBAS.contractName);

  await deployer.deploy(
    InitialShareDistributor,
    share.address,
    lpPoolEURSBAC.address,
    totalBalanceForEURSBAC.toString(),
    lpPoolEURSBAS.address,
    totalBalanceForEURSBAS.toString(),
  );
  const distributor = await InitialShareDistributor.deployed();

  await share.mint(distributor.address, totalBalance.toString());
  console.log(`Deposited ${INITIAL_BAS_FOR_EURS_BAC} BAS to InitialShareDistributor.`);

  console.log(`Setting distributor to InitialShareDistributor (${distributor.address})`);
  await lpPoolEURSBAC.deployed().then(pool => pool.setRewardDistribution(distributor.address));
  await lpPoolEURSBAS.deployed().then(pool => pool.setRewardDistribution(distributor.address));

  await distributor.distribute();
}

module.exports = migration;
