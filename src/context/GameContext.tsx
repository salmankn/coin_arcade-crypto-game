import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UserWallet,
  Transaction,
  MiningRig,
  DailyQuest,
  StakingPool,
  CryptoAsset,
} from '../types';
import {
  INITIAL_MINING_RIGS,
  INITIAL_QUESTS,
  INITIAL_STAKING_POOLS,
} from '../utils/cryptoData';
import { satsToUsd, generateTxHash } from '../utils/formatters';
import { sounds } from '../utils/sound';

interface GameContextType {
  wallet: UserWallet;
  transactions: Transaction[];
  miningRigs: MiningRig[];
  quests: DailyQuest[];
  stakingPools: StakingPool[];
  soundEnabled: boolean;
  toggleSound: () => void;
  addSats: (amount: number, type: Transaction['type'], title: string, asset?: CryptoAsset) => void;
  deductSats: (amount: number) => boolean;
  addXp: (amount: number) => void;
  claimPassiveMining: () => number;
  upgradeMiningRig: (rigId: string) => boolean;
  updateQuestProgress: (gameType: 'catcher' | 'miner' | 'scalper' | 'any', count?: number) => void;
  claimQuestReward: (questId: string) => void;
  claimDailyStreak: () => { success: boolean; reward: number; streak: number };
  stakeSats: (poolId: string, amount: number) => boolean;
  unstakeSats: (poolId: string) => boolean;
  harvestStakingYield: (poolId: string) => number;
  processWithdrawal: (
    network: 'lightning' | 'solana' | 'ethereum',
    destination: string,
    amountSats: number,
    memo?: string
  ) => Promise<{ success: boolean; txHash: string; fee: number }>;
  openLootBox: () => { sats: number; xp: number; keyAwarded: boolean };
  useArcadeEnergy: (amount?: number) => boolean;
  resetAccount: () => Promise<void>;
  pendingRewardNotice: string | null;
  clearRewardNotice: () => void;
}

const STORAGE_KEYS = {
  WALLET: '@coinarcade_wallet_v2',
  TXS: '@coinarcade_txs_v2',
  RIGS: '@coinarcade_rigs_v2',
  QUESTS: '@coinarcade_quests_v2',
  STAKING: '@coinarcade_staking_v2',
  SOUND: '@coinarcade_sound_v2',
};

