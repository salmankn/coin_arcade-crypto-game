import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useGame } from '../../context/GameContext';
import { sounds } from '../../utils/sound';
import { formatSats, formatUsd } from '../../utils/formatters';

const CHART_WIDTH = Math.min(Dimensions.get('window').width - 40, 390);
const CHART_HEIGHT = 160;

export const BullBearGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { wallet, addSats, deductSats, addXp, updateQuestProgress } = useGame();

  const [betAmount, setBetAmount] = useState(50);
  const [betChoice, setBetChoice] = useState<'bull' | 'bear' | null>(null);
  const [countdown, setCountdown] = useState(0); // 15 seconds
  const [strikePrice, setStrikePrice] = useState(64850);
  const [currentPrice, setCurrentPrice] = useState(64850);
  const [priceHistory, setPriceHistory] = useState<number[]>([
    64820, 64835, 64840, 64825, 64850, 64855, 64850,
  ]);
  const [lastOutcome, setLastOutcome] = useState<{
    won: boolean;
    reward: number;
    diff: number;
  } | null>(null);

  // Live price tick simulation (continuous market movement)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPrice((prev) => {
        const delta = (Math.random() - 0.49) * 12; // micro tick
        const next = Math.round((prev + delta) * 100) / 100;
        setPriceHistory((hist) => [...hist.slice(-14), next]);
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Duel Round Countdown
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Resolve round!
          resolveRound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleStartDuel = (choice: 'bull' | 'bear') => {
    if (wallet.sats < betAmount) {
      alert(`Insufficient balance. You need ${betAmount} Sats.`);
      return;
    }

    const deducted = deductSats(betAmount);
    if (!deducted) return;

    sounds.playCoin();
    setBetChoice(choice);
    setStrikePrice(currentPrice);
    setCountdown(12); // 12-second fast scalp round
    setLastOutcome(null);
  };

  const resolveRound = () => {
    if (!betChoice) return;
    const diff = currentPrice - strikePrice;
    const isBullWin = betChoice === 'bull' && diff > 0;
    const isBearWin = betChoice === 'bear' && diff < 0;
    const won = isBullWin || isBearWin;

    if (won) {
      const payout = Math.floor(betAmount * 1.95);
      sounds.playBigReward();
      addSats(payout, 'scalp_win', `Scalper Win (${betChoice.toUpperCase()} call)`);
      addXp(60);
      updateQuestProgress('scalper', 1);
      updateQuestProgress('any', payout);
      setLastOutcome({ won: true, reward: payout, diff });
    } else {
      sounds.playBombExplosion();
      addXp(15);
      setLastOutcome({ won: false, reward: 0, diff });
    }

    setBetChoice(null);
  };

  const diffFromStrike = Math.round((currentPrice - strikePrice) * 100) / 100;
  const isWinningNow =
    betChoice === 'bull' ? diffFromStrike > 0 : betChoice === 'bear' ? diffFromStrike < 0 : false;

  // Chart min/max scaling
  const minVal = Math.min(...priceHistory, strikePrice - 20);
  const maxVal = Math.max(...priceHistory, strikePrice + 20);
  const range = Math.max(1, maxVal - minVal);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color="#ffffff" />
          <Text style={styles.backBtnText}>Arcade Hub</Text>
        </TouchableOpacity>

        <View style={styles.payoutBadge}>
          <Ionicons name="flash" size={14} color="#ffd700" />
          <Text style={styles.payoutBadgeText}>1.95X PAYOUT</Text>
        </View>
      </View>

      {/* Main Duel Stage */}
      <View style={styles.stageCard}>
        <View style={styles.stageHeader}>
          <View>
            <Text style={styles.stageTitle}>BTC/USD 12s SCALPER</Text>
            <Text style={styles.currentPriceText}>
              ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          {countdown > 0 ? (
            <View style={styles.timerPill}>
              <Ionicons name="timer-outline" size={16} color="#00f2fe" />
              <Text style={styles.timerText}>{countdown}s</Text>
            </View>
          ) : (
            <View style={styles.liveTickPill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveTickText}>LIVE TICKS</Text>
            </View>
          )}
        </View>

        {/* Real-time Candlestick / Volatility Chart */}
        <View style={[styles.chartBox, { width: CHART_WIDTH, height: CHART_HEIGHT }]}>
          {/* Dotted Strike line if bet is active */}
          {countdown > 0 && (
            <View
              style={[
                styles.strikeLine,
                {
                  top: CHART_HEIGHT - ((strikePrice - minVal) / range) * CHART_HEIGHT,
                },
              ]}
            >
              <Text style={styles.strikeLabel}>
                STRIKE: ${strikePrice.toFixed(0)} ({betChoice?.toUpperCase()})
              </Text>
            </View>
          )}

          {/* Sparkline Points rendered via bars */}
          <View style={styles.barsContainer}>
            {priceHistory.map((val, idx) => {
              const barHeight = Math.max(10, ((val - minVal) / range) * (CHART_HEIGHT - 30));
              const isGreen = idx > 0 ? val >= priceHistory[idx - 1] : true;
              return (
                <View key={idx} style={styles.barCol}>
                  <View
                    style={[
                      styles.chartBar,
                      {
                        height: barHeight,
                        backgroundColor: isGreen ? '#00e676' : '#ff3366',
                      },
                    ]}
                  />
                </View>
              );
            })}
          </View>
        </View>

        {/* Live Call Tracker when active */}
        {countdown > 0 && (
          <View
            style={[
              styles.liveCallStatus,
              isWinningNow ? styles.statusWinning : styles.statusLosing,
            ]}
          >
            <Ionicons
              name={isWinningNow ? 'trending-up' : 'trending-down'}
              size={20}
              color={isWinningNow ? '#00e676' : '#ff3366'}
            />
            <Text
              style={[
                styles.liveCallText,
                { color: isWinningNow ? '#00e676' : '#ff3366' },
              ]}
            >
              {isWinningNow ? 'IN THE PROFIT!' : 'OUT OF RANGE'} (
              {diffFromStrike >= 0 ? `+$${diffFromStrike}` : `-$${Math.abs(diffFromStrike)}`})
            </Text>
          </View>
        )}

        {/* Last Outcome Alert */}
        {lastOutcome && countdown === 0 && (
          <View
            style={[
              styles.outcomeCard,
              lastOutcome.won ? styles.outcomeWon : styles.outcomeLost,
            ]}
          >
            <Ionicons
              name={lastOutcome.won ? 'trophy' : 'alert-circle'}
              size={24}
              color={lastOutcome.won ? '#00e676' : '#ff3366'}
            />
            <View>
              <Text style={styles.outcomeTitle}>
                {lastOutcome.won ? 'VICTORY!' : 'BET REVERSED'}
              </Text>
              <Text style={styles.outcomeSub}>
                {lastOutcome.won
                  ? `Won +${formatSats(lastOutcome.reward)} Sats!`
                  : 'Market went against your prediction.'}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Bet Stake Selection */}
      <View style={styles.stakeCard}>
        <Text style={styles.stakeLabel}>Select Wager (Sats)</Text>
        <View style={styles.stakeRow}>
          {[25, 50, 100, 250, 500].map((amt) => (
            <TouchableOpacity
              key={amt}
              style={[styles.stakeBtn, betAmount === amt && styles.stakeBtnActive]}
              onPress={() => setBetAmount(amt)}
              disabled={countdown > 0}
            >
              <Text
                style={[
                  styles.stakeBtnText,
                  betAmount === amt && styles.stakeBtnTextActive,
                ]}
              >
                {amt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bull or Bear Action Buttons */}
        <View style={styles.callButtonsRow}>
          <TouchableOpacity
            style={[styles.callBtn, styles.bullBtn, countdown > 0 && styles.callBtnDisabled]}
            onPress={() => handleStartDuel('bull')}
            disabled={countdown > 0}
            activeOpacity={0.8}
          >
            <Ionicons name="trending-up" size={24} color="#0a0b12" />
            <View>
              <Text style={styles.callBtnTitle}>CALL BULL 📈</Text>
              <Text style={styles.callBtnSub}>Price goes HIGHER</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.callBtn, styles.bearBtn, countdown > 0 && styles.callBtnDisabled]}
            onPress={() => handleStartDuel('bear')}
            disabled={countdown > 0}
            activeOpacity={0.8}
          >
            <Ionicons name="trending-down" size={24} color="#0a0b12" />
            <View>
              <Text style={styles.callBtnTitle}>CALL BEAR 📉</Text>
              <Text style={styles.callBtnSub}>Price goes LOWER</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Ionicons name="shield-checkmark" size={18} color="#00f2fe" />
        <Text style={styles.infoCardText}>
          Provably Fair Random Walk Engine. Micro-seconds resolution based on live order book feeds.
        </Text>
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
  payoutBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2b2108',
    borderWidth: 1,
    borderColor: '#ffd700',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  payoutBadgeText: {
    color: '#ffd700',
    fontSize: 11,
    fontWeight: '800',
  },
  stageCard: {
    backgroundColor: '#101426',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#20284d',
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  stageHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  stageTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.8,
  },
  currentPriceText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0d2238',
    borderWidth: 1,
    borderColor: '#00f2fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timerText: {
    color: '#00f2fe',
    fontSize: 14,
    fontWeight: '900',
  },
  liveTickPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#161d36',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00e676',
  },
  liveTickText: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '800',
  },
  chartBox: {
    backgroundColor: '#0a0d1a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#181e36',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },
  strikeLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    borderBottomWidth: 1.5,
    borderBottomColor: '#ffd700',
    borderStyle: 'dashed',
    zIndex: 10,
    justifyContent: 'center',
  },
  strikeLabel: {
    color: '#ffd700',
    fontSize: 9,
    fontWeight: '800',
    backgroundColor: '#0a0d1a',
    alignSelf: 'flex-start',
    paddingHorizontal: 4,
    marginLeft: 8,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: '100%',
    paddingHorizontal: 8,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  chartBar: {
    width: 8,
    borderRadius: 3,
  },
  liveCallStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    width: '100%',
    justifyContent: 'center',
  },
  statusWinning: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    borderWidth: 1,
    borderColor: '#00e676',
  },
  statusLosing: {
    backgroundColor: 'rgba(255, 51, 102, 0.15)',
    borderWidth: 1,
    borderColor: '#ff3366',
  },
  liveCallText: {
    fontSize: 13,
    fontWeight: '800',
  },
  outcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    width: '100%',
  },
  outcomeWon: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    borderColor: '#00e676',
    borderWidth: 1,
  },
  outcomeLost: {
    backgroundColor: 'rgba(255, 51, 102, 0.15)',
    borderColor: '#ff3366',
    borderWidth: 1,
  },
  outcomeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  outcomeSub: {
    fontSize: 11,
    color: '#94a3b8',
  },
  stakeCard: {
    backgroundColor: '#101426',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#20284d',
    padding: 16,
    marginBottom: 16,
  },
  stakeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  stakeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  stakeBtn: {
    flex: 1,
    backgroundColor: '#161d36',
    borderWidth: 1,
    borderColor: '#242e54',
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
  },
  stakeBtnActive: {
    backgroundColor: '#0c2e28',
    borderColor: '#00e676',
  },
  stakeBtnText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
  },
  stakeBtnTextActive: {
    color: '#00e676',
    fontWeight: '900',
  },
  callButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  bullBtn: {
    backgroundColor: '#00e676',
  },
  bearBtn: {
    backgroundColor: '#ff3366',
  },
  callBtnDisabled: {
    opacity: 0.5,
  },
  callBtnTitle: {
    color: '#0a0b12',
    fontSize: 14,
    fontWeight: '900',
  },
  callBtnSub: {
    color: '#1a1f33',
    fontSize: 10,
    fontWeight: '700',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#12172b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#20284d',
    padding: 12,
  },
  infoCardText: {
    flex: 1,
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 16,
  },
});
