import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export type TabType = 'games' | 'wallet' | 'quests' | 'tourney' | 'market';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  unclaimedQuestsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  unclaimedQuestsCount = 0,
}) => {
  const tabs = [
    { key: 'games', label: 'Games', iconActive: 'game-controller', iconInactive: 'game-controller-outline' },
    { key: 'wallet', label: 'Wallet', iconActive: 'wallet', iconInactive: 'wallet-outline' },
    { key: 'quests', label: 'Earn', iconActive: 'gift', iconInactive: 'gift-outline', badge: unclaimedQuestsCount },
    { key: 'tourney', label: 'Ranks', iconActive: 'trophy', iconInactive: 'trophy-outline' },
    { key: 'market', label: 'Markets', iconActive: 'stats-chart', iconInactive: 'stats-chart-outline' },
  ] as const;

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {tabs.map((tab) => {
          const isActive = currentTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => onSelectTab(tab.key)}
              activeOpacity={0.7}
            >
              <View style={styles.iconWrapper}>
                <Ionicons
                  name={isActive ? (tab.iconActive as any) : (tab.iconInactive as any)}
                  size={22}
                  color={isActive ? '#00f2fe' : '#64748b'}
                />
                {!!tab.badge && tab.badge > 0 && (
                  <View style={styles.badgePill}>
                    <Text style={styles.badgeText}>{tab.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.activeDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0a0b12',
    borderTopWidth: 1,
    borderTopColor: '#171c2e',
    paddingBottom: 4,
  },
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 4,
    position: 'relative',
  },
  tabButtonActive: {},
  iconWrapper: {
    position: 'relative',
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgePill: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: '#ff3366',
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#00f2fe',
    fontWeight: '800',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00f2fe',
    marginTop: 2,
  },
});
