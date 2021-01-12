pragma solidity ^0.6.0;

import '@openzeppelin/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import '../interfaces/IDistributor.sol';
import '../interfaces/IRewardDistributionRecipient.sol';

contract InitialShareDistributor is IDistributor {
    using SafeMath for uint256;

    event Distributed(address pool, uint256 cashAmount);

    bool public once = true;

    IERC20 public share;
    IRewardDistributionRecipient public eursbacLPPool;
    uint256 public eursbacInitialBalance;
    IRewardDistributionRecipient public eursbasLPPool;
    uint256 public eursbasInitialBalance;

    constructor(
        IERC20 _share,
        IRewardDistributionRecipient _eursbacLPPool,
        uint256 _eursbacInitialBalance,
        IRewardDistributionRecipient _eursbasLPPool,
        uint256 _eursbasInitialBalance
    ) public {
        share = _share;
        eursbacLPPool = _eursbacLPPool;
        eursbacInitialBalance = _eursbacInitialBalance;
        eursbasLPPool = _eursbasLPPool;
        eursbasInitialBalance = _eursbasInitialBalance;
    }

    function distribute() public override {
        require(
            once,
            'InitialShareDistributor: you cannot run this function twice'
        );

        share.transfer(address(eursbacLPPool), eursbacInitialBalance);
        eursbacLPPool.notifyRewardAmount(eursbacInitialBalance);
        emit Distributed(address(eursbacLPPool), eursbacInitialBalance);

        share.transfer(address(eursbasLPPool), eursbasInitialBalance);
        eursbasLPPool.notifyRewardAmount(eursbasInitialBalance);
        emit Distributed(address(eursbasLPPool), eursbasInitialBalance);

        once = false;
    }
}
