import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useGame } from '../context/GameContext';
import { LEADERBOARD_DATA } from '../utils/cryptoData';
import { formatSats } from '../utils/formatters';

export const LeaderboardScreen: React.FC = () => {
  const { wallet } = useGame();

  const userRank = 14;
  const prizePoolSats = 250000;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Tournament Header Card */}
      <View style={styles.tourneyBanner}>
        <View style={styles.tourneyBadge}>
          <Ionicons name="trophy" size={16} color="#ffd700" />
          <Text style={styles.tourneyBadgeText}>SEASON 4 MOON ARENA</Text>
        </View>

        <Text style={styles.prizePoolAmount}>{formatSats(prizePoolSats)} SATS</Text>
        <Text style={styles.prizePoolUsd}>≈ $162.50 USD Weekly Distribution</Text>

        <View style={styles.countdownRow}>
          <Ionicons name="time-outline" size={14} color="#00f2fe" />
          <Text style={styles.countdownText}>Ends in: 2 days, 14 hours, 28 mins</Text>
        </View>
      </View>

      {/* Current User Rank Card */}
      <View style={styles.userRankCard}>
        <View style={styles.userRankLeft}>
          <View style={styles.rankBadgeBox}>
            <Text style={styles.rankBadgeText}>#{userRank}</Text>
          </View>
          <View>
            <Text style={styles.userRankName}>You (Pilot #{wallet.level})</Text>
            <Text style={styles.userTierSub}>Tier: Top 5% Contender</Text>
          </View>
        </View>

        <View style={styles.userRankRight}>
          <Text style={styles.userScoreText}>+{formatSats(wallet.totalEarnedLifetime)} Sats</Text>
          <Text style={styles.estPrizeText}>Est. Prize: 2,500 Sats</Text>
        </View>
      </View>

      {/* Prize Tier Breakdown */}
      <View style={styles.tiersContainer}>
        <Text style={styles.sectionHeader}>Prize Distribution Tiers</Text>
        <View style={styles.tiersRow}>
          <View style={styles.tierBox}>
            <Text style={styles.tierRank}>🥇 1st Place</Text>
            <Text style={styles.tierPrize}>75,000 Sats</Text>
          </View>
          <View style={styles.tierBox}>
            <Text style={styles.tierRank}>🥈 2nd - 3rd</Text>
            <Text style={styles.tierPrize}>35,000 Sats</Text>
          </View>
          <View style={styles.tierBox}>
            <Text style={styles.tierRank}>🥉 Top 10</Text>
            <Text style={styles.tierPrize}>10,000 Sats</Text>
          </View>
        </View>
      </View>

      {/* Top 10 Leaderboard Table */}
      <Text style={styles.sectionHeader}>Global Hall of Fame</Text>
      <View style={styles.tableCard}>
        {LEADERBOARD_DATA.map((player) => {
          const isTop3 = player.rank <= 3;
          const medalColor =
            player.rank === 1 ? '#ffd700' : player.rank === 2 ? '#cbd5e1' : '#b45309';

          return (
            <View key={player.rank} style={styles.tableRow}>
              {/* Rank Column */}
              <View style={styles.rankCol}>
                {isTop3 ? (
                  <Ionicons name="ribbon" size={20} color={medalColor} />
                ) : (
                  <Text style={styles.tableRankNum}>#{player.rank}</Text>
                )}
              </View>

              {/* Player Info */}
              <View style={styles.playerCol}>
                <Text style={styles.playerAvatar}>{player.avatar}</Text>
                <View>
                  <View style={styles.nameRow}>
                    <Text style={styles.playerName}>{player.username}</Text>
                    <Text style={styles.countryFlag}>{player.country}</Text>
                  </View>
                  <Text style={styles.playerBadge}>{player.badge}</Text>
                </View>
              </View>

              {/* Sats Earned */}
              <View style={styles.scoreCol}>
                <Text style={styles.playerScore}>
                  {formatSats(player.satsEarnedThisWeek)}
                </Text>
                <Text style={styles.satsUnit}>SATS</Text>
              </View>
            </View>
          );
        })}
      </View>
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
  tourneyBanner: {
    backgroundColor: '#11162b',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#242e56',
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  tourneyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#272005',
    borderWidth: 1,
    borderColor: '#eab308',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  tourneyBadgeText: {
    color: '#ffd700',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  prizePoolAmount: {
    fontSize: 30,
    fontWeight: '900',
    color: '#00e676',
    letterSpacing: 0.5,
  },
  prizePoolUsd: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
    marginBottom: 12,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#161c33',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  countdownText: {
    color: '#00f2fe',
    fontSize: 11,
    fontWeight: '700',
  },
  userRankCard: {
    backgroundColor: '#0c2236',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#00f2fe',
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userRankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankBadgeBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00f2fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankBadgeText: {
    color: '#0a0b12',
    fontSize: 13,
    fontWeight: '900',
  },
  userRankName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  userTierSub: {
    fontSize: 11,
    color: '#93c5fd',
    marginTop: 2,
  },
  userRankRight: {
    alignItems: 'flex-end',
  },
  userScoreText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#00e676',
  },
  estPrizeText: {
    fontSize: 10,
    color: '#ffd700',
    fontWeight: '700',
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 12,
  },
  tiersContainer: {
    marginBottom: 16,
  },
  tiersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tierBox: {
    flex: 1,
    backgroundColor: '#111526',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e2644',
    padding: 10,
    alignItems: 'center',
  },
  tierRank: {
    fontSize: 11,
    fontWeight: '700',
    color: '#cbd5e1',
    marginBottom: 4,
  },
  tierPrize: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00e676',
  },
  tableCard: {
    backgroundColor: '#111526',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e2644',
    padding: 8,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#192038',
  },
  rankCol: {
    width: 32,
    alignItems: 'center',
  },
  tableRankNum: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
  },
  playerCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 6,
  },
  playerAvatar: {
    fontSize: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  playerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  countryFlag: {
    fontSize: 12,
  },
  playerBadge: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 1,
  },
  scoreCol: {
    alignItems: 'flex-end',
  },
  playerScore: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  satsUnit: {
    fontSize: 9,
    fontWeight: '800',
    color: '#f7931a',
  },
});
