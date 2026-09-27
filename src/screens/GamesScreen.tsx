import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useGame } from '../context/GameContext';
import { TokenCatcherGame } from './games/TokenCatcherGame';
import { NodeMinerGame } from './games/NodeMinerGame';
import { BullBearGame } from './games/BullBearGame';
import { formatSats } from '../utils/formatters';

export const GamesScreen: React.FC<{ onOpenLoot: () => void }> = ({ onOpenLoot }) => {
  const { wallet } = useGame();
  const [activeGame, setActiveGame] = useState<'hub' | 'catcher' | 'miner' | 'scalper'>('hub');

  if (activeGame === 'catcher') {
    return <TokenCatcherGame onBack={() => setActiveGame('hub')} />;
  }
  if (activeGame === 'miner') {
    return <NodeMinerGame onBack={() => setActiveGame('hub')} />;
  }
  if (activeGame === 'scalper') {
    return <BullBearGame onBack={() => setActiveGame('hub')} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Hero Tournament Banner */}
      <View style={styles.heroBanner}>
        <View style={styles.heroGlow} />
        <View style={styles.heroContent}>
          <View style={styles.heroTagRow}>
            <View style={styles.liveTag}>
              <View style={styles.liveDot} />
              <Text style={styles.liveTagText}>WEEKLY CRYPTO ARENA</Text>
            </View>
            <Text style={styles.poolValue}>$5,000 PRIZE POOL</Text>
          </View>

          <Text style={styles.heroTitle}>Play. Earn. Cashout.</Text>
          <Text style={styles.heroSubtitle}>
            Compete in lightning-fast arcade games to accumulate real Satoshis, Ethereum & Solana.
          </Text>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatItem}>
              <Ionicons name="battery-charging" size={14} color="#00e676" />
              <Text style={styles.heroStatText}>Energy: {wallet.energy}/100</Text>
            </View>
            <View style={styles.heroStatItem}>
              <Ionicons name="speedometer-outline" size={14} color="#00f2fe" />
              <Text style={styles.heroStatText}>Passive: {wallet.passiveRatePerSec} Sats/s</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Game Selection Cards */}
      <Text style={styles.sectionHeader}>Featured Play-to-Earn Games</Text>

      {/* Game 1: Token Catcher */}
      <TouchableOpacity
        style={styles.gameCard}
        onPress={() => setActiveGame('catcher')}
        activeOpacity={0.85}
      >
        <View style={[styles.gameIconBox, { backgroundColor: '#2d1d07', borderColor: '#f7931a' }]}>
          <Ionicons name="cube" size={32} color="#f7931a" />
        </View>

        <View style={styles.gameDetails}>
          <View style={styles.gameTitleRow}>
            <Text style={styles.gameName}>Token Catcher</Text>
            <View style={styles.rewardBadge}>
              <Ionicons name="logo-bitcoin" size={12} color="#f7931a" />
              <Text style={styles.rewardBadgeText}>Up to 500 Sats</Text>
            </View>
          </View>

          <Text style={styles.gameDesc}>
            Control the hardware vault! Catch falling Bitcoin, ETH, and Bull Run rockets while dodging Bear market bombs.
          </Text>

          <View style={styles.gameFooter}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Fast Reflexes</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>10 Energy</Text>
            </View>
            <View style={styles.playNowPill}>
              <Text style={styles.playNowText}>PLAY</Text>
              <Ionicons name="arrow-forward" size={12} color="#0a0b12" />
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Game 2: Node Miner */}
      <TouchableOpacity
        style={styles.gameCard}
        onPress={() => setActiveGame('miner')}
        activeOpacity={0.85}
      >
        <View style={[styles.gameIconBox, { backgroundColor: '#09242d', borderColor: '#00f2fe' }]}>
          <Ionicons name="hammer" size={32} color="#00f2fe" />
        </View>

        <View style={styles.gameDetails}>
          <View style={styles.gameTitleRow}>
            <Text style={styles.gameName}>Node Miner: Overclock</Text>
            <View style={[styles.rewardBadge, { borderColor: '#00f2fe' }]}>
              <Ionicons name="speedometer" size={12} color="#00f2fe" />
              <Text style={[styles.rewardBadgeText, { color: '#00f2fe' }]}>Idle + Active</Text>
            </View>
          </View>

          <Text style={styles.gameDesc}>
            Tap the Genesis Block with rhythm sweet-spot timing for 4X Hash spikes. Build and upgrade ASIC rigs for passive yield!
          </Text>

          <View style={styles.gameFooter}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Rig Builder</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Free to Tap</Text>
            </View>
            <View style={styles.playNowPill}>
              <Text style={styles.playNowText}>MINE</Text>
              <Ionicons name="arrow-forward" size={12} color="#0a0b12" />
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Game 3: Bull vs Bear */}
      <TouchableOpacity
        style={styles.gameCard}
        onPress={() => setActiveGame('scalper')}
        activeOpacity={0.85}
      >
        <View style={[styles.gameIconBox, { backgroundColor: '#082b1d', borderColor: '#00e676' }]}>
          <Ionicons name="trending-up" size={32} color="#00e676" />
        </View>

        <View style={styles.gameDetails}>
          <View style={styles.gameTitleRow}>
            <Text style={styles.gameName}>Bull vs Bear Scalper</Text>
            <View style={[styles.rewardBadge, { borderColor: '#ffd700' }]}>
              <Ionicons name="flash" size={12} color="#ffd700" />
              <Text style={[styles.rewardBadgeText, { color: '#ffd700' }]}>1.95X Win</Text>
            </View>
          </View>

          <Text style={styles.gameDesc}>
            Predict whether BTC/USD ticks HIGHER or LOWER in the next 12 seconds with real-time candlestick charts!
          </Text>

          <View style={styles.gameFooter}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>High Payout</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Fast Rounds</Text>
            </View>
            <View style={styles.playNowPill}>
              <Text style={styles.playNowText}>DUEL</Text>
              <Ionicons name="arrow-forward" size={12} color="#0a0b12" />
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Satoshi Vault Lootbox Promo Card */}
      <TouchableOpacity
        style={styles.lootboxPromo}
        onPress={onOpenLoot}
        activeOpacity={0.85}
      >
        <View style={styles.lootIconCol}>
          <Ionicons name="cube" size={36} color="#ffd700" />
        </View>
        <View style={styles.lootDetails}>
          <Text style={styles.lootTitle}>Satoshi Mystery Blocks</Text>
          <Text style={styles.lootDesc}>
            You have {wallet.keysCount} Vault Key{wallet.keysCount === 1 ? '' : 's'} available to crack open.
          </Text>
        </View>
        <View style={styles.lootOpenBtn}>
          <Text style={styles.lootOpenBtnText}>OPEN</Text>
        </View>
      </TouchableOpacity>
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
  heroBanner: {
    backgroundColor: '#111628',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#222b4d',
    padding: 18,
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(0, 242, 254, 0.15)',
  },
  heroContent: {
    zIndex: 2,
  },
  heroTagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00e676',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00e676',
  },
  liveTagText: {
    color: '#00e676',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  poolValue: {
    color: '#ffd700',
    fontSize: 12,
    fontWeight: '900',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 18,
    marginBottom: 14,
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  heroStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#161c33',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  heroStatText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 12,
    letterSpacing: 0.4,
  },
  gameCard: {
    backgroundColor: '#12172b',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#20284d',
    padding: 14,
    flexDirection: 'row',
    gap: 14,
    marginBottom: 14,
    alignItems: 'center',
  },
  gameIconBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameDetails: {
    flex: 1,
  },
  gameTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  gameName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#182038',
    borderWidth: 1,
    borderColor: '#f7931a',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rewardBadgeText: {
    color: '#f7931a',
    fontSize: 10,
    fontWeight: '700',
  },
  gameDesc: {
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 16,
    marginBottom: 10,
  },
  gameFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tag: {
    backgroundColor: '#1a223d',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '600',
  },
  playNowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#00e676',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  playNowText: {
    color: '#0a0b12',
    fontSize: 11,
    fontWeight: '900',
  },
  lootboxPromo: {
    backgroundColor: '#1c1b12',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d97706',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  lootIconCol: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#2b2308',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lootDetails: {
    flex: 1,
  },
  lootTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fef08a',
  },
  lootDesc: {
    fontSize: 11,
    color: '#d4d4d8',
    marginTop: 2,
  },
  lootOpenBtn: {
    backgroundColor: '#ffd700',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  lootOpenBtnText: {
    color: '#0a0b12',
    fontSize: 11,
    fontWeight: '900',
  },
});
