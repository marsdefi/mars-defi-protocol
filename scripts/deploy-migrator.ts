import { Contract } from 'ethers';
import { ethers } from 'hardhat';
import { CONTRACTS, MIGRATION_PERIOD, MIGRATION_START_TIME } from './config';

import { wait } from './utils';

export async function deployMigrator(
  shareV1: Contract,
  shareV2: Contract,
  shareV2LP: Contract,
  smarsPool: Contract,
  smarsPoolStore: Contract,
  smarsPoolWrapper: Contract,
  boardroomV2: Contract
): Promise<{ [name: string]: Contract }> {
  const [operator] = await ethers.getSigners();

  let tx;

  const Feeder = await ethers.getContractFactory('Feeder');
  const Swap = await ethers.getContractFactory('Swap');

  const feeder = await Feeder.connect(operator).deploy(
    shareV1.address,
    smarsPoolWrapper.address,
    shareV2LP.address,
    CONTRACTS.rinkeby.core.cmarsDaiPool,
    CONTRACTS.rinkeby.core.cmarsDaiPool,
    smarsPool.address,
    smarsPoolStore.address,
    boardroomV2.address,
    MIGRATION_START_TIME,
    MIGRATION_PERIOD
  );
  await wait(
    ethers,
    feeder.deployTransaction.hash,
    `deploy.feeder: ${feeder.address}`
  );

  tx = await smarsPoolStore.connect(operator).transferOwnership(feeder.address);
  await wait(ethers, tx.hash, `smarsPoolStore.transferOwnership`);

  const swap = await Swap.connect(operator).deploy(
    shareV1.address,
    shareV2.address,
    feeder.address,
    MIGRATION_START_TIME,
    MIGRATION_PERIOD
  );
  await wait(
    ethers,
    swap.deployTransaction.hash,
    `deploy.swap: ${swap.address}`
  );

  tx = await shareV2.connect(operator).transferOperator(swap.address);
  await wait(ethers, tx.hash, `shareV2.transferOwnership`);

  return { feeder, swap };
}
