// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.8.0;

import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {SafeMath} from '@openzeppelin/contracts/math/SafeMath.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';

import {IBoardroomV2} from '../boardroom/v2/Boardroom.sol';
import {SMARSPool, IPool} from '../distribution/v2/SMARSPool.sol';
import {IPoolStore, IPoolStoreGov} from '../distribution/v2/PoolStore.sol';

interface IFeeder {
    /* ================= EVENTS ================= */

    event Feeded(address indexed operator, uint256 weightA, uint256 weightB);

    /* ================= TXNS ================= */

    function feed() external;
}

contract Feeder is IFeeder, Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IERC20 public v1SMARS;
    IERC20 public v2SMARS;
    IERC20 public v2SMARSLP;

    address public v1CMARSPool;
    address public v1SMARSPool;
    address public v2SMARSPool;
    address public v2SMARSPoolStore;

    address public v2Boardroom;

    uint256 public v2SMARSPoolId;
    uint256 public v2SMARSLPPoolId;

    uint256 public startTime;
    uint256 public expiry;

    constructor(
        address _v1SMARS,
        address _v2SMARS,
        address _v2SMARSLP,
        address _v1CMARSPool,
        address _v1SMARSPool,
        address _v2SMARSPool,
        address _v2SMARSPoolStore,
        address _v2Boardroom,
        uint256 _startTime,
        uint256 _period
    ) Ownable() {
        // tokens
        v1SMARS = IERC20(_v1SMARS);
        v2SMARS = IERC20(_v2SMARS);
        v2SMARSLP = IERC20(_v2SMARSLP);

        // pools
        v1CMARSPool = _v1CMARSPool;
        v1SMARSPool = _v1SMARSPool;
        v2SMARSPool = _v2SMARSPool;
        v2SMARSPoolStore = _v2SMARSPoolStore;

        // boardroom
        v2Boardroom = _v2Boardroom;

        // pool id
        v2SMARSPoolId = IPoolStore(_v2SMARSPoolStore).poolIdsOf(_v2SMARS)[0];
        v2SMARSLPPoolId = IPoolStore(_v2SMARSPoolStore).poolIdsOf(_v2SMARSLP)[0];

        // params
        startTime = _startTime;
        expiry = _startTime.add(_period);
    }

    function update(uint256 weight1, uint256 weight2) internal {
        IPoolStoreGov(v2SMARSPoolStore).setPool(v2SMARSPoolId, weight1);
        IPoolStoreGov(v2SMARSPoolStore).setPool(v2SMARSLPPoolId, weight2);

        IPool(v2SMARSPool).update(v2SMARSPoolId);
        IPool(v2SMARSPool).update(v2SMARSLPPoolId);

        IBoardroomV2(v2Boardroom).collectReward();
    }

    function feed() external override {
        require(block.timestamp >= startTime, 'Feeder: not started');
        require(block.timestamp < expiry, 'Feeder: finished');

        uint256 v1Supply =
            v1SMARS.totalSupply().sub(v1SMARS.balanceOf(v1CMARSPool)).sub(
                v1SMARS.balanceOf(v1SMARSPool)
            );
        uint256 v2Supply = v2SMARS.totalSupply();

        uint256 ratioA = v2Supply.mul(1e18).div(v1Supply); // LP
        uint256 ratioB = uint256(1e18).sub(ratioA); // Vanlia

        update(ratioB, ratioA);

        emit Feeded(msg.sender, ratioB, ratioA);
    }

    function finalize() external onlyOwner {
        require(block.timestamp >= expiry, 'Feeder: not finished');

        update(1e18, 0);
        Ownable(v2SMARSPoolStore).transferOwnership(_msgSender());
    }
}
