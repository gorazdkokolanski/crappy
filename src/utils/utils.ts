import { ethers } from 'ethers';
import { State, Store } from './../types/state';
import { Contracts, LevelingData, RewardType } from '../types/types';
import abi from '../assets/abi/general-abi.json';

const ALCHEMY_KEY = import.meta.env.VITE_ALCHEMY_API_KEY;
const bataBase = import.meta.env.VITE_DATABASE;

const ALCHEMY_PROVIDER_URL = `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`;
const birds_types = ['bronze', 'silver', 'gold', 'base'];

const user_bet_data_base = 'saved_users_bets';

export const REWARD_betsPlaced = 'betsPlaced';
export const REWARD_CrappsEarned = 'totalCrappsEarned';
export const REWARD_CrappsRedeemed = 'totalCrappsRedeemed'; //dont use
export const REWARD_CrappsSpent = 'totalCrappsSpent';
export const REWARD_CrappySkins = 'totalCrappySkins'; //dont use
export const REWARD_CrushWins = 'totalCrushWins'; //dont use
export const REWARD_CrushWinnings = 'totalCrushWinnings';
export const REWARD_highesthWin = 'highestCrushWin';
export const REWARD_highestMultiplier = 'highestCrushMultiplier';
export const REWARD_LevelOf = 'levelOf';

export const Settings = [
  'roundDuration',
  'minBreakDuration',
  'breakDurationFactor',
  'crappsFactor',
  'maximumBetSize',
] as const;

export const CousinsNames = [
  'Mr. Pepe',
  'Commie Mr. Pepe',
  'Bluepilled Mr. Pepe',
  'Majesty Mr. Pepe',
  'Dark Mr. Pepe',
  'Ms. Pepe',
  'Commie Ms. Pepe',
  'Bluepilled Ms. Pepe',
  'Majest Ms. Pepe',
  'Dark Ms. Pepe',
  'Pelford',
  'Commie Pelford',
  'Bluepilled Pelford',
  'Majesty Pelford',
  'Dark Ms. Pepe',
  'Landwolf',
  'Commie Landwolf',
  'Bluepilled Landwolf',
  'Majesty Landwolf',
  'Dark Landwolf',
  'Andy',
  'Commie Andy',
  'Bluepilled Andy',
  'Majesty Andy',
  'Dark Mr. Andy',
  'Ponke',
  'Commie Ponke',
  'Bluepilled Ponke',
  'Majesty Ponke',
  'Dark Ponke',
  'Bobo',
  'Commie Bobo',
  'Bluepilled Bobo',
  'Majesty Bobo',
  'Dark Bobo',
  'Mumu',
  'Commie Mumu',
  'Bluepilled Mumu',
  'Majesty Mumu',
  'Dark Mumu',
  'Brett',
  'Commie Brett',
  'Bluepilled Brett',
  'Majesty Brett',
  'Dark Brett',
];

// === do not change the order !!!!! ===
const Reward_Type = [
  REWARD_betsPlaced,
  REWARD_CrappsEarned,
  REWARD_CrappsRedeemed,
  REWARD_CrappsSpent,
  REWARD_CrappySkins,
  REWARD_CrushWins,
  REWARD_CrushWinnings,
  REWARD_highesthWin,
  REWARD_highestMultiplier,
  REWARD_LevelOf,
] as const;

function saveOrUpdateRoundData(roundData: any, db: any) {
  const transaction = db.transaction(['RoundsStore'], 'readwrite');
  const objectStore = transaction.objectStore('RoundsStore');
  const request = objectStore.put({ ...roundData, id: 'RoundsData' });

  request.onsuccess = function (event: any) {
    // console.log('Data saved successfully');
  };

  request.onerror = function (event: any) {
    // console.log('Error saving data:', event.target.errorCode);
  };
}
function getRoundData(db: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['RoundsStore']);
    const objectStore = transaction.objectStore('RoundsStore');
    const request = objectStore.get('RoundsData');

    request.onsuccess = function () {
      const ress = request.result || {};
      if (ress.v !== bataBase) {
        ress.v = bataBase;
        ress.rounds = {};
      }
      ress ? resolve(ress) : resolve(false);
    };

    request.onerror = function (event: any) {
      //  console.log('Error receiving data:', event.target.errorCode);
      reject(event.target.errorCode); // reject promis on error
    };
  });
}

const tooglePopUp = (p: HTMLDivElement) => {
  const tl = gsap.timeline();
  const anim = tl.to(p, {
    opacity: 1,
    duration: 0.2,
    ease: 'none',
  });
  return (cb?: () => void) => anim.reverse().then(() => cb?.());
};

