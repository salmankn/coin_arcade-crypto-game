import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useGame } from '../context/GameContext';
import { formatSats } from '../utils/formatters';

interface QuestsScreenProps {
  onOpenLoot: () => void;
}

export const QuestsScreen: React.FC<QuestsScreenProps> = ({ onOpenLoot }) => {
  const { wallet, quests, claimQuestReward, claimDailyStreak } = useGame();

  const today = new Date().toISOString().slice(0, 10);
  const alreadyClaimedStreakToday = wallet.lastStreakClaimDate === today;

  const streakRewards = [
    { day: 1, sats: 50 },
    { day: 2, sats: 100 },
    { day: 3, sats: 200, key: true },
    { day: 4, sats: 350 },
    { day: 5, sats: 500 },
    { day: 6, sats: 750, key: true },
    { day: 7, sats: 1200, key: true },
  ];

  const currentStreakDayIndex = (wallet.streakDays - 1) % 7;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Player Level & XP Card */}
      <View style={styles.levelCard}>
        <View style={styles.levelHeader}>
          <View style={styles.levelBadge}>
            <Ionicons name="sparkles" size={16} color="#ffd700" />
            <Text style={styles.levelBadgeText}>LEVEL {wallet.level}</Text>
          </View>
          <Text style={styles.xpText}>
            {wallet.xp} / {wallet.xpToNextLevel} XP
          </Text>
        </View>

        {/* XP Progress bar */}
        <View style={styles.xpTrack}>
          <View
            style={[
              styles.xpFill,
              { width: `${Math.min(100, (wallet.xp / wallet.xpToNextLevel) * 100)}%` },
            ]}
          />
        </View>
        <Text style={styles.levelPerk}>
          +{(wallet.level - 1) * 5}% Bonus on all Arcade Payouts
        </Text>
      </View>

      {/* 7-Day Login Streak */}
      <View style={styles.streakCard}>
        <View style={styles.streakHeader}>
          <View>
            <View style={styles.streakTitleRow}>
              <Ionicons name="flame" size={20} color="#ff3366" />
              <Text style={styles.streakTitle}>{wallet.streakDays}-Day Login Streak</Text>
            </View>
            <Text style={styles.streakSub}>Log in daily to claim escalating Sats & Vault Keys</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.claimStreakBtn,
              alreadyClaimedStreakToday && styles.claimStreakBtnClaimed,
            ]}
            onPress={claimDailyStreak}
            disabled={alreadyClaimedStreakToday}
          >
            <Text style={styles.claimStreakText}>
              {alreadyClaimedStreakToday ? 'Claimed Today' : 'Claim Daily'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 7 Day Calendar Bubbles */}
        <View style={styles.calendarRow}>
          {streakRewards.map((item, idx) => {
            const isCompleted = idx < currentStreakDayIndex;
            const isCurrent = idx === currentStreakDayIndex;

            return (
              <View
                key={item.day}
                style={[
                  styles.dayBubble,
                  isCompleted && styles.dayBubbleCompleted,
                  isCurrent && styles.dayBubbleCurrent,
                ]}
              >
                <Text style={styles.dayLabel}>D{item.day}</Text>
                {item.key ? (
                  <Ionicons name="key" size={14} color="#ffd700" />
                ) : (
                  <Ionicons name="logo-bitcoin" size={12} color="#f7931a" />
                )}
                <Text style={styles.daySats}>+{item.sats}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Mystery Loot Box Promo */}
      <View style={styles.lootCard}>
        <View style={styles.lootLeft}>
          <Ionicons name="cube" size={40} color="#ffd700" />
          <View>
            <Text style={styles.lootTitle}>Satoshi Mystery Blocks</Text>
            <Text style={styles.lootSub}>
              Available Keys: <Text style={styles.keyHighlight}>{wallet.keysCount}</Text>
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.openVaultBtn} onPress={onOpenLoot} activeOpacity={0.8}>
          <Ionicons name="key-outline" size={14} color="#0a0b12" />
          <Text style={styles.openVaultBtnText}>Open Box</Text>
        </TouchableOpacity>
      </View>

      {/* Daily Quests List */}
      <Text style={styles.sectionHeader}>Daily Quests (Resets at 00:00 UTC)</Text>
      <View style={styles.questsList}>
        {quests.map((quest) => {
          const isDone = quest.progress >= quest.target;
          return (
            <View key={quest.id} style={styles.questCard}>
              <View style={styles.questTop}>
                <View style={styles.questIconBox}>
                  <Ionicons name={quest.icon as any} size={22} color="#00f2fe" />
                </View>

                <View style={styles.questInfo}>
                  <Text style={styles.questTitle}>{quest.title}</Text>
                  <Text style={styles.questDesc}>{quest.description}</Text>
                </View>

                <View style={styles.questRewardBox}>
                  <Text style={styles.questRewardSats}>+{quest.rewardSats} Sats</Text>
                  <Text style={styles.questRewardXp}>+{quest.rewardXp} XP</Text>
                </View>
              </View>

              {/* Progress and Claim */}
              <View style={styles.questBottom}>
                <View style={styles.questProgressCol}>
                  <View style={styles.questTrack}>
                    <View
                      style={[
                        styles.questFill,
                        { width: `${Math.min(100, (quest.progress / quest.target) * 100)}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.questProgressText}>
                    {quest.progress} / {quest.target}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.questClaimBtn,
                    (!isDone || quest.claimed) && styles.questClaimBtnDisabled,
                    quest.claimed && styles.questClaimBtnClaimed,
                  ]}
                  onPress={() => claimQuestReward(quest.id)}
                  disabled={!isDone || quest.claimed}
                >
                  <Text style={styles.questClaimText}>
                    {quest.claimed ? 'Claimed' : isDone ? 'Claim Reward' : 'In Progress'}
                  </Text>
                </TouchableOpacity>
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
  levelCard: {
    backgroundColor: '#11162b',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#222b4d',
    padding: 16,
    marginBottom: 16,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#272005',
    borderWidth: 1,
    borderColor: '#eab308',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelBadgeText: {
    color: '#ffd700',
    fontSize: 12,
    fontWeight: '800',
  },
  xpText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  xpTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#1a223d',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#00f2fe',
    borderRadius: 4,
  },
  levelPerk: {
    fontSize: 11,
    color: '#00e676',
    fontWeight: '700',
  },
  streakCard: {
    backgroundColor: '#12172c',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#222d52',
    padding: 16,
    marginBottom: 16,
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  streakTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  streakSub: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  claimStreakBtn: {
    backgroundColor: '#ff3366',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  claimStreakBtnClaimed: {
    backgroundColor: '#252e47',
  },
  claimStreakText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayBubble: {
    flex: 1,
    backgroundColor: '#161c33',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    marginHorizontal: 2,
    gap: 3,
  },
  dayBubbleCompleted: {
    backgroundColor: '#0c2e24',
    borderWidth: 1,
    borderColor: '#00e676',
  },
  dayBubbleCurrent: {
    borderWidth: 1.5,
    borderColor: '#ffd700',
    backgroundColor: '#2b2207',
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
  },
  daySats: {
    fontSize: 9,
    fontWeight: '800',
    color: '#cbd5e1',
  },
  lootCard: {
    backgroundColor: '#171610',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#b45309',
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  lootLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lootTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fef08a',
  },
  lootSub: {
    fontSize: 12,
    color: '#d4d4d8',
    marginTop: 2,
  },
  keyHighlight: {
    color: '#ffd700',
    fontWeight: '800',
  },
  openVaultBtn: {
    backgroundColor: '#ffd700',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  openVaultBtnText: {
    color: '#0a0b12',
    fontSize: 12,
    fontWeight: '900',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 12,
  },
  questsList: {
    gap: 12,
  },
  questCard: {
    backgroundColor: '#111526',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e2644',
    padding: 14,
  },
  questTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  questIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#18213e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  questInfo: {
    flex: 1,
  },
  questTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  questDesc: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  questRewardBox: {
    alignItems: 'flex-end',
  },
  questRewardSats: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00e676',
  },
  questRewardXp: {
    fontSize: 10,
    fontWeight: '600',
    color: '#00f2fe',
    marginTop: 2,
  },
  questBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  questProgressCol: {
    flex: 1,
  },
  questTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#1b223c',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  questFill: {
    height: '100%',
    backgroundColor: '#00e676',
    borderRadius: 3,
  },
  questProgressText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  questClaimBtn: {
    backgroundColor: '#00e676',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  questClaimBtnDisabled: {
    backgroundColor: '#1e2640',
  },
  questClaimBtnClaimed: {
    backgroundColor: '#162238',
  },
  questClaimText: {
    color: '#0a0b12',
    fontSize: 11,
    fontWeight: '800',
  },
});