const DEFAULT_WALLET: UserWallet = {
  sats: 850, // Welcome bonus so user can immediately try mining/scalping
  ethGwei: 45000,
  solLamports: 1500000,
  rushTokens: 120,
  passiveRatePerSec: 0.2, // From starter rig
  unclaimedPassiveSats: 0,
  lastPassiveSync: Date.now(),
  totalEarnedLifetime: 850,
  level: 1,
  xp: 120,
  xpToNextLevel: 500,
  streakDays: 1,
  lastStreakClaimDate: null,
  keysCount: 2,
  energy: 100,
  maxEnergy: 100,
  lastEnergyRegen: Date.now(),
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<UserWallet>(DEFAULT_WALLET);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx-welcome',
      type: 'game_reward',
      asset: 'BTC',
      amount: 850,
      usdValue: satsToUsd(850),
      title: 'Genesis Pilot Welcome Bonus',
      status: 'confirmed',
      timestamp: Date.now() - 3600000,
      txHash: 'lnbc850u1genesiswelcomepack0000',
    },
  ]);
  const [miningRigs, setMiningRigs] = useState<MiningRig[]>(INITIAL_MINING_RIGS);
  const [quests, setQuests] = useState<DailyQuest[]>(INITIAL_QUESTS);
  const [stakingPools, setStakingPools] = useState<StakingPool[]>(INITIAL_STAKING_POOLS);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [pendingRewardNotice, setPendingRewardNotice] = useState<string | null>(null);

  // Load persisted state
  useEffect(() => {
    (async () => {
      try {
        const [savedWallet, savedTxs, savedRigs, savedQuests, savedStaking, savedSound] =
          await Promise.all([
            AsyncStorage.getItem(STORAGE_KEYS.WALLET),
            AsyncStorage.getItem(STORAGE_KEYS.TXS),
            AsyncStorage.getItem(STORAGE_KEYS.RIGS),
            AsyncStorage.getItem(STORAGE_KEYS.QUESTS),
            AsyncStorage.getItem(STORAGE_KEYS.STAKING),
            AsyncStorage.getItem(STORAGE_KEYS.SOUND),
          ]);

        if (savedWallet) setWallet(JSON.parse(savedWallet));
        if (savedTxs) setTransactions(JSON.parse(savedTxs));
        if (savedRigs) setMiningRigs(JSON.parse(savedRigs));
        if (savedQuests) setQuests(JSON.parse(savedQuests));
        if (savedStaking) setStakingPools(JSON.parse(savedStaking));
        if (savedSound !== null) {
          const val = JSON.parse(savedSound);
          setSoundEnabled(val);
          sounds.enabled = val;
        }
      } catch (err) {
        console.warn('Failed loading data from storage', err);
      }
    })();
  }, []);

  // Save changes to storage
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(wallet)).catch(() => {});
  }, [wallet]);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.TXS, JSON.stringify(transactions)).catch(() => {});
  }, [transactions]);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.RIGS, JSON.stringify(miningRigs)).catch(() => {});
  }, [miningRigs]);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.QUESTS, JSON.stringify(quests)).catch(() => {});
  }, [quests]);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.STAKING, JSON.stringify(stakingPools)).catch(() => {});
  }, [stakingPools]);

  // Passive Mining & Energy loop (runs every second)
  useEffect(() => {
    const timer = setInterval(() => {
      setWallet((prev) => {
        const now = Date.now();
        const deltaSec = Math.max(0, (now - prev.lastPassiveSync) / 1000);
        const gainedSats = prev.passiveRatePerSec * deltaSec;

        // Energy regen: 1 energy every 45s up to maxEnergy
        let newEnergy = prev.energy;
        let lastEnergyRegen = prev.lastEnergyRegen;
        const energyDelta = (now - prev.lastEnergyRegen) / 1000;
        if (energyDelta >= 45 && newEnergy < prev.maxEnergy) {
          const pointsToAdd = Math.floor(energyDelta / 45);
          newEnergy = Math.min(prev.maxEnergy, prev.energy + pointsToAdd);
          lastEnergyRegen = now;
        }

        return {
          ...prev,
          unclaimedPassiveSats: prev.unclaimedPassiveSats + gainedSats,
          lastPassiveSync: now,
          energy: newEnergy,
          lastEnergyRegen,
        };
      });

      // Accrue staking yield
      setStakingPools((prevPools) =>
        prevPools.map((pool) => {
          if (pool.currentStaked <= 0) return pool;
          // APY per second = APY / (365 * 86400 * 100)
          const yieldPerSec = (pool.currentStaked * (pool.apy / 100)) / (365 * 86400);
          return {
            ...pool,
            accruedYield: pool.accruedYield + yieldPerSec,
          };
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      sounds.enabled = next;
      AsyncStorage.setItem(STORAGE_KEYS.SOUND, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const addXp = useCallback((amount: number) => {
    setWallet((prev) => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      let newNextXp = prev.xpToNextLevel;

      while (newXp >= newNextXp) {
        newXp -= newNextXp;
        newLevel += 1;
        newNextXp = Math.floor(newNextXp * 1.4);
        sounds.playBigReward();
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        xpToNextLevel: newNextXp,
      };
    });
  }, []);

  const addSats = useCallback(
    (amount: number, type: Transaction['type'], title: string, asset: CryptoAsset = 'BTC') => {
      if (amount <= 0) return;
      sounds.playCoin();

      const newTx: Transaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        type,
        asset,
        amount,
        usdValue: satsToUsd(amount),
        title,
        status: 'confirmed',
        timestamp: Date.now(),
      };

      setTransactions((prev) => [newTx, ...prev.slice(0, 49)]);
      setWallet((prev) => ({
        ...prev,
        sats: prev.sats + amount,
        totalEarnedLifetime: prev.totalEarnedLifetime + amount,
      }));

      // Grant XP proportionally
      addXp(Math.max(10, Math.floor(amount / 4)));
    },
    [addXp]
  );

  const deductSats = useCallback((amount: number): boolean => {
    let success = false;
    setWallet((prev) => {
      if (prev.sats >= amount) {
        success = true;
        return {
          ...prev,
          sats: prev.sats - amount,
        };
      }
      return prev;
    });
    return success;
  }, []);

  const claimPassiveMining = useCallback((): number => {
    let claimed = 0;
    setWallet((prev) => {
      claimed = Math.floor(prev.unclaimedPassiveSats);
      if (claimed <= 0) return prev;

      sounds.playBigReward();
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        type: 'mining_claim',
        asset: 'BTC',
        amount: claimed,
        usdValue: satsToUsd(claimed),
        title: 'Idle Rig Hash Claim',
        status: 'confirmed',
        timestamp: Date.now(),
      };

      setTransactions((txs) => [newTx, ...txs.slice(0, 49)]);

      return {
        ...prev,
        sats: prev.sats + claimed,
        unclaimedPassiveSats: prev.unclaimedPassiveSats - claimed,
        totalEarnedLifetime: prev.totalEarnedLifetime + claimed,
      };
    });
    return claimed;
  }, []);

  const upgradeMiningRig = useCallback(
    (rigId: string): boolean => {
      const rig = miningRigs.find((r) => r.id === rigId);
      if (!rig) return false;

      const currentCost = Math.floor(rig.baseCost * Math.pow(rig.costMultiplier, rig.level));
      if (wallet.sats < currentCost) {
        return false;
      }

      // Deduct sats
      setWallet((prev) => ({
        ...prev,
        sats: prev.sats - currentCost,
      }));

      sounds.playOverclockTap();

      // Upgrade rig
      setMiningRigs((prevRigs) => {
        const nextRigs = prevRigs.map((r) => {
          if (r.id === rigId) {
            const nextLevel = r.level + 1;
            const extraSats = r.satsPerSec * 0.45;
            return {
              ...r,
              level: nextLevel,
              unlocked: true,
              satsPerSec: +(r.satsPerSec + extraSats).toFixed(2),
            };
          }
          return r;
        });

        // Recalculate global passive rate
        const totalPassive = nextRigs.reduce(
          (sum, r) => sum + (r.unlocked && r.level > 0 ? r.satsPerSec : 0),
          0
        );

        setWallet((w) => ({
          ...w,
          passiveRatePerSec: +totalPassive.toFixed(2),
        }));

        return nextRigs;
      });

      addXp(Math.floor(currentCost / 3));
      return true;
    },
    [miningRigs, wallet.sats, addXp]
  );

  const updateQuestProgress = useCallback(
    (gameType: 'catcher' | 'miner' | 'scalper' | 'any', count: number = 1) => {
      setQuests((prevQuests) =>
        prevQuests.map((q) => {
          if (q.claimed) return q;
          if (q.gameType === gameType || q.gameType === 'any') {
            const newProgress = Math.min(q.target, q.progress + count);
            return {
              ...q,
              progress: newProgress,
            };
          }
          return q;
        })
      );
    },
    []
  );

  const claimQuestReward = useCallback(
    (questId: string) => {
      const q = quests.find((quest) => quest.id === questId);
      if (!q || q.claimed || q.progress < q.target) return;

      sounds.playBigReward();
      setQuests((prev) =>
        prev.map((item) => (item.id === questId ? { ...item, claimed: true } : item))
      );

      addSats(q.rewardSats, 'quest_reward', `Daily Quest: ${q.title}`);
      addXp(q.rewardXp);
    },
    [quests, addSats, addXp]
  );

  const claimDailyStreak = useCallback((): { success: boolean; reward: number; streak: number } => {
    const today = new Date().toISOString().slice(0, 10);
    if (wallet.lastStreakClaimDate === today) {
      return { success: false, reward: 0, streak: wallet.streakDays };
    }

    const streakRewards = [50, 100, 200, 350, 500, 750, 1200];
    const dayIndex = (wallet.streakDays - 1) % 7;
    const rewardSats = streakRewards[dayIndex] || 250;

    sounds.playBigReward();

    setWallet((prev) => {
      const nextStreak = prev.streakDays + 1;
      return {
        ...prev,
        sats: prev.sats + rewardSats,
        streakDays: nextStreak,
        lastStreakClaimDate: today,
        totalEarnedLifetime: prev.totalEarnedLifetime + rewardSats,
        keysCount: prev.keysCount + (nextStreak % 3 === 0 ? 1 : 0),
      };
    });

    const newTx: Transaction = {
      id: `tx-streak-${Date.now()}`,
      type: 'streak_reward',
      asset: 'BTC',
      amount: rewardSats,
      usdValue: satsToUsd(rewardSats),
      title: `Day ${wallet.streakDays} Daily Login Bonus`,
      status: 'confirmed',
      timestamp: Date.now(),
    };

    setTransactions((prev) => [newTx, ...prev.slice(0, 49)]);
    addXp(100);

    return { success: true, reward: rewardSats, streak: wallet.streakDays };
  }, [wallet.lastStreakClaimDate, wallet.streakDays, addXp]);

  const stakeSats = useCallback(
    (poolId: string, amount: number): boolean => {
      if (amount <= 0 || wallet.sats < amount) return false;

      sounds.playClick();
      setWallet((prev) => ({
        ...prev,
        sats: prev.sats - amount,
      }));

      setStakingPools((prevPools) =>
        prevPools.map((pool) => {
          if (pool.id === poolId) {
            const now = Date.now();
            const unlockAt = pool.lockDays > 0 ? now + pool.lockDays * 86400 * 1000 : null;
            return {
              ...pool,
              currentStaked: pool.currentStaked + amount,
              stakedAt: pool.stakedAt || now,
              unlockAt,
            };
          }
          return pool;
        })
      );

      const newTx: Transaction = {
        id: `tx-stake-${Date.now()}`,
        type: 'mining_claim',
        asset: 'BTC',
        amount,
        usdValue: satsToUsd(amount),
        title: `Staked in ${poolId}`,
        status: 'confirmed',
        timestamp: Date.now(),
      };
      setTransactions((prev) => [newTx, ...prev.slice(0, 49)]);

      return true;
    },
    [wallet.sats]
  );

  const unstakeSats = useCallback((poolId: string): boolean => {
    let success = false;
    setStakingPools((prevPools) =>
      prevPools.map((pool) => {
        if (pool.id === poolId && pool.currentStaked > 0) {
          const now = Date.now();
          if (pool.unlockAt && now < pool.unlockAt) {
            // Still locked!
            return pool;
          }
          const totalToReturn = pool.currentStaked + Math.floor(pool.accruedYield);
          sounds.playCashoutSuccess();

          setWallet((w) => ({
            ...w,
            sats: w.sats + totalToReturn,
          }));

          const newTx: Transaction = {
            id: `tx-unstake-${Date.now()}`,
            type: 'stake_yield',
            asset: 'BTC',
            amount: totalToReturn,
            usdValue: satsToUsd(totalToReturn),
            title: `Unstaked from ${pool.name}`,
            status: 'confirmed',
            timestamp: Date.now(),
          };
          setTransactions((prev) => [newTx, ...prev.slice(0, 49)]);

          success = true;
          return {
            ...pool,
            currentStaked: 0,
            accruedYield: 0,
            stakedAt: null,
            unlockAt: null,
          };
        }
        return pool;
      })
    );
    return success;
  }, []);

  const harvestStakingYield = useCallback((poolId: string): number => {
    let harvested = 0;
    setStakingPools((prevPools) =>
      prevPools.map((pool) => {
        if (pool.id === poolId && pool.accruedYield >= 1) {
          harvested = Math.floor(pool.accruedYield);
          sounds.playCoin();

          setWallet((w) => ({
            ...w,
            sats: w.sats + harvested,
          }));

          const newTx: Transaction = {
            id: `tx-harvest-${Date.now()}`,
            type: 'stake_yield',
            asset: 'BTC',
            amount: harvested,
            usdValue: satsToUsd(harvested),
            title: `Harvested Yield from ${pool.name}`,
            status: 'confirmed',
            timestamp: Date.now(),
          };
          setTransactions((prev) => [newTx, ...prev.slice(0, 49)]);

          return {
            ...pool,
            accruedYield: pool.accruedYield - harvested,
          };
        }
        return pool;
      })
    );
    return harvested;
  }, []);

  const processWithdrawal = useCallback(
    async (
      network: 'lightning' | 'solana' | 'ethereum',
      destination: string,
      amountSats: number,
      memo?: string
    ): Promise<{ success: boolean; txHash: string; fee: number }> => {
      const fee = network === 'lightning' ? 0 : network === 'solana' ? 15 : 45;
      const totalRequired = amountSats + fee;

      if (wallet.sats < totalRequired) {
        return { success: false, txHash: '', fee };
      }

      const txHash = generateTxHash(network);

      // Deduct from wallet immediately
      setWallet((prev) => ({
        ...prev,
        sats: prev.sats - totalRequired,
      }));

      // Simulate blockchain confirmation sequence
      const newTx: Transaction = {
        id: `tx-out-${Date.now()}`,
        type: 'withdrawal',
        asset: 'BTC',
        amount: -amountSats,
        usdValue: satsToUsd(amountSats),
        title: `Withdrawal via ${network.toUpperCase()}`,
        status: 'confirmed',
        timestamp: Date.now(),
        txHash,
        network: network.toUpperCase(),
        destination,
        memo,
      };

      setTransactions((prev) => [newTx, ...prev.slice(0, 49)]);
      sounds.playCashoutSuccess();

      return { success: true, txHash, fee };
    },
    [wallet.sats]
  );

  const openLootBox = useCallback((): { sats: number; xp: number; keyAwarded: boolean } => {
    const roll = Math.random();
    let satsReward = 150 + Math.floor(Math.random() * 350); // 150 - 500 Sats
    if (roll > 0.85) satsReward = 1000 + Math.floor(Math.random() * 1500); // Jackpot!
    const xpReward = 100 + Math.floor(Math.random() * 200);
    const keyAwarded = roll < 0.25;

    sounds.playBigReward();

    setWallet((prev) => ({
      ...prev,
      sats: prev.sats + satsReward,
      keysCount: Math.max(0, prev.keysCount - 1) + (keyAwarded ? 1 : 0),
      totalEarnedLifetime: prev.totalEarnedLifetime + satsReward,
    }));

    addXp(xpReward);

    const newTx: Transaction = {
      id: `tx-loot-${Date.now()}`,
      type: 'lootbox',
      asset: 'BTC',
      amount: satsReward,
      usdValue: satsToUsd(satsReward),
      title: 'Satoshi Mystery Block Loot',
      status: 'confirmed',
      timestamp: Date.now(),
    };
    setTransactions((prev) => [newTx, ...prev.slice(0, 49)]);

    return { sats: satsReward, xp: xpReward, keyAwarded };
  }, [addXp]);

  const useArcadeEnergy = useCallback((amount: number = 10): boolean => {
    let allowed = false;
    setWallet((prev) => {
      if (prev.energy >= amount) {
        allowed = true;
        return {
          ...prev,
          energy: prev.energy - amount,
        };
      }
      return prev;
    });
    return allowed;
  }, []);

  const resetAccount = useCallback(async () => {
    await AsyncStorage.clear();
    setWallet(DEFAULT_WALLET);
    setMiningRigs(INITIAL_MINING_RIGS);
    setQuests(INITIAL_QUESTS);
    setStakingPools(INITIAL_STAKING_POOLS);
    setTransactions([]);
  }, []);

  const clearRewardNotice = useCallback(() => {
    setPendingRewardNotice(null);
  }, []);

  return (
    <GameContext.Provider
      value={{
        wallet,
        transactions,
        miningRigs,
        quests,
        stakingPools,
        soundEnabled,
        toggleSound,
        addSats,
        deductSats,
        addXp,
        claimPassiveMining,
        upgradeMiningRig,
        updateQuestProgress,
        claimQuestReward,
        claimDailyStreak,
        stakeSats,
        unstakeSats,
        harvestStakingYield,
        processWithdrawal,
        openLootBox,
        useArcadeEnergy,
        resetAccount,
        pendingRewardNotice,
        clearRewardNotice,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
