import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useGame } from '../context/GameContext';
import { formatSats } from '../utils/formatters';

interface LootBoxModalProps {
  visible: boolean;
  onClose: () => void;
}

export const LootBoxModal: React.FC<LootBoxModalProps> = ({ visible, onClose }) => {
  const { wallet, openLootBox } = useGame();
  const [opening, setOpening] = useState(false);
  const [rewardResult, setRewardResult] = useState<{
    sats: number;
    xp: number;
    keyAwarded: boolean;
  } | null>(null);

  const handleOpen = () => {
    if (wallet.keysCount <= 0) return;
    setOpening(true);

    setTimeout(() => {
      const result = openLootBox();
      setOpening(false);
      setRewardResult(result);
    }, 1200);
  };

  const handleClose = () => {
    setRewardResult(null);
    setOpening(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color="#94a3b8" />
          </TouchableOpacity>

          {!rewardResult ? (
            <View style={styles.centerContent}>
              <View style={[styles.boxIconWrapper, opening && styles.boxShaking]}>
                <Ionicons name="cube" size={72} color="#ffd700" />
              </View>

              <Text style={styles.title}>Satoshi Mystery Block</Text>
              <Text style={styles.desc}>
                Unlock cryptographic rewards! Contains between 150 to 2,500 Satoshis, rare ASIC boosters, and extra keys.
              </Text>

              <View style={styles.keysBadge}>
                <Ionicons name="key" size={16} color="#ffd700" />
                <Text style={styles.keysBadgeText}>Available Keys: {wallet.keysCount}</Text>
              </View>

              <TouchableOpacity
                style={[styles.openBtn, wallet.keysCount <= 0 && styles.openBtnDisabled]}
                onPress={handleOpen}
                disabled={wallet.keysCount <= 0 || opening}
                activeOpacity={0.8}
              >
                <Ionicons name="lock-open" size={18} color="#0a0b12" />
                <Text style={styles.openBtnText}>
                  {opening ? 'Decrypting Block...' : wallet.keysCount > 0 ? 'Open 1 Vault Key' : 'No Keys Left'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.centerContent}>
              <View style={styles.revealedIcon}>
                <Ionicons name="sparkles" size={56} color="#00e676" />
              </View>

              <Text style={styles.congratsTitle}>Block Solved!</Text>
              <Text style={styles.satsPrize}>+{formatSats(rewardResult.sats)} SATS</Text>
              <Text style={styles.xpPrize}>+{rewardResult.xp} Hash XP</Text>

              {rewardResult.keyAwarded && (
                <View style={styles.bonusChip}>
                  <Ionicons name="key" size={14} color="#ffd700" />
                  <Text style={styles.bonusChipText}>Bonus Key Rewarded!</Text>
                </View>
              )}

              <TouchableOpacity style={styles.claimBtn} onPress={handleClose} activeOpacity={0.8}>
                <Text style={styles.claimBtnText}>Claim to Wallet</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 6, 12, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#101426',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#293259',
    padding: 24,
    alignItems: 'center',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 10,
    padding: 6,
  },
  centerContent: {
    alignItems: 'center',
    width: '100%',
  },
  boxIconWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#eab308',
  },
  boxShaking: {
    transform: [{ rotate: '5deg' }, { scale: 1.08 }],
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 8,
  },
  desc: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  keysBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1a213b',
    borderWidth: 1,
    borderColor: '#344173',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  keysBadgeText: {
    color: '#ffd700',
    fontSize: 13,
    fontWeight: '700',
  },
  openBtn: {
    backgroundColor: '#ffd700',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  openBtnDisabled: {
    backgroundColor: '#334155',
  },
  openBtnText: {
    color: '#0a0b12',
    fontSize: 15,
    fontWeight: '800',
  },
  revealedIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#00e676',
  },
  congratsTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 6,
  },
  satsPrize: {
    fontSize: 28,
    fontWeight: '900',
    color: '#00e676',
    marginBottom: 4,
  },
  xpPrize: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00f2fe',
    marginBottom: 12,
  },
  bonusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2b2308',
    borderColor: '#eab308',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 20,
  },
  bonusChipText: {
    color: '#fef08a',
    fontSize: 11,
    fontWeight: '700',
  },
  claimBtn: {
    backgroundColor: '#00e676',
    borderRadius: 14,
    paddingVertical: 13,
    width: '100%',
    alignItems: 'center',
  },
  claimBtnText: {
    color: '#0a0b12',
    fontSize: 15,
    fontWeight: '800',
  },
});
