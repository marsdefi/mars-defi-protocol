import { BigNumber, Contract } from 'ethers';
import { ethers } from 'hardhat';
import {
  SMARSV1_REWARD_RATE,
  SMARSV2_POOL_FINISH,
  MIGRATION_START_TIME,
} from './config';

import { wait } from './utils';

export async function deployPool(
  shareV2: Contract,
  shareV2LP: Contract
): Promise<{ [name: string]: Contract }> {
  const [operator] = await ethers.getSigners();

  const PoolStore = await ethers.getContractFactory('PoolStore');
  const PoolWrapper = await ethers.getContractFactory('PoolWrapper');
  const CMARSPool = await ethers.getContractFactory('SMARSPool');
  const SMARSPool = await ethers.getContractFactory('SMARSPool');

  let tx;

  // smars pool
  const smarsPoolStore = await PoolStore.connect(operator).deploy();
  await wait(
    ethers,
    smarsPoolStore.deployTransaction.hash,
    `deploy.smarsPoolStore: ${smarsPoolStore.address}`
  );

  const smarsPool = await SMARSPool.connect(operator).deploy(
    shareV2.address,
    smarsPoolStore.address,
    MIGRATION_START_TIME
  );
  await wait(
    ethers,
    smarsPool.deployTransaction.hash,
    `deploy.smarsPool: ${smarsPool.address}`
  );

  const smarsPoolWrapper = await PoolWrapper.connect(operator).deploy(
    smarsPool.address,
    0
  );
  await wait(
    ethers,
    smarsPoolWrapper.deployTransaction.hash,
    `deploy.smarsPoolWrapper: ${smarsPoolWrapper.address}`
  );

  tx = await smarsPoolStore
    .connect(operator)
    .addPool(
      'BoardroomV2',
      smarsPoolWrapper.address,
      ethers.utils.parseEther('1')
    );
  await wait(ethers, tx.hash, `smarsPoolStore.addPool`);

  tx = await smarsPoolStore
    .connect(operator)
    .addPool('SMARSv2-DAI LP Pool', shareV2LP.address, '0');
  await wait(ethers, tx.hash, `smarsPoolStore.addPool`);

  const period = SMARSV2_POOL_FINISH - MIGRATION_START_TIME;
  const amount = BigNumber.from(SMARSV1_REWARD_RATE).mul(period);

  tx = await shareV2.connect(operator).mint(operator.address, amount);
  await wait(ethers, tx.hash, `shareV2.mint`);

  tx = await shareV2.connect(operator).approve(smarsPool.address, amount);
  await wait(ethers, tx.hash, `shareV2.approve`);

  tx = await smarsPool.notifyReward(amount, period);
  await wait(ethers, tx.hash, `smarsPool.notifyReward`);

  // after setup
  tx = await smarsPoolWrapper
    .connect(operator)
    .approve(smarsPoolStore.address, ethers.utils.parseEther('1'));
  await wait(ethers, tx.hash, `smarsPoolWrapper.approve`);

  tx = await smarsPoolStore
    .connect(operator)
    .deposit(0, smarsPoolWrapper.address, ethers.utils.parseEther('1'));
  await wait(ethers, tx.hash, `smarsPoolStore.deposit`);

  tx = await smarsPoolStore.connect(operator).transferOperator(smarsPool.address);
  await wait(ethers, tx.hash, `smarsPoolStore.transferOperator`);

  return {
    smarsPoolWrapper,
    smarsPoolStore,
    smarsPool,
  };
}
