import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useGame } from '../context/GameContext';
import { formatSats, satsToUsd, formatUsd, truncateAddress } from '../utils/formatters';

interface WithdrawModalProps {
  visible: boolean;
  onClose: () => void;
  onViewTxExplorer?: (txHash: string, network: string, amount: number) => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  visible,
  onClose,
  onViewTxExplorer,
}) => {
  const { wallet, processWithdrawal } = useGame();
  const [network, setNetwork] = useState<'lightning' | 'solana' | 'ethereum'>('lightning');
  const [address, setAddress] = useState('');
  const [amountStr, setAmountStr] = useState('250');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [completedTx, setCompletedTx] = useState<{ txHash: string; amount: number; network: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const parsedAmount = parseInt(amountStr, 10) || 0;
  const networkFee = network === 'lightning' ? 0 : network === 'solana' ? 15 : 45;
  const totalSatsRequired = parsedAmount + networkFee;

  const presets = [
    { label: 'Wallet of Satoshi (LN)', addr: 'satoshi_player@walletofsatoshi.com', net: 'lightning' },
    { label: 'Phantom Wallet (SOL)', addr: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', net: 'solana' },
    { label: 'Coinbase L2 (ETH)', addr: '0x8472B70950346cE368a4170D48d423984EAc2fF8', net: 'ethereum' },
  ] as const;

  const handleApplyPreset = (item: (typeof presets)[number]) => {
    setNetwork(item.net);
    setAddress(item.addr);
  };

  const handleSetPercent = (pct: number) => {
    const calculated = Math.max(10, Math.floor(wallet.sats * pct));
    setAmountStr(calculated.toString());
  };

  const handleConfirm = async () => {
    setErrorMsg('');
    if (!address.trim()) {
      setErrorMsg('Please enter a destination address or Lightning invoice.');
      return;
    }
    if (parsedAmount < 50) {
      setErrorMsg('Minimum cashout is 50 Sats.');
      return;
    }
    if (totalSatsRequired > wallet.sats) {
      setErrorMsg(`Insufficient balance. Need ${formatSats(totalSatsRequired)} Sats.`);
      return;
    }

    setLoading(true);
    setStep('processing');

    // Simulate cryptographic verification and mempool propagation steps
    setTimeout(async () => {
      const result = await processWithdrawal(network, address, parsedAmount);
      setLoading(false);
      if (result.success) {
        setCompletedTx({
          txHash: result.txHash,
          amount: parsedAmount,
          network: network.toUpperCase(),
        });
        setStep('success');
      } else {
        setStep('form');
        setErrorMsg('Withdrawal failed. Please check balance.');
      }
    }, 1800);
  };

  const handleResetModal = () => {
    setStep('form');
    setLoading(false);
    setErrorMsg('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleResetModal}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="arrow-up-circle" size={24} color="#00e676" />
              <Text style={styles.headerTitle}>Withdraw Crypto</Text>
            </View>
            <TouchableOpacity onPress={handleResetModal} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {step === 'form' && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
              {/* Network Selector */}
              <Text style={styles.sectionLabel}>Select Network</Text>
              <View style={styles.networkRow}>
                <TouchableOpacity
                  style={[styles.networkBtn, network === 'lightning' && styles.networkBtnActive]}
                  onPress={() => setNetwork('lightning')}
                >
                  <Ionicons name="flash" size={16} color={network === 'lightning' ? '#00f2fe' : '#94a3b8'} />
                  <Text style={[styles.networkBtnText, network === 'lightning' && styles.networkBtnTextActive]}>
                    Lightning (0 Fee)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.networkBtn, network === 'solana' && styles.networkBtnActive]}
                  onPress={() => setNetwork('solana')}
                >
                  <Ionicons name="logo-electron" size={16} color={network === 'solana' ? '#00f2fe' : '#94a3b8'} />
                  <Text style={[styles.networkBtnText, network === 'solana' && styles.networkBtnTextActive]}>
                    Solana
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.networkBtn, network === 'ethereum' && styles.networkBtnActive]}
                  onPress={() => setNetwork('ethereum')}
                >
                  <Ionicons name="diamond" size={16} color={network === 'ethereum' ? '#00f2fe' : '#94a3b8'} />
                  <Text style={[styles.networkBtnText, network === 'ethereum' && styles.networkBtnTextActive]}>
                    Arbitrum L2
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Destination Address */}
              <Text style={styles.sectionLabel}>Recipient Address / LNURL</Text>
              <TextInput
                style={styles.input}
                placeholder={network === 'lightning' ? 'lnbc... or user@walletofsatoshi.com' : '0x... or Solana Base58 Address'}
                placeholderTextColor="#475569"
                value={address}
                onChangeText={setAddress}
                autoCapitalize="none"
                autoCorrect={false}
              />

              {/* Quick Demo Presets */}
              <Text style={styles.subtext}>Quick demo destinations:</Text>
              <View style={styles.presetsRow}>
                {presets.map((p, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.presetChip}
                    onPress={() => handleApplyPreset(p)}
                  >
                    <Text style={styles.presetChipText}>{p.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Amount to cashout */}
              <View style={styles.amountHeaderRow}>
                <Text style={styles.sectionLabel}>Amount (Sats)</Text>
                <Text style={styles.balanceHelper}>
                  Available: {formatSats(wallet.sats)} Sats
                </Text>
              </View>

              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={amountStr}
                onChangeText={setAmountStr}
              />

              {/* Percent buttons */}
              <View style={styles.percentRow}>
                {[0.25, 0.5, 0.75, 1.0].map((pct) => (
                  <TouchableOpacity
                    key={pct}
                    style={styles.pctBtn}
                    onPress={() => handleSetPercent(pct)}
                  >
                    <Text style={styles.pctBtnText}>{pct === 1.0 ? 'MAX' : `${pct * 100}%`}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Breakdown */}
              <View style={styles.breakdownCard}>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>USD Value</Text>
                  <Text style={styles.breakdownValue}>{formatUsd(satsToUsd(parsedAmount))}</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Network Fee</Text>
                  <Text style={styles.breakdownValue}>
                    {networkFee === 0 ? 'FREE (Lightning)' : `${networkFee} Sats`}
                  </Text>
                </View>
                <View style={[styles.breakdownRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total Deducted</Text>
                  <Text style={styles.totalValue}>{formatSats(totalSatsRequired)} Sats</Text>
                </View>
              </View>

              {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleConfirm}
                activeOpacity={0.8}
              >
                <Ionicons name="shield-checkmark-outline" size={18} color="#0a0b12" />
                <Text style={styles.confirmBtnText}>Instant Cashout</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {step === 'processing' && (
            <View style={styles.centerFlow}>
              <ActivityIndicator size="large" color="#00f2fe" style={{ marginVertical: 20 }} />
              <Text style={styles.processingTitle}>Broadcasting Transaction...</Text>
              <Text style={styles.processingDesc}>
                Contacting routing nodes and signing lightning channel preimage.
              </Text>
              <View style={styles.pulseBar} />
            </View>
          )}

          {step === 'success' && completedTx && (
            <View style={styles.centerFlow}>
              <View style={styles.successIconBadge}>
                <Ionicons name="checkmark-sharp" size={36} color="#00e676" />
              </View>
              <Text style={styles.successTitle}>Withdrawal Confirmed!</Text>
              <Text style={styles.successAmount}>
                +{formatSats(completedTx.amount)} Sats
              </Text>
              <Text style={styles.successSubtext}>
                Transferred to your external wallet via {completedTx.network} network.
              </Text>

              <View style={styles.hashBox}>
                <Text style={styles.hashLabel}>Transaction Hash:</Text>
                <Text style={styles.hashText}>{truncateAddress(completedTx.txHash, 14, 10)}</Text>
              </View>

              {onViewTxExplorer && (
                <TouchableOpacity
                  style={styles.explorerBtn}
                  onPress={() => {
                    handleResetModal();
                    onViewTxExplorer(completedTx.txHash, completedTx.network, completedTx.amount);
                  }}
                >
                  <Ionicons name="open-outline" size={16} color="#00f2fe" />
                  <Text style={styles.explorerBtnText}>View on Blockchain Explorer</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.doneBtn} onPress={handleResetModal}>
                <Text style={styles.doneBtnText}>Back to Arcade</Text>
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
    backgroundColor: 'rgba(5, 7, 13, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0f1322',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e2644',
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  closeBtn: {
    padding: 4,
  },
  scrollBody: {
    paddingBottom: 10,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  networkRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  networkBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#161c32',
    borderWidth: 1,
    borderColor: '#242c4c',
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderRadius: 10,
    gap: 4,
  },
  networkBtnActive: {
    backgroundColor: '#0a2233',
    borderColor: '#00f2fe',
  },
  networkBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
  },
  networkBtnTextActive: {
    color: '#00f2fe',
    fontWeight: '800',
  },
  input: {
    backgroundColor: '#161b2e',
    borderWidth: 1,
    borderColor: '#242d4d',
    color: '#ffffff',
    fontSize: 14,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  subtext: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 6,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  presetChip: {
    backgroundColor: '#182038',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#2a355d',
  },
  presetChipText: {
    color: '#93c5fd',
    fontSize: 10,
    fontWeight: '600',
  },
  amountHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceHelper: {
    fontSize: 11,
    color: '#f7931a',
    fontWeight: '600',
  },
  percentRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  pctBtn: {
    flex: 1,
    backgroundColor: '#181e33',
    borderWidth: 1,
    borderColor: '#283256',
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  pctBtnText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '700',
  },
  breakdownCard: {
    backgroundColor: '#141829',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#202742',
    padding: 12,
    marginBottom: 16,
    gap: 6,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  breakdownValue: {
    fontSize: 12,
    color: '#e2e8f0',
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#222a47',
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#00e676',
  },
  errorText: {
    color: '#ff3366',
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  confirmBtn: {
    backgroundColor: '#00e676',
    borderRadius: 12,
    paddingVertical: 13,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  confirmBtnText: {
    color: '#0a0b12',
    fontSize: 15,
    fontWeight: '800',
  },
  centerFlow: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  processingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  processingDesc: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  pulseBar: {
    width: 140,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00f2fe',
  },
  successIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    borderWidth: 2,
    borderColor: '#00e676',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 4,
  },
  successAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#00e676',
    marginBottom: 6,
  },
  successSubtext: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  hashBox: {
    backgroundColor: '#141829',
    padding: 10,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#252e4d',
  },
  hashLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  hashText: {
    fontSize: 12,
    color: '#00f2fe',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  explorerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#112236',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00f2fe',
    marginBottom: 12,
    width: '100%',
    justifyContent: 'center',
  },
  explorerBtnText: {
    color: '#00f2fe',
    fontSize: 13,
    fontWeight: '700',
  },
  doneBtn: {
    backgroundColor: '#1b2238',
    paddingVertical: 12,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
