import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useGame } from '../context/GameContext';
import { formatSats, satsToUsd, formatUsd } from '../utils/formatters';

interface HeaderProps {
  onOpenWallet?: () => void;
  onOpenLoot?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenWallet, onOpenLoot }) => {
  const { wallet, soundEnabled, toggleSound, claimPassiveMining } = useGame();
  const unclaimed = Math.floor(wallet.unclaimedPassiveSats);

  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>
        <View style={styles.logoBadge}>
          <Ionicons name="flash" size={18} color="#f7931a" />
          <Text style={styles.logoText}>
            COIN<Text style={styles.logoHighlight}>ARCADE</Text>
          </Text>
          <View style={styles.liveDot} />
        </View>

        <View style={styles.actionsRight}>
          {wallet.keysCount > 0 && onOpenLoot && (
            <TouchableOpacity style={styles.keyBadge} onPress={onOpenLoot} activeOpacity={0.8}>
              <Ionicons name="key" size={14} color="#ffd700" />
              <Text style={styles.keyText}>{wallet.keysCount}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.soundButton} onPress={toggleSound} activeOpacity={0.7}>
            <Ionicons
              name={soundEnabled ? 'volume-high-outline' : 'volume-mute-outline'}
              size={18}
              color={soundEnabled ? '#00f2fe' : '#64748b'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsRow}>
        {/* Sats Balance card */}
        <TouchableOpacity
          style={styles.balanceCard}
          onPress={onOpenWallet}
          activeOpacity={0.85}
        >
          <View style={styles.satsIconBg}>
            <Ionicons name="logo-bitcoin" size={16} color="#f7931a" />
          </View>
          <View>
            <View style={styles.satsRow}>
              <Text style={styles.satsValue}>{formatSats(wallet.sats)}</Text>
              <Text style={styles.satsLabel}>SATS</Text>
            </View>
            <Text style={styles.usdSubtext}>≈ {formatUsd(satsToUsd(wallet.sats))}</Text>
          </View>
        </TouchableOpacity>

        {/* Energy and Mining Quick Claim */}
        <View style={styles.rightStats}>
          <View style={styles.energyPill}>
            <Ionicons name="battery-charging" size={14} color="#00e676" />
            <Text style={styles.energyText}>
              {wallet.energy}/{wallet.maxEnergy}
            </Text>
          </View>

          {unclaimed > 0 ? (
            <TouchableOpacity
              style={styles.claimMiningPill}
              onPress={claimPassiveMining}
              activeOpacity={0.8}
            >
              <Ionicons name="hammer" size={12} color="#0a0b10" />
              <Text style={styles.claimMiningText}>+{unclaimed} Sats</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.passiveRatePill}>
              <Ionicons name="speedometer-outline" size={12} color="#94a3b8" />
              <Text style={styles.passiveRateText}>{wallet.passiveRatePerSec}/s</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: '#0a0b12',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1f33',
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoText: {
    fontSize: 19,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1.2,
  },
  logoHighlight: {
    color: '#00f2fe',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00e676',
    marginLeft: 2,
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  keyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#272005',
    borderWidth: 1,
    borderColor: '#eab308',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    gap: 4,
  },
  keyText: {
    color: '#fef08a',
    fontSize: 12,
    fontWeight: '700',
  },
  soundButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#121626',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e243d',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#13182b',
    borderWidth: 1,
    borderColor: '#242e54',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    gap: 10,
  },
  satsIconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2d1e06',
    justifyContent: 'center',
    alignItems: 'center',
  },
  satsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  satsValue: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  satsLabel: {
    color: '#f7931a',
    fontSize: 11,
    fontWeight: '800',
  },
  usdSubtext: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '500',
  },
  rightStats: {
    alignItems: 'flex-end',
    gap: 5,
  },
  energyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0c1b1c',
    borderWidth: 1,
    borderColor: '#0e3a35',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 5,
  },
  energyText: {
    color: '#00e676',
    fontSize: 11,
    fontWeight: '700',
  },
  claimMiningPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00f2fe',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  claimMiningText: {
    color: '#0a0b10',
    fontSize: 11,
    fontWeight: '800',
  },
  passiveRatePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121626',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  passiveRateText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
});
