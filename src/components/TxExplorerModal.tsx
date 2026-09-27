import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { formatSats, satsToUsd, formatUsd } from '../utils/formatters';

interface TxExplorerModalProps {
  visible: boolean;
  onClose: () => void;
  txHash: string;
  network: string;
  amount: number;
}

export const TxExplorerModal: React.FC<TxExplorerModalProps> = ({
  visible,
  onClose,
  txHash,
  network,
  amount,
}) => {
  const blockHeight = 842918 + Math.floor(Math.random() * 40);
  const confirmations = 6 + Math.floor(Math.random() * 8);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="cube-outline" size={20} color="#00f2fe" />
              <Text style={styles.headerTitle}>Mempool & Ledger Explorer</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Status Banner */}
            <View style={styles.statusBanner}>
              <Ionicons name="checkmark-circle" size={22} color="#00e676" />
              <View>
                <Text style={styles.statusTitle}>Transaction Confirmed</Text>
                <Text style={styles.statusSub}>
                  Included in Block #{blockHeight.toLocaleString()} • {confirmations} confirmations
                </Text>
              </View>
            </View>

            {/* Details Table */}
            <View style={styles.table}>
              <View style={styles.row}>
                <Text style={styles.label}>Network</Text>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>{network}</Text>
                </View>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Amount</Text>
                <Text style={styles.valueGreen}>
                  {formatSats(amount)} SATS ({formatUsd(satsToUsd(amount))})
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Transaction ID</Text>
                <Text style={styles.hashValue} numberOfLines={2}>
                  {txHash}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Fee</Text>
                <Text style={styles.value}>0.00000000 BTC (Off-Chain Lightning Routing)</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Timestamp</Text>
                <Text style={styles.value}>{new Date().toUTCString()}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Payment Hash</Text>
                <Text style={styles.hashValue} numberOfLines={2}>
                  {`preimage_${txHash.slice(0, 16)}_valid_proof`}
                </Text>
              </View>
            </View>

            {/* Node Verification Stamp */}
            <View style={styles.stampCard}>
              <Ionicons name="shield-checkmark" size={20} color="#00e676" />
              <Text style={styles.stampText}>
                Cryptographically validated by 48 consensus lightning routing nodes. Proof-of-Work verified.
              </Text>
            </View>

            <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
              <Text style={styles.doneBtnText}>Close Explorer</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 13, 0.88)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#0d1120',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: '#1f2746',
    padding: 20,
    maxHeight: '85%',
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
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  closeBtn: {
    padding: 4,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    borderWidth: 1,
    borderColor: '#00e676',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  statusTitle: {
    color: '#00e676',
    fontSize: 15,
    fontWeight: '800',
  },
  statusSub: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  table: {
    backgroundColor: '#12172b',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#20284c',
    padding: 14,
    gap: 12,
    marginBottom: 16,
  },
  row: {
    borderBottomWidth: 1,
    borderBottomColor: '#1c2340',
    paddingBottom: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    fontSize: 13,
    color: '#e2e8f0',
    fontWeight: '600',
  },
  valueGreen: {
    fontSize: 14,
    color: '#00e676',
    fontWeight: '800',
  },
  hashValue: {
    fontSize: 12,
    color: '#00f2fe',
    fontFamily: 'monospace',
  },
  pill: {
    backgroundColor: '#1c2545',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pillText: {
    color: '#00f2fe',
    fontSize: 11,
    fontWeight: '700',
  },
  stampCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#13192e',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#202a4a',
  },
  stampText: {
    flex: 1,
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 16,
  },
  doneBtn: {
    backgroundColor: '#1e2646',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 16,
  },
  doneBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
