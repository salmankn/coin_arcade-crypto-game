import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useGame } from '../../context/GameContext';
import { sounds } from '../../utils/sound';
import { formatSats } from '../../utils/formatters';

export const NodeMinerGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const {
    wallet,
    miningRigs,
    upgradeMiningRig,
    addSats,
    addXp,
    updateQuestProgress,
    claimPassiveMining,
  } = useGame();

  const [heat, setHeat] = useState(20); // 0 to 100%
  const [isOverheated, setIsOverheated] = useState(false);
  const [needlePos, setNeedlePos] = useState(50); // 0 to 100 for overclock sweetspot
  const [needleDir, setNeedleDir] = useState(1);
  const [tapsCount, setTapsCount] = useState(0);
  const [critFlash, setCritFlash] = useState(false);

  const blockScale = useRef(new Animated.Value(1)).current;

  // Sweeping Overclock Needle loop
  useEffect(() => {
    const timer = setInterval(() => {
      setNeedlePos((prev) => {
        let next = prev + needleDir * 6;
        if (next >= 95) {
          setNeedleDir(-1);
          next = 95;
        } else if (next <= 5) {
          setNeedleDir(1);
          next = 5;
        }
        return next;
      });
    }, 40);

    return () => clearInterval(timer);
  }, [needleDir]);

  // Heat cooldown loop
  useEffect(() => {
    const timer = setInterval(() => {
      setHeat((prev) => {
        if (prev <= 15) return 15;
        const cooldown = isOverheated ? 12 : 5;
        const next = Math.max(15, prev - cooldown);
        if (next < 50 && isOverheated) {
          setIsOverheated(false);
        }
        return next;
      });
    }, 700);

    return () => clearInterval(timer);
  }, [isOverheated]);

  // Tap handler
  const handleTapGenesisBlock = () => {
    if (isOverheated) {
      sounds.playBombExplosion();
      return;
    }

    // Block punch animation
    Animated.sequence([
      Animated.timing(blockScale, { toValue: 0.94, duration: 40, useNativeDriver: true }),
      Animated.timing(blockScale, { toValue: 1, duration: 70, useNativeDriver: true }),
    ]).start();

    // Check if needle is in sweet spot (40 - 60)
    const isCrit = needlePos >= 40 && needlePos <= 60;
    const baseReward = 5;
    const earned = isCrit ? baseReward * 4 : baseReward;

    if (isCrit) {
      sounds.playCritHit();
      setCritFlash(true);
      setTimeout(() => setCritFlash(false), 200);
    } else {
      sounds.playOverclockTap();
    }

    // Heat buildup
    setHeat((prev) => {
      const added = isCrit ? 6 : 10;
      const next = prev + added;
      if (next >= 100) {
        setIsOverheated(true);
        sounds.playBombExplosion();
        return 100;
      }
      return next;
    });

    setTapsCount((prev) => prev + 1);
    addSats(earned, 'mining_claim', isCrit ? 'Overclock 4X Hash Spike!' : 'Genesis Tap Hash');
    addXp(isCrit ? 12 : 3);
    updateQuestProgress('miner', 1);
    updateQuestProgress('any', earned);
  };

  const handleCoolantFlush = () => {
    sounds.playCoin();
    setHeat(15);
    setIsOverheated(false);
  };

  const unclaimed = Math.floor(wallet.unclaimedPassiveSats);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color="#ffffff" />
          <Text style={styles.backBtnText}>Arcade Hub</Text>
        </TouchableOpacity>

        <View style={styles.hashrateBadge}>
          <Ionicons name="speedometer" size={16} color="#00f2fe" />
          <Text style={styles.hashrateText}>+{wallet.passiveRatePerSec} Sats/s</Text>
        </View>
      </View>

      {/* Main Mining Core */}
      <View style={[styles.coreCard, critFlash && styles.coreCardCrit]}>
        <Text style={styles.coreTitle}>GENESIS NODE CORE</Text>
        <Text style={styles.coreSubtitle}>
          Tap inside the green overclock zone for 4X Hash Bonus!
        </Text>

        {/* Overclock Timing Gauge */}
        <View style={styles.gaugeContainer}>
          <View style={styles.gaugeTrack}>
            <View style={styles.sweetZone} />
            <View style={[styles.needle, { left: `${needlePos}%` }]} />
          </View>
          <View style={styles.gaugeLabels}>
            <Text style={styles.gaugeLabelText}>COLD</Text>
            <Text style={styles.sweetZoneLabel}>4X OVERCLOCK ZONE</Text>
            <Text style={styles.gaugeLabelText}>HOT</Text>
          </View>
        </View>

        {/* Interactive Genesis Block */}
        <TouchableOpacity
          onPress={handleTapGenesisBlock}
          activeOpacity={0.9}
          disabled={isOverheated}
        >
          <Animated.View
            style={[
              styles.genesisBlock,
              { transform: [{ scale: blockScale }] },
              isOverheated && styles.genesisBlockOverheated,
            ]}
          >
            <View style={styles.blockInnerRing}>
              <Ionicons
                name={isOverheated ? 'warning' : 'cube'}
                size={70}
                color={isOverheated ? '#ff3366' : critFlash ? '#00e676' : '#f7931a'}
              />
              <Text style={styles.blockLabel}>
                {isOverheated ? 'THERMAL LOCK!' : 'TAP TO MINE'}
              </Text>
            </View>
          </Animated.View>
        </TouchableOpacity>

        {/* Heat Monitor */}
        <View style={styles.heatSection}>
          <View style={styles.heatHeader}>
            <View style={styles.heatTitleRow}>
              <Ionicons
                name="flame"
                size={16}
                color={heat > 75 ? '#ff3366' : heat > 50 ? '#f7931a' : '#00e676'}
              />
              <Text style={styles.heatTitle}>Rig Temperature: {Math.round(heat)}°C</Text>
            </View>

            {heat > 60 && (
              <TouchableOpacity style={styles.coolantBtn} onPress={handleCoolantFlush}>
                <Ionicons name="snow" size={14} color="#00f2fe" />
                <Text style={styles.coolantText}>Liquid Coolant Spray</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.heatBarBg}>
            <View
              style={[
                styles.heatBarFill,
                {
                  width: `${heat}%`,
                  backgroundColor: heat > 75 ? '#ff3366' : heat > 50 ? '#f7931a' : '#00e676',
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Passive Mining Income Banner */}
      <View style={styles.passiveClaimBanner}>
        <View>
          <Text style={styles.passiveBannerLabel}>Accumulated Rig Yield</Text>
          <Text style={styles.passiveBannerValue}>+{unclaimed} Sats</Text>
        </View>

        <TouchableOpacity
          style={[styles.claimNowBtn, unclaimed <= 0 && styles.claimNowBtnDisabled]}
          onPress={claimPassiveMining}
          disabled={unclaimed <= 0}
        >
          <Ionicons name="flash" size={16} color="#0a0b12" />
          <Text style={styles.claimNowBtnText}>Harvest to Wallet</Text>
        </TouchableOpacity>
      </View>

      {/* Hardware Rig Upgrades */}
      <View style={styles.sectionHeader}>
        <Ionicons name="hardware-chip" size={18} color="#00f2fe" />
        <Text style={styles.sectionTitle}>Mining Rig Hardware Upgrades</Text>
      </View>

      <View style={styles.rigsList}>
        {miningRigs.map((rig) => {
          const cost = Math.floor(rig.baseCost * Math.pow(rig.costMultiplier, rig.level));
          const canAfford = wallet.sats >= cost;
          const isMax = rig.level >= rig.maxLevel;

          return (
            <View key={rig.id} style={styles.rigCard}>
              <View style={styles.rigHeader}>
                <View style={styles.rigIconBox}>
                  <Ionicons name={rig.icon as any} size={24} color="#00f2fe" />
                </View>

                <View style={styles.rigInfo}>
                  <View style={styles.rigTitleRow}>
                    <Text style={styles.rigName}>{rig.name}</Text>
                    <View style={styles.tierPill}>
                      <Text style={styles.tierText}>{rig.tier}</Text>
                    </View>
                  </View>
                  <Text style={styles.rigDesc}>{rig.description}</Text>
                </View>
              </View>

              <View style={styles.rigStatsRow}>
                <View>
                  <Text style={styles.statLabel}>Output</Text>
                  <Text style={styles.statValue}>+{rig.satsPerSec.toFixed(2)} Sats/s</Text>
                </View>

                <View>
                  <Text style={styles.statLabel}>Level</Text>
                  <Text style={styles.statValue}>
                    {rig.level} / {rig.maxLevel}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.upgradeBtn,
                    (!canAfford || isMax) && styles.upgradeBtnDisabled,
                  ]}
                  onPress={() => upgradeMiningRig(rig.id)}
                  disabled={!canAfford || isMax}
                >
                  <Text style={styles.upgradeBtnText}>
                    {isMax ? 'MAXED' : `Upgrade (${formatSats(cost)} Sats)`}
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
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#161c32',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  backBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  hashrateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0a2333',
    borderWidth: 1,
    borderColor: '#00f2fe',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  hashrateText: {
    color: '#00f2fe',
    fontSize: 12,
    fontWeight: '800',
  },
  coreCard: {
    backgroundColor: '#101528',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#212a4d',
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  coreCardCrit: {
    borderColor: '#00e676',
    backgroundColor: '#0a221f',
  },
  coreTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  coreSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 16,
    textAlign: 'center',
  },
  gaugeContainer: {
    width: '100%',
    marginBottom: 20,
  },
  gaugeTrack: {
    width: '100%',
    height: 12,
    backgroundColor: '#161d36',
    borderRadius: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  sweetZone: {
    position: 'absolute',
    left: '40%',
    width: '20%',
    height: '100%',
    backgroundColor: '#00e676',
  },
  needle: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 6,
    marginLeft: -3,
    backgroundColor: '#ffffff',
    borderRadius: 3,
    shadowColor: '#ffffff',
    shadowOpacity: 0.9,
    shadowRadius: 4,
  },
  gaugeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  gaugeLabelText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '700',
  },
  sweetZoneLabel: {
    fontSize: 10,
    color: '#00e676',
    fontWeight: '800',
  },
  genesisBlock: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#17203d',
    borderWidth: 3,
    borderColor: '#f7931a',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
    shadowColor: '#f7931a',
    shadowOpacity: 0.35,
    shadowRadius: 15,
  },
  genesisBlockOverheated: {
    borderColor: '#ff3366',
    backgroundColor: '#2b101b',
    shadowColor: '#ff3366',
  },
  blockInnerRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#12182e',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  blockLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#e2e8f0',
    letterSpacing: 0.8,
  },
  heatSection: {
    width: '100%',
    marginTop: 10,
  },
  heatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  heatTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heatTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#cbd5e1',
  },
  coolantBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0d2b38',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00f2fe',
  },
  coolantText: {
    color: '#00f2fe',
    fontSize: 10,
    fontWeight: '700',
  },
  heatBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: '#1a223d',
    borderRadius: 3,
    overflow: 'hidden',
  },
  heatBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  passiveClaimBanner: {
    backgroundColor: '#13192f',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#242e56',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  passiveBannerLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  passiveBannerValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#00e676',
  },
  claimNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#00e676',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  claimNowBtnDisabled: {
    backgroundColor: '#26314d',
  },
  claimNowBtnText: {
    color: '#0a0b12',
    fontSize: 12,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  rigsList: {
    gap: 12,
  },
  rigCard: {
    backgroundColor: '#12172b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#20284c',
    padding: 14,
  },
  rigHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  rigIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1a2240',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rigInfo: {
    flex: 1,
  },
  rigTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rigName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  tierPill: {
    backgroundColor: '#1f2a4d',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tierText: {
    color: '#00f2fe',
    fontSize: 10,
    fontWeight: '700',
  },
  rigDesc: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  rigStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1c2340',
    paddingTop: 10,
  },
  statLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 12,
    color: '#00e676',
    fontWeight: '800',
  },
  upgradeBtn: {
    backgroundColor: '#00f2fe',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  upgradeBtnDisabled: {
    backgroundColor: '#273352',
  },
  upgradeBtnText: {
    color: '#0a0b12',
    fontSize: 11,
    fontWeight: '800',
  },
});
