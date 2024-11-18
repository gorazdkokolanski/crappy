import { checkLandscape } from '../utils/utils';
import { State, Store } from './../types/state';

// const savedInfo = localStorage.getItem("rounds_information");
const w = window;

const defRewards = {
  betsPlaced: 0,
  totalCrappsEarned: 0,
  totalCrappsRedeemed: 0,
  totalCrappsSpent: 0,
  totalCrappySkins: 0,
  totalCrushWins: 0,
  totalCrushWinnings: 0,
  highestCrushWin: 0,
  highestCrushMultiplier: 0,
  levelOf: 0,
};
const defBalance = {
  crappy: '0.00',
  crapps: '0',
};

const store: Store = {
  _state: {
    basePath: (() => {
      if (location.hostname.includes('tests.bambus.com.ua')) {
        return '/demo/crappy/';
      }
      return '/';
    })(),
    opened_popup: { open: false },
    isMobile: w.innerWidth < 1025,
    roundID: 0,
    isPageLoading: {
      scenes: true,
      heroes: true,
      contracts: true,
    },
    contracts: {},

    flyProgress: 0,

    documentTitle: 'Crappy',
    web3: {
      instance: false,
      account: '',
      signer: false,
    },
    pageTitle: '',
    isSound: false,
    minimumBets: 9,
    myBalance: defBalance,

    roundBets: {},
    crappsPer: {
      factor: 1,
      maxLevel: 1,
    },
    settings: {
      roundDuration: 1,
      minBreakDuration: 1,
      breakDurationFactor: 1,
      crappsFactor: 1,
      maximumBetSize: 500000,
    },
    birdSkin: 'base',
    ownedSkins: [3],
    crappySkinsID: {},
    roundsInformation: {
      last_roundID: 1,
      rounds: {},
    },
    // roundsInformation: savedInfo
    //   ? JSON.parse(savedInfo)
    //   : {
    //       last_roundID: 1,
    //       rounds: {},
    //     },
    leaderboard: false,
    isLandscape: !checkLandscape(),
    userHistoryBets: {},
    totalGameRewards: [],
    myRewardsData: defRewards,
    myRedeemedRewards: [],
  },

  _callSubscriber() {
    // Виконати необхідні дії
  },

  getState() {
    return this._state;
  },

  subscribe(observer: (state: State) => void) {
    this._callSubscriber = observer;
  },

  setPopUp(type: string, options?) {
    this._state.opened_popup = {
      options,
      open: type,
    };
    this._callSubscriber(this.getState());
  },
  setDeviceType(width: boolean) {
    this._state.isMobile = width;
    this._callSubscriber(this.getState());
  },
  setRoundID(id: number) {
    this._state.roundID = id;
    this._callSubscriber(this.getState());
  },
  setFlyProgress(progress: number) {
    this._state.flyProgress = progress;
    this._callSubscriber(this.getState());
  },
  setRoundBets(bet: any) {
    this._state.roundBets =
      Boolean(bet) == false ? {} : { ...this._state.roundBets, ...bet };
    this._callSubscriber(this.getState());
  },

  setWeb3(w: any) {
    const prev = this._state.web3;
    if (w == null) {
      this._state.web3 = { ...prev, account: '' };
      this._state.myBalance = defBalance;
      this._state.myRewardsData = defRewards;
      this._state.ownedSkins = [3];
      this._state.userHistoryBets = {};
      this._state.myRedeemedRewards = [];
      window.collected_rewards = [];
    } else {
      this._state.web3 = { ...prev, ...w };
    }

    this._callSubscriber(this.getState());
  },
  setSound(boo: boolean) {
    localStorage.setItem('crappy_sound', `${boo}`);
    this._state.isSound = boo;
    this._callSubscriber(this.getState());
  },
  setMyBalance(bal: any) {
    this._state.myBalance = { ...this._state.myBalance, ...bal };
    this._callSubscriber(this.getState());
  },

  setLoading(obg) {
    this._state.isPageLoading = { ...this._state.isPageLoading, ...obg };
    this._callSubscriber(this.getState());
  },

  setPageTitle(title: string) {
    this._state.pageTitle = title;
    this._callSubscriber(this.getState());
  },
  setContracts(cc) {
    this._state.contracts = cc;
    this._callSubscriber(this.getState());
  },
  setCrappsPer(per) {
    this._state.crappsPer = { ...this._state.crappsPer, ...per };
    this._callSubscriber(this.getState());
  },
  setBirdSkin(name) {
    this._state.birdSkin = name;
    this._callSubscriber(this.getState());
  },
  setMinimumBets(name) {
    this._state.minimumBets = name;
    this._callSubscriber(this.getState());
  },
  setOwnedSkins(arr) {
    this._state.ownedSkins = arr;
    this._callSubscriber(this.getState());
  },
  setCrappySkins(obg) {
    this._state.crappySkinsID = { ...this._state.crappySkinsID, ...obg };
    this._callSubscriber(this.getState());
  },
  setroundsInformation(info) {
    this._state.roundsInformation = {
      ...this._state.roundsInformation,
      ...info,
    };
    this._callSubscriber(this.getState());
  },
  setLeaderboard(l) {
    const lb = this._state.leaderboard || {};
    this._state.leaderboard = { ...lb, ...l };
    this._callSubscriber(this.getState());
  },
  setIsLandscape(boo) {
    this._state.isLandscape = boo;
    this._callSubscriber(this.getState());
  },
  setSettings(s) {
    this._state.settings = s;
    this._callSubscriber(this.getState());
  },
  setUserHistoryBets(l, boo = false) {
    const bets = this._state.userHistoryBets;
    this._state.userHistoryBets = boo ? {} : { ...bets, ...l };
    this._callSubscriber(this.getState());
  },
  setGameRewards(reward) {
    const rewards = this._state.totalGameRewards;
    this._state.totalGameRewards = [...rewards, ...reward];
    this._callSubscriber(this.getState());
  },
  setMyRewardsData(reward) {
    const rewards = this._state.myRewardsData;
    this._state.myRewardsData = { ...rewards, ...reward };
    this._callSubscriber(this.getState());
  },
  setMyRedeemedRewards(arr, clear = false) {
    const rewards = this._state.myRedeemedRewards;
    this._state.myRedeemedRewards = clear ? [...arr] : [...rewards, ...arr];
    this._callSubscriber(this.getState());
  },
};

export default store;
