import { Contract } from 'ethers';
import { Reward_Type, Settings } from '../utils/utils';

export type Round = {
  startTime: any;
  endTime: any;
  breakDuration: any;

  isActive: boolean;
  randomNumberHash: any;
  randomNumber: any;
  multiplier: any;
};

type ContractsType = {
  read: Contract;
  write: Contract;
};
export type RoundInfo = {
  betts?: string[];
  info?: {
    startTime?: any;
    endTime?: any;
    multiplier?: any;
  };
};

export type RewardType = (typeof Reward_Type)[number];
type SettingsType = (typeof Settings)[number];

export type Leader = {
  [key in RewardType]: number;
};

export type Contracts = {
  crushGame?: ContractsType;
  crappyAchievements?: ContractsType;
  crappyCousins?: ContractsType;
  crappyBird?: ContractsType;
  crappySkins?: ContractsType;
  crappsToken?: ContractsType;
};

export type Token = {
  crappy?: any;
  crapps?: any;
};
export type LevelingData = {
  factor: any;
  maxLevel: any;
};
export type SettingData = {
  [key in SettingsType]: number;
};
export type Skin = {
  active: boolean;
  price: number;
};
export type RoundsInfo = {
  last_roundID: number;
  rounds: {
    [id: string | number]: RoundInfo;
  };
};
export type Leaderboard = {
  [id: string | number]: Leader;
};
export type UserBet = {
  amount?: string | number;
  multiplier?: string | number;
  // lvl?: string | number;
};

export type ABIS = {
  crappyBird: any[];
  crappyCousins: any[];
  crushGame: any[];
  crappsToken: any[];
};

export type GameReward = {
  index: number | -1;
  rewardType: RewardType | "";
  requirement: number | string;
  rewardAmount: number;
};
