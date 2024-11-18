const projectId = import.meta.env.VITE_WALLET_CONNECT_ID;
const MODE = import.meta.env.MODE;

const isDemo = location.hostname.includes("tests.bambus.com.ua");
const prodURL = import.meta.env.VITE_PRODUCTION;
const demoURL = "https://tests.bambus.com.ua";

const getMode = () => {
  switch (MODE) {
    case "development":
      return "http://localhost:5173";
    default:
      return isDemo ? demoURL : prodURL;
  }
};

const mainnet = {
  chainId: 1,
  name: "Ethereum",
  currency: "ETH",
  explorerUrl: "https://etherscan.io",
  rpcUrl: "https://cloudflare-eth.com",
};
const baseMainnet = {
  chainId: 8453,
  name: "Base Mainnet",
  currency: "ETH",
  explorerUrl: "https://explorer.base.org",
  rpcUrl: "https://mainnet.base.org",
};
const metadata = {
  name: "Crappy Bird",
  description: `PIGEON THAT CAN'T FLY`,
  url: getMode(), // origin must match your domain & subdomain
  icons: ["https://game.crappybird.wtf/crappy-52.png"],
};
const defConfig = {
  /*Required*/
  metadata,
  auth: {
    email: false,
  },

  /*Optional*/
  enableEIP6963: true, // true by default
  enableInjected: true, // true by default
  enableCoinbase: true, // true by default
  rpcUrl: "...", // used for the Coinbase SDK
  defaultChainId: 1, // used for the Coinbase SDK
};
const wallets = [
  "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96", //metamask
  "e7c4d26541a7fd84dbdfa9922d3ad21e936e13a7a0e44385d44f006139e44d3b", //walletconnect
  "fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa", //coinbase
];
const createConfig: any = {
  chains: [mainnet, baseMainnet],
  projectId,
  enableAnalytics: false,
  allWallets: "HIDE",

  featuredWalletIds: wallets,
  includeWalletIds: wallets,
  excludeWalletIds: [
    "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0",
    "1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369",
  ],
};

export { projectId, defConfig, createConfig };
