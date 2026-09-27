import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useGame } from '../context/GameContext';
import {
  formatSats,
  satsToUsd,
  formatUsd,
  formatTimeAgo,
  truncateAddress,
} from '../utils/formatters';

interface WalletScreenProps {
  onOpenWithdraw: () => void;
  onOpenTxExplorer: (txHash: string, network: string, amount: number) => void;
}

export const WalletScreen: React.FC<WalletScreenProps> = ({
  onOpenWithdraw,
  onOpenTxExplorer,
}) => {
  const {
    wallet,
    transactions,
    stakingPools,
    stakeSats,
    unstakeSats,
    harvestStakingYield,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'all' | 'earnings' | 'withdrawals'>('all');
  const [stakingModalPoolId, setStakingModalPoolId] = useState<string | null>(null);
  const [stakeAmountStr, setStakeAmountStr] = useState('500');

  const filteredTxs = transactions.filter((tx) => {
    if (activeTab === 'earnings') {
      return tx.type !== 'withdrawal';
    }
    if (activeTab === 'withdrawals') {
      return tx.type === 'withdrawal';
    }
    return true;
  });

  const selectedPool = stakingPools.find((p) => p.id === stakingModalPoolId);

  const handleConfirmStake = () => {
    if (!selectedPool) return;
    const amount = parseInt(stakeAmountStr, 10) || 0;
    if (amount <= 0 || wallet.sats < amount) {
      alert('Insufficient balance to stake.');
      return;
    }
    stakeSats(selectedPool.id, amount);
    setStakingModalPoolId(null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Portfolio Card */}
      <View style={styles.portfolioCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.portfolioLabel}>TOTAL ASSET VALUE</Text>
          <View style={styles.verifiedBadge}>
            <Ionicons name="shield-checkmark" size={12} color="#00e676" />
            <Text style={styles.verifiedText}>Lightning & Multi-Chain</Text>
          </View>
        </View>

        <Text style={styles.mainBalanceUsd}>
          {formatUsd(satsToUsd(wallet.sats) + wallet.rushTokens * 0.045)}
        </Text>

        <View style={styles.satsMainRow}>
          <Ionicons name="logo-bitcoin" size={20} color="#f7931a" />
          <Text style={styles.satsMainText}>{formatSats(wallet.sats)}</Text>
          <Text style={styles.satsMainUnit}>SATS</Text>
        </View>

        {/* Action Buttons (Withdraw & Fast Deposit/Bonus) */}
        <View style={styles.walletActionsRow}>
          <TouchableOpacity
            style={styles.actionBtnPrimary}
            onPress={onOpenWithdraw}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-up-circle" size={18} color="#0a0b12" />
            <Text style={styles.actionBtnPrimaryText}>Instant Cashout</Text>
          </TouchableOpacity>

          <View style={styles.tokenPill}>
            <Text style={styles.tokenPillLabel}>$RUSH:</Text>
            <Text style={styles.tokenPillVal}>{wallet.rushTokens}</Text>
          </View>
        </View>
      </View>

      {/* Multi-Token Asset Balances */}
      <Text style={styles.sectionHeader}>Supported Tokens</Text>
      <View style={styles.assetsGrid}>
        {/* Bitcoin */}
        <View style={styles.assetCard}>
          <View style={styles.assetHeader}>
            <View style={[styles.assetIcon, { backgroundColor: '#2d1c06' }]}>
              <Ionicons name="logo-bitcoin" size={18} color="#f7931a" />
            </View>
            <Text style={styles.assetSymbol}>BTC (Sats)</Text>
          </View>
          <Text style={styles.assetAmount}>{formatSats(wallet.sats)} Sats</Text>
          <Text style={styles.assetUsd}>{formatUsd(satsToUsd(wallet.sats))}</Text>
        </View>

        {/* Ethereum */}
        <View style={styles.assetCard}>
          <View style={styles.assetHeader}>
            <View style={[styles.assetIcon, { backgroundColor: '#191f3a' }]}>
              <Ionicons name="diamond" size={18} color="#627eea" />
            </View>
            <Text style={styles.assetSymbol}>ETH</Text>
          </View>
          <Text style={styles.assetAmount}>{(wallet.ethGwei / 1000000000).toFixed(4)} ETH</Text>
          <Text style={styles.assetUsd}>{formatUsd((wallet.ethGwei / 1000000000) * 3450)}</Text>
        </View>

        {/* Solana */}
        <View style={styles.assetCard}>
          <View style={styles.assetHeader}>
            <View style={[styles.assetIcon, { backgroundColor: '#07242a' }]}>
              <Ionicons name="flash" size={18} color="#00f2fe" />
            </View>
            <Text style={styles.assetSymbol}>SOL</Text>
          </View>
          <Text style={styles.assetAmount}>
            {(wallet.solLamports / 1000000000).toFixed(4)} SOL
          </Text>
          <Text style={styles.assetUsd}>
            {formatUsd((wallet.solLamports / 1000000000) * 152)}
          </Text>
        </View>

        {/* Rush Arcade Token */}
        <View style={styles.assetCard}>
          <View style={styles.assetHeader}>
            <View style={[styles.assetIcon, { backgroundColor: '#2b1022' }]}>
              <Ionicons name="flame" size={18} color="#ff3366" />
            </View>
            <Text style={styles.assetSymbol}>RUSH</Text>
          </View>
          <Text style={styles.assetAmount}>{wallet.rushTokens} RUSH</Text>
          <Text style={styles.assetUsd}>{formatUsd(wallet.rushTokens * 0.045)}</Text>
        </View>
      </View>

      {/* Staking & Yield Vaults */}
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionHeader}>Staking & Passive Yield Vaults</Text>
        <Ionicons name="trending-up" size={16} color="#00e676" />
      </View>

      <View style={styles.stakingList}>
        {stakingPools.map((pool) => {
          const isStaked = pool.currentStaked > 0;
          const accrued = Math.floor(pool.accruedYield);

          return (
            <View key={pool.id} style={styles.poolCard}>
              <View style={styles.poolHeader}>
                <View style={styles.poolTitleGroup}>
                  <Ionicons name={pool.icon as any} size={20} color="#00f2fe" />
                  <Text style={styles.poolName}>{pool.name}</Text>
                </View>
                <View style={styles.apyBadge}>
                  <Text style={styles.apyBadgeText}>{pool.apy}% APY</Text>
                </View>
              </View>

              <View style={styles.poolInfoRow}>
                <View>
                  <Text style={styles.poolInfoLabel}>Lock Period</Text>
                  <Text style={styles.poolInfoVal}>
                    {pool.lockDays === 0 ? 'Flexible (0d)' : `${pool.lockDays} Days`}
                  </Text>
                </View>
                <View>
                  <Text style={styles.poolInfoLabel}>Your Staked</Text>
                  <Text style={styles.poolInfoVal}>{formatSats(pool.currentStaked)} Sats</Text>
                </View>
                <View>
                  <Text style={styles.poolInfoLabel}>Yield Accrued</Text>
                  <Text style={styles.poolInfoValGreen}>+{accrued} Sats</Text>
                </View>
              </View>

              <View style={styles.poolActionRow}>
                {isStaked ? (
                  <>
                    <TouchableOpacity
                      style={styles.harvestBtn}
                      onPress={() => harvestStakingYield(pool.id)}
                      disabled={accrued < 1}
                    >
                      <Text style={styles.harvestBtnText}>Harvest (+{accrued})</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.unstakeBtn}
                      onPress={() => unstakeSats(pool.id)}
                    >
                      <Text style={styles.unstakeBtnText}>Unstake All</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={styles.stakeBtn}
                    onPress={() => setStakingModalPoolId(pool.id)}
                  >
                    <Ionicons name="lock-closed" size={14} color="#0a0b12" />
                    <Text style={styles.stakeBtnText}>Stake Sats</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Transaction History */}
      <View style={styles.txHeaderRow}>
        <Text style={styles.sectionHeader}>On-Chain & Game Ledger</Text>
        <View style={styles.filterTabsRow}>
          {(['all', 'earnings', 'withdrawals'] as const).map((tabKey) => (
            <TouchableOpacity
              key={tabKey}
              style={[styles.filterChip, activeTab === tabKey && styles.filterChipActive]}
              onPress={() => setActiveTab(tabKey)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeTab === tabKey && styles.filterChipTextActive,
                ]}
              >
                {tabKey.charAt(0).toUpperCase() + tabKey.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.txList}>
        {filteredTxs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No transactions in this category yet.</Text>
          </View>
        ) : (
          filteredTxs.map((tx) => {
            const isWithdraw = tx.type === 'withdrawal';
            return (
              <TouchableOpacity
                key={tx.id}
                style={styles.txItem}
                onPress={() => {
                  if (tx.txHash) {
                    onOpenTxExplorer(tx.txHash, tx.network || 'LIGHTNING', Math.abs(tx.amount));
                  }
                }}
                activeOpacity={tx.txHash ? 0.7 : 1}
              >
                <View
                  style={[
                    styles.txIconBox,
                    isWithdraw ? styles.txIconWithdraw : styles.txIconReward,
                  ]}
                >
                  <Ionicons
                    name={isWithdraw ? 'arrow-up-sharp' : 'arrow-down-sharp'}
                    size={16}
                    color={isWithdraw ? '#ff3366' : '#00e676'}
                  />
                </View>

                <View style={styles.txDetails}>
                  <Text style={styles.txTitle}>{tx.title}</Text>
                  <View style={styles.txSubRow}>
                    <Text style={styles.txTime}>{formatTimeAgo(tx.timestamp)}</Text>
                    {tx.txHash && (
                      <Text style={styles.txHashPreview}>
                        • {truncateAddress(tx.txHash, 6, 4)}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.txAmountCol}>
                  <Text
                    style={[
                      styles.txAmountText,
                      isWithdraw ? styles.txAmountRed : styles.txAmountGreen,
                    ]}
                  >
                    {isWithdraw ? '' : '+'}
                    {formatSats(tx.amount)} Sats
                  </Text>
                  <Text style={styles.txUsdSub}>{formatUsd(tx.usdValue)}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* Staking Deposit Modal */}
      {selectedPool && (
        <Modal
          visible={!!stakingModalPoolId}
          transparent
          animationType="fade"
          onRequestClose={() => setStakingModalPoolId(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Deposit to {selectedPool.name}</Text>
                <TouchableOpacity onPress={() => setStakingModalPoolId(null)}>
                  <Ionicons name="close" size={22} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSub}>
                Earn {selectedPool.apy}% APY paid in Sats every second.
              </Text>

              <Text style={styles.modalInputLabel}>Deposit Amount (Sats)</Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="numeric"
                value={stakeAmountStr}
                onChangeText={setStakeAmountStr}
              />

              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleConfirmStake}>
                <Text style={styles.modalConfirmText}>Confirm Deposit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  portfolioCard: {
    backgroundColor: '#11162b',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#222b4d',
    padding: 20,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  portfolioLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  verifiedText: {
    color: '#00e676',
    fontSize: 10,
    fontWeight: '700',
  },
  mainBalanceUsd: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  satsMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 16,
  },
  satsMainText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f7931a',
  },
  satsMainUnit: {
    fontSize: 12,
    fontWeight: '800',
    color: '#f7931a',
  },
  walletActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBtnPrimary: {
    flex: 1,
    backgroundColor: '#00e676',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionBtnPrimaryText: {
    color: '#0a0b12',
    fontSize: 13,
    fontWeight: '800',
  },
  tokenPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#192038',
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#29345c',
  },
  tokenPillLabel: {
    color: '#ff3366',
    fontSize: 12,
    fontWeight: '800',
  },
  tokenPillVal: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 12,
  },
  assetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  assetCard: {
    width: '48%',
    backgroundColor: '#111526',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e2644',
    padding: 12,
  },
  assetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  assetIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assetSymbol: {
    fontSize: 12,
    fontWeight: '700',
    color: '#cbd5e1',
  },
  assetAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  assetUsd: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stakingList: {
    gap: 12,
    marginBottom: 24,
  },
  poolCard: {
    backgroundColor: '#111526',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#20284c',
    padding: 14,
  },
  poolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  poolTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  poolName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  apyBadge: {
    backgroundColor: 'rgba(0, 242, 254, 0.12)',
    borderWidth: 1,
    borderColor: '#00f2fe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  apyBadgeText: {
    color: '#00f2fe',
    fontSize: 11,
    fontWeight: '800',
  },
  poolInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#161c33',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  poolInfoLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  poolInfoVal: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '700',
    marginTop: 2,
  },
  poolInfoValGreen: {
    fontSize: 11,
    color: '#00e676',
    fontWeight: '800',
    marginTop: 2,
  },
  poolActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  stakeBtn: {
    flex: 1,
    backgroundColor: '#00f2fe',
    borderRadius: 10,
    paddingVertical: 9,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  stakeBtnText: {
    color: '#0a0b12',
    fontSize: 12,
    fontWeight: '800',
  },
  harvestBtn: {
    flex: 1,
    backgroundColor: '#00e676',
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
  },
  harvestBtnText: {
    color: '#0a0b12',
    fontSize: 12,
    fontWeight: '800',
  },
  unstakeBtn: {
    backgroundColor: '#1e2642',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    alignItems: 'center',
  },
  unstakeBtnText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
  },
  txHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterTabsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#161b30',
  },
  filterChipActive: {
    backgroundColor: '#0a2438',
    borderWidth: 1,
    borderColor: '#00f2fe',
  },
  filterChipText: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#00f2fe',
    fontWeight: '800',
  },
  txList: {
    gap: 8,
  },
  emptyCard: {
    backgroundColor: '#111526',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 12,
  },
  txItem: {
    backgroundColor: '#111526',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e2644',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  txIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txIconReward: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
  },
  txIconWithdraw: {
    backgroundColor: 'rgba(255, 51, 102, 0.15)',
  },
  txDetails: {
    flex: 1,
  },
  txTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  txSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  txTime: {
    fontSize: 10,
    color: '#64748b',
  },
  txHashPreview: {
    fontSize: 10,
    color: '#00f2fe',
    fontFamily: 'monospace',
  },
  txAmountCol: {
    alignItems: 'flex-end',
  },
  txAmountText: {
    fontSize: 12,
    fontWeight: '800',
  },
  txAmountGreen: {
    color: '#00e676',
  },
  txAmountRed: {
    color: '#ff3366',
  },
  txUsdSub: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 6, 12, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#101426',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#242e54',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  modalSub: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 16,
  },
  modalInputLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  modalInput: {
    backgroundColor: '#161d36',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#29355f',
    padding: 10,
    color: '#ffffff',
    fontSize: 15,
    marginBottom: 16,
  },
  modalConfirmBtn: {
    backgroundColor: '#00f2fe',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#0a0b12',
    fontSize: 13,
    fontWeight: '800',
  },
});
