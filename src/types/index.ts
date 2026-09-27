export type CryptoAsset = 'BTC' | 'ETH' | 'SOL' | 'RUSH';

export type GameMode = 'hub' | 'token-catcher' | 'node-miner' | 'bull-bear';

export interface UserWallet {
  sats: number; // 1 BTC = 100,000,000 Sats
  ethGwei: number;
  solLamports: number;
  rushTokens: number;
  passiveRatePerSec: number;
  unclaimedPassiveSats: number;
  lastPassiveSync: number;
  totalEarnedLifetime: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streakDays: number;
  lastStreakClaimDate: string | null;
  keysCount: number; // for lootboxes
  energy: number;
  maxEnergy: number;
  lastEnergyRegen: number;
}

export interface Transaction {
  id: string;
  type: 'game_reward' | 'withdrawal' | 'mining_claim' | 'stake_yield' | 'quest_reward' | 'lootbox' | 'scalp_win' | 'scalp_loss' | 'streak_reward';
  asset: CryptoAsset;
  amount: number; // In Sats or native asset
  usdValue: number;
  title: string;
  status: 'confirmed' | 'processing' | 'pending';
  timestamp: number;
  txHash?: string;
  network?: string;
  destination?: string;
  memo?: string;
}

export interface MiningRig {
  id: string;
  name: string;
  description: string;
  icon: string;
  hashrateDisplay: string;
  satsPerSec: number;
  level: number;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  unlocked: boolean;
  tier: 'Starter' | 'Pro' | 'Enterprise' | 'Quantum';
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  rewardSats: number;
  rewardXp: number;
  claimed: boolean;
  icon: string;
  gameType: 'catcher' | 'miner' | 'scalper' | 'any';
}

export interface StakingPool {
  id: string;
  name: string;
  icon: string;
  apy: number;
  lockDays: number;
  minDepositSats: number;
  currentStaked: number;
  accruedYield: number;
  stakedAt: number | null;
  unlockAt: number | null;
}

export interface LeaderboardUser {
  rank: number;
  username: string;
  avatar: string;
  badge: string;
  satsEarnedThisWeek: number;
  isCurrentUser?: boolean;
  country: string;
}

export interface MarketCoin {
  symbol: CryptoAsset;
  name: string;
  priceUsd: number;
  change24h: number;
  high24h: number;
  low24h: number;
  history: number[];
}
