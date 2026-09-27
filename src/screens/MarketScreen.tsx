import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MARKET_COINS } from '../utils/cryptoData';

export const MarketScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Market Sentiment Gauge */}
      <View style={styles.sentimentCard}>
        <View style={styles.sentimentHeader}>
          <Text style={styles.sentimentTitle}>CRYPTO FEAR & GREED INDEX</Text>
          <View style={styles.greedBadge}>
            <Text style={styles.greedBadgeText}>GREED</Text>
          </View>
        </View>

        <View style={styles.sentimentScoreRow}>
          <Text style={styles.sentimentScore}>74</Text>
          <Text style={styles.sentimentScoreSub}>/ 100</Text>
          <Ionicons name="trending-up" size={24} color="#00e676" style={{ marginLeft: 8 }} />
        </View>

        <View style={styles.sentimentTrack}>
          <View style={[styles.sentimentFill, { width: '74%' }]} />
        </View>

        <Text style={styles.sentimentDesc}>
          Bullish momentum dominating crypto markets. Arcade mining payouts and token rewards are running at normal 100% capacity.
        </Text>
      </View>

      {/* Live Coins List */}
      <Text style={styles.sectionHeader}>Live Crypto Prices & 24h Trends</Text>
      <View style={styles.coinsList}>
        {MARKET_COINS.map((coin) => {
          const isUp = coin.change24h >= 0;
          return (
            <View key={coin.symbol} style={styles.coinCard}>
              <View style={styles.coinTop}>
                <View style={styles.coinNameCol}>
                  <Text style={styles.coinSymbol}>{coin.symbol}</Text>
                  <Text style={styles.coinFullName}>{coin.name}</Text>
                </View>

                <View style={styles.coinPriceCol}>
                  <Text style={styles.coinPrice}>
                    ${coin.priceUsd >= 1 ? coin.priceUsd.toLocaleString() : coin.priceUsd.toFixed(3)}
                  </Text>
                  <View
                    style={[
                      styles.changePill,
                      isUp ? styles.changePillUp : styles.changePillDown,
                    ]}
                  >
                    <Ionicons
                      name={isUp ? 'caret-up' : 'caret-down'}
                      size={10}
                      color={isUp ? '#00e676' : '#ff3366'}
                    />
                    <Text style={[styles.changeText, isUp ? styles.changeUp : styles.changeDown]}>
                      {isUp ? '+' : ''}
                      {coin.change24h}%
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.statsFooter}>
                <Text style={styles.rangeText}>
                  24h Low: ${coin.low24h.toLocaleString()} • 24h High: ${coin.high24h.toLocaleString()}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Play-to-Earn Strategies & Knowledge Base */}
      <Text style={styles.sectionHeader}>Play-to-Earn Mastery Guide</Text>

      <View style={styles.tipCard}>
        <View style={styles.tipIconBox}>
          <Ionicons name="flash" size={22} color="#f7931a" />
        </View>
        <View style={styles.tipContent}>
          <Text style={styles.tipTitle}>Zero-Fee Lightning Cashouts</Text>
          <Text style={styles.tipDesc}>
            Bitcoin Lightning withdrawals settle instantly with zero fees to Wallet of Satoshi, Phoenix, CashApp, or Muun wallet!
          </Text>
        </View>
      </View>

      <View style={styles.tipCard}>
        <View style={styles.tipIconBox}>
          <Ionicons name="speedometer" size={22} color="#00f2fe" />
        </View>
        <View style={styles.tipContent}>
          <Text style={styles.tipTitle}>Master the Overclock Rhythm</Text>
          <Text style={styles.tipDesc}>
            In Node Miner, time your taps in the green central 20% zone for guaranteed 4X Hash multipliers without overheating your rigs.
          </Text>
        </View>
      </View>

      <View style={styles.tipCard}>
        <View style={styles.tipIconBox}>
          <Ionicons name="lock-closed" size={22} color="#00e676" />
        </View>
        <View style={styles.tipContent}>
          <Text style={styles.tipTitle}>Compound in Staking Vaults</Text>
          <Text style={styles.tipDesc}>
            Reinvest your arcade earnings into the 22% APY Satoshi Diamond Vault to generate continuous passive Satoshis round-the-clock.
          </Text>
        </View>
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
  sentimentCard: {
    backgroundColor: '#11162b',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#242e56',
    padding: 18,
    marginBottom: 20,
  },
  sentimentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sentimentTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.6,
  },
  greedBadge: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    borderWidth: 1,
    borderColor: '#00e676',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  greedBadgeText: {
    color: '#00e676',
    fontSize: 10,
    fontWeight: '800',
  },
  sentimentScoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  sentimentScore: {
    fontSize: 34,
    fontWeight: '900',
    color: '#00e676',
  },
  sentimentScoreSub: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '700',
    marginLeft: 4,
  },
  sentimentTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#1c2442',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  sentimentFill: {
    height: '100%',
    backgroundColor: '#00e676',
    borderRadius: 4,
  },
  sentimentDesc: {
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 16,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 12,
  },
  coinsList: {
    gap: 10,
    marginBottom: 24,
  },
  coinCard: {
    backgroundColor: '#111526',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e2644',
    padding: 14,
  },
  coinTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coinNameCol: {
    gap: 2,
  },
  coinSymbol: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
  },
  coinFullName: {
    fontSize: 11,
    color: '#94a3b8',
  },
  coinPriceCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  coinPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  changePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  changePillUp: {
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
  },
  changePillDown: {
    backgroundColor: 'rgba(255, 51, 102, 0.1)',
  },
  changeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  changeUp: {
    color: '#00e676',
  },
  changeDown: {
    color: '#ff3366',
  },
  statsFooter: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#182038',
    paddingTop: 8,
  },
  rangeText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  tipCard: {
    backgroundColor: '#111526',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e2644',
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  tipIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#18213e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 3,
  },
  tipDesc: {
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 16,
  },
});