const transformNumber = (input: any) => {
  const output = 101 + ((input - 1) * (10000 - 101)) / 99;
  return Number(output.toFixed());
};

const convertUnixTimestampToDate = (unixTimestamp: any) => {
  // Перетворюємо Unix timestamp в мілісекунди
  const date = new Date(Number(unixTimestamp) * 1000);

  // Отримуємо читабельну дату і час
  const readableDate = date.toLocaleString();

  // return date;
  return readableDate;
};

const calculateMultiplier = (number: any) => {
  const thirtyThree = BigInt(33);
  const ninetyNineHundred = BigInt(9900);
  const oneHundred = BigInt(100);
  const tenThousandOneHundred = BigInt(10100);

  if (number % thirtyThree === BigInt(0)) {
    return '0.00';
  } else {
    const remainder = number % ninetyNineHundred;
    const divisor = oneHundred - remainder / oneHundred;
    const toNumber = Number(tenThousandOneHundred / divisor) / 100;
    return Number(toNumber).toFixed(2);
  }
};

const consoleLog = (text: string, color = 'green') => {
  // console.log(`%c${text}`, `color: ${color}; font-weight: bold;`);
};

const getUserBetByRoundID = async (
  contract: any,
  roundID: number | string,
  user: string
) => {
  const ress = await contract?.bets(roundID, user);

  return {
    amount: Number(ethers.formatEther(ress.amount)),
    multiplier: (Number(ress.multiplier) / 100).toFixed(2),
  };
};

const setLastSkin = (value: string, acc: string) => {
  let name = 'selected_skin';
  const item = localStorage.getItem(name);
  const prevData = item ? JSON.parse(item) : {};
  prevData[acc] = window.btoa(value);
  // if (value == 'base') {
  //   delete prevData[acc];
  // }
  if (Object.keys(prevData).length) {
    localStorage.setItem(name, JSON.stringify(prevData));
  } else {
    localStorage.removeItem(name);
  }
};
const saveUserBetData = (value: {}, user: string) => {
  const item = localStorage.getItem(user_bet_data_base);
  const savedData = item ? JSON.parse(item) : {};
  const userData = savedData[user] || {};
  savedData[user] = { ...userData, ...value };
  savedData.v = bataBase;
  localStorage.setItem(user_bet_data_base, JSON.stringify(savedData));
};
const getUserBetData = (user: string) => {
  const item = localStorage.getItem(user_bet_data_base);
  const savedData = item ? JSON.parse(item) : {};
  let data = savedData[user] || {};

  if (savedData.v !== bataBase) {
    data = {};
    localStorage.setItem(user_bet_data_base, '{}');
  }
  return data;
};
const getLastSkin = (acc: string) => {
  const item = localStorage.getItem('selected_skin');
  const prevData = item ? JSON.parse(item) : {};

  return prevData[acc.toLowerCase()]
    ? window.atob(prevData[acc.toLowerCase()])
    : null;
};

const checkLandscape = () => {
  const w = window;
  return (
    w.innerWidth > 1024 ||
    (w.matchMedia('(orientation: landscape)').matches && w.innerWidth > 550)
  );
};

const crappsPerSecond = (state: State, next = false) => {
  const { settings, myRewardsData } = state;
  let myLVL = Number(myRewardsData.levelOf) || 1;
  const per = settings.crappsFactor * (myLVL + (next ? 1 : 0));
  return per;
};

function shortenAddress(address: string) {
  if (address && address.length > 10) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
  return address;
}

