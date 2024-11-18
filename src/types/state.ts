import {
  Contracts,
  GameReward,
  Leader,
  Leaderboard,
  LevelingData,
  RoundsInfo,
  SettingData,
  Skin,
  Token,
  UserBet,
} from './types';

export interface Store {
  _state: State;
  _callSubscriber: (state: State) => void;

  getState(): State;
  subscribe(observer: (state: State) => void): void;
  setPopUp(
    type: string | boolean,
    options?: { title?: string; subtitle?: string }
  ): void;
  setDeviceType(isMobile: boolean): void;
  setLoading(obg: object): void;
  setPageTitle(title: string): void;
  setWeb3(
    data: {
      instance?: any;
      account?: string;
      signer?: any;
    } | null
  ): void;
  setSound(b: boolean): void;
  setMyBalance(obj: Token): void;
  setRoundID(id: any): void;
  setFlyProgress(num: number): void;
  setContracts(b: Contracts): void;
  setSettings(b: SettingData): void;
  setCrappsPer({
    factor,
    maxLevel,
  }: {
    factor?: LevelingData['factor'];
    maxLevel?: LevelingData['maxLevel'];
  }): void;
  setRoundBets(
    bet:
      | {
          user?: UserBet;
        }
      | boolean
  ): void;
  setBirdSkin(name: string): void;
  setMinimumBets(m: number): void;
  setOwnedSkins(arr: any[]): void;
  setCrappySkins(sk: any): void;
  setroundsInformation(info: RoundsInfo): void;
  setLeaderboard(l: any): void;
  setIsLandscape(l: boolean): void;
  setUserHistoryBets({}: { [key: string]: UserBet }, boo?: boolean): void;
  setGameRewards(arr: any): void;
  setMyRewardsData(arr: any): void;
  setMyRedeemedRewards(arr: any, boo?: boolean): void;
}

export interface State {
  basePath: string;
  opened_popup: {
    open: boolean | string;
    options?: {
      title?: string;
      subtitle?: string;
    };
  };
  isMobile: boolean;
  isSound: boolean;
  roundID: any;
  roundBets: { [key: string]: UserBet };

  web3: {
    instance: any;
    signer: any;
    account: string;
  };
  isPageLoading: {
    scenes: boolean;
    heroes: boolean;
    contracts: boolean;
  };
  documentTitle: string;
  pageTitle: string;
  myBalance: Token;
  flyProgress: number;
  contracts: Contracts;
  birdSkin: string;
  minimumBets: number;
  crappsPer: LevelingData;
  settings: SettingData;
  ownedSkins: any[];
  roundsInformation: RoundsInfo;
  crappySkinsID: {
    [key: number]: Skin;
  };
  leaderboard: false | Leaderboard;
  isLandscape: boolean;
  userHistoryBets: {
    [key: string]: UserBet;
  };
  totalGameRewards: GameReward[];
  myRewardsData: Leader;
  myRedeemedRewards: number[];
}
