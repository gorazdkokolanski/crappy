import { ethers } from 'ethers';
import store from '../redux/state';
import { GameReward, Round, SettingData, Skin, UserBet } from '../types/types';
import { getUserBetByRoundID, Reward_Type, Settings } from './utils';
import { Contract } from 'ethers';

const state = store;
const data = store.getState();

const SKINS_ID = [0, 1, 2];

const achievementsTitles = [
  {
    title: 'Crappy Collector',
    description: 'Buy one out of the 3 Crappy skins.',
  },
  { title: 'Ornithologist', description: 'Buy all 3 Crappy skins.' },
  {
    title: 'Pigeon Poop Pioneer',
    description: 'Collect 2,000 Crapps.',
  },
  {
    title: 'Droppings Detective',
    description: 'Collect 5,000 Crapps.',
  },
  {
    title: 'Bird Poo Prodigy',
    description: 'Collect 10,000 Crapps.',
  },
  { title: 'Crapp Eater', description: 'Spend 5,000 Crapps.' },
  { title: 'Featherweight Contender', description: 'Win 50 games.' },
  { title: 'Heavyweight Champion', description: 'Win 100 games.' },
];

const getRoundID = async () => {
  const crushGame = data.contracts.crushGame;

  if (!crushGame) return;
  const id = await crushGame.read.roundId();
  window.activeRoundID = Number(id);
  state.setRoundID(Number(id));

  return id;
};

const getMinimumBets = async () => {
  const crappyCousins = data.contracts.crappyCousins;

  if (!crappyCousins) return;
  const bets = await crappyCousins?.read.minimumBets();
  bets && state.setMinimumBets(Number(bets));
};

const getLeveling = async () => {
  const crappyCousins = data.contracts.crappyCousins;

  if (!crappyCousins) return;

  const num = (n: any) => Number(n);
  try {
    const leveling = await crappyCousins?.read.leveling();
    state.setCrappsPer({
      maxLevel: num(leveling.maxLevel),
      factor: num(leveling.factor),
    });
  } catch (error) {
    // console.log("error", error)
  }
};
const getSettings = async () => {
  const contract = data.contracts.crushGame?.read;
  Settings;

  if (!contract) return;

  const num = (n: any) => Number(n);
  try {
    const settings: SettingData = await contract.settings();
    const data: any = {};

    Settings.forEach((key) => {
      switch (key) {
        case 'maximumBetSize':
          data[key] = ethers.formatEther(settings[key]);
          break;
        default:
          data[key] = Number(settings[key]);
          break;
      }
    });
    state.setSettings(data);
  } catch (error) {}
};

const getSkinsInfo = async () => {
  const skinks: any = {};
  const crappySkins = data.contracts?.crappySkins;

  await Promise.all(
    SKINS_ID.map(async (id) => {
      if (data.crappySkinsID[id]) return;
      const { active, price }: Skin = await crappySkins?.read.skins(id);
      skinks[id] = { active, price: Number(price) };
    })
  );
  state.setCrappySkins(skinks);
};

const getACurrentRoundBets = async (id: number) => {
  const crushGame = data.contracts.crushGame?.read;
  if (!crushGame) return;

  try {
    const accounts: string[] = await crushGame.betters(id);

    if (accounts.length) {
      for (const account of accounts) {
        const bet: Record<string, any> = {};
        const ress = await getUserBetByRoundID(crushGame, id, account);
        bet[account.toLowerCase()] = { ...ress };
        state.setRoundBets(bet);
      }
    }
  } catch (error) {}
};

const getGeneralSettings = async () => {
  getMinimumBets();
  getLeveling();
  getSettings();
};

// write contract
const updateMyBalance = async (b = null, t = null, a: any = null) => {
  const crappyBird = b || data.contracts?.crappyBird?.write;
  const crappsToken = t || data.contracts?.crappsToken?.write;
  const account = a || data.web3.account;

  const crappyBalance = async (boo = 0) => {
    try {
      let balance: any = await crappyBird?.balanceOf(account);
      balance = ethers.formatEther(balance);
      balance = Math.floor(balance * 100) / 100;
      state.setMyBalance({ crappy: balance.toFixed(2) });
    } catch (error) {
      //('crappyBird error', error);
      boo == 1 && setTimeout(crappyBalance, 1000);
    }
  };
  const crapsBalance = async (boo = 0) => {
    try {
      let crapps = await crappsToken?.balanceOf(account);
      crapps = crapps.toString();
      state.setMyBalance({ crapps });
    } catch (error) {
      //  console.log('crappsToken error', error);
      boo == 1 && setTimeout(crapsBalance, 1000);
    }
  };
  crappyBird && crappyBalance(1);
  crappsToken && crapsBalance(1);
};

// write contract
// const getCousinLevel = async () => {
//   const crappyCousins = data.contracts.crappyCousins;

//   if (!crappyCousins) return;
//   const lvl = await crappyCousins?.write.level();
//   // state.setCousinLevel(Number(lvl));
// };

// write contract
const getOwnedSkins = async (contarct: any, account: string) => {
  const ress = await contarct.ownedSkins(account);
  state.setOwnedSkins([3, ...Object.values(ress).map((r) => Number(r))]);
};

const getRedeemedRewards = async (account: string) => {
  const rewards = store.getState().totalGameRewards;
  const contarct = data.contracts?.crappyAchievements?.read;

  const promises = rewards.map(async ({ index }) => {
    const result: boolean = await contarct?.redeemedRewards(index, account);
    return result ? index : null;
  });
  const results = await Promise.all(promises);
  const validRewards = results.filter((index) => index !== null) as number[];
  store.setMyRedeemedRewards(validRewards, true);
};

// write contract
// const getMyTotalBet = async () => {
//   const crappyAchievements = data.contracts.crappyAchievements;
//   const account = data.web3.account;
//   const bet = await crappyAchievements?.write.betsPlaced(account);
//   // const ress = await crappyAchievements?.write.redeemReward(2);
//   // console.log('===========', ress);
//   state.setTotalBet(Number(bet));
// };

const getTotalRewards = async () => {
  const crappyAchievements = data.contracts.crappyAchievements;
  const ress: GameReward[] = await crappyAchievements?.read.rewards();
  const rewards = ress.length
    ? ress.map((r, index) => {
        const rest = achievementsTitles[index] || {};

        return {
          index,
          rewardType: Reward_Type[Number(r.rewardType)],
          requirement: Number(r.requirement),
          rewardAmount: Number(r.rewardAmount),
          ...rest,
        };
      })
    : [];

  state.setGameRewards(rewards);
};

window['updateMyBalance'] = updateMyBalance;

export {
  getRoundID,
  getMinimumBets,
  getLeveling,
  updateMyBalance,
  // getCousinLevel,
  getOwnedSkins,
  // getMyTotalBet,
  getTotalRewards,
  getSkinsInfo,
  getACurrentRoundBets,
  getGeneralSettings,
  getRedeemedRewards,
};