async function alchemyProviderBatch(paramsArray: any[]) {
  const method = 'eth_call';
  const jsonrpc = '2.0';

  const postBody: any = [];
  paramsArray.forEach((params, i) => {
    postBody.push({ jsonrpc, id: i, method, params });
  });

  const response = await fetch(ALCHEMY_PROVIDER_URL, {
    method: 'post',
    body: JSON.stringify(postBody),
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  // await new Promise((resolve) => setTimeout(resolve, 1000));
  return data;
}

async function* initRoundsBatch(
  type: string,
  lastID: number,
  state: State,
  id: number
) {
  const contract = state.contracts.crushGame?.read as ethers.Contract;
  const maxBatchSize = 300;
  let params = [];
  let roundId = id;
  roundId = Number(roundId);
  let toRound = roundId - (roundId - lastID);

  while (roundId >= toRound) {
    params = [];
    let nextRoundId = Math.max(roundId - maxBatchSize + 1, toRound);

    for (let i = roundId; i >= nextRoundId; i--) {
      const data = contract.interface.encodeFunctionData(type, [i]);
      const to = contract.target;
      params.push([{ to, data }, 'latest']);
    }
    const batchResult = await alchemyProviderBatch(params);
    let generalInfo: any = {};

    batchResult.forEach((res: any, index: number) => {
      if (res.result) {
        let [ress] = contract.interface.decodeFunctionResult(type, res.result);

        switch (type) {
          case 'betters':
            generalInfo[roundId - index] = { betts: [...ress] };
            break;
          case 'rounds':
            generalInfo[roundId - index] = {
              info: {
                startTime: Number(ress.startTime),
                endTime: Number(ress.endTime),
                multiplier: (Number(ress.multiplier) / 100).toFixed(2),
              },
            };
            break;
        }
      }
    });

    const ressLength = Object.keys(generalInfo).length;

    yield generalInfo;

    if (ressLength > 0) {
      roundId = nextRoundId - 1;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      roundId = roundId;
    }

    // roundId = le == 0 ? roundId : nextRoundId - 1; // Move to the next batch
  }
}

const formatLargeNumber = (num: number) => {
  const units = ['K', 'M', 'B', 'T', 'Q', 'Qi'];
  let unit = -1;
  while (num >= 1000 && ++unit < units.length) {
    num /= 1000;
  }

  if (unit === units.length) {
    return {
      number: Number(num.toFixed()).toLocaleString('en-US'),
      unit: units[unit - 1],
    };
  }

  return unit === -1
    ? {
        number: num.toLocaleString('en-US'),
        unit: '',
      }
    : {
        number: num.toFixed(2),
        unit: units[unit],
      };
};

const getAllUserRewardInfo = async (
  user: string,
  contracts: Contracts,
  forUser = false,
  state?: Store
) => {
  const params: any = [];

  const ach = contracts.crappyAchievements?.read;
  const cou = contracts.crappyCousins?.read;

  const ress: any = {};

  let leadersType = [
    { type: REWARD_betsPlaced, contract: ach },
    { type: REWARD_CrappsEarned, contract: ach },
    { type: REWARD_CrappsSpent, contract: ach },
    { type: REWARD_CrushWinnings, contract: ach },
    { type: REWARD_highesthWin, contract: ach },
    { type: REWARD_highestMultiplier, contract: ach },
    { type: REWARD_LevelOf, contract: cou },
  ];
  const userType = [
    { type: REWARD_CrushWins, contract: ach },
    { type: REWARD_CrappySkins, contract: ach },
    { type: REWARD_CrappsRedeemed, contract: ach },
  ];

  if (forUser) {
    leadersType = [...leadersType, ...userType];
  }

  leadersType.forEach((type) => {
    const contract: any = type.contract;
    const data = contract.interface.encodeFunctionData(type.type, [user]);
    const to = contract.target;
    params.push([{ to, data }, 'latest']);
  });

  const batchResult = await alchemyProviderBatch(params);

  // console.log('need update user:', user.slice(-4));
  leadersType.forEach((type, id) => {
    const contract: any = type.contract;
    const res = batchResult[id].result;
    const [data] = contract.interface.decodeFunctionResult(type.type, res);

    ress[type.type] = data.toString();
  });

  forUser && state && state.setMyRewardsData(ress);

  return ress;
};

async function initUserLeaders(user: string, state: Store) {
  const { contracts, leaderboard } = state.getState();
  if (leaderboard && leaderboard[user]) return;
  const data = await getAllUserRewardInfo(user, contracts);
  state.setLeaderboard({ [user]: data });
}

const updateUserLeaderData = (
  state: Store,
  user: string,
  type: RewardType,
  newData: any
) => {
  const u = user.toLowerCase();
  const leader = state.getState().leaderboard;
  const data = leader ? leader[u] : false;

  if (data && data?.[type]) {
    state.setLeaderboard({ [u]: { ...data, [type]: newData.toString() } });
  } else {
    initUserLeaders(u, state);
  }
};

const goToBaseScan = () => {
  const url =
    'https://basescan.org/address/0x3dd283c4731ab60cb7d3e0be55ff0318b0f1099c#readContract';

  window.open(url, '_blank');
};

export {
  checkLandscape,
  tooglePopUp,
  transformNumber,
  convertUnixTimestampToDate,
  calculateMultiplier,
  consoleLog,
  setLastSkin,
  getLastSkin,
  crappsPerSecond,
  alchemyProviderBatch,
  initRoundsBatch,
  initUserLeaders,
  shortenAddress,
  updateUserLeaderData,
  saveOrUpdateRoundData,
  getRoundData,
  formatLargeNumber,
  getUserBetByRoundID,
  getUserBetData,
  saveUserBetData,
  getAllUserRewardInfo,
  goToBaseScan,
  ALCHEMY_PROVIDER_URL,
  birds_types,
  abi,
  Reward_Type,
};
