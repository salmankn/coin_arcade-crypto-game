import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useGame } from '../../context/GameContext';
import { sounds } from '../../utils/sound';
import { formatSats } from '../../utils/formatters';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GAME_WIDTH = Math.min(SCREEN_WIDTH - 24, 420);
const GAME_HEIGHT = 460;
const BASKET_WIDTH = 70;

interface FallingItem {
  id: number;
  type: 'btc' | 'eth' | 'sol' | 'star' | 'bull' | 'bomb' | 'shield';
  x: number;
  y: number;
  speed: number;
  value: number;
  icon: string;
  color: string;
  size: number;
}

export const TokenCatcherGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { addSats, addXp, updateQuestProgress, useArcadeEnergy, wallet } = useGame();

  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameover'>('ready');
  const [scoreSats, setScoreSats] = useState(0);
  const [lives, setLives] = useState(3);
  const [multiplier, setMultiplier] = useState(1);
  const [combo, setCombo] = useState(0);
  const [bullFrenzyTime, setBullFrenzyTime] = useState(0);
  const [hasShield, setHasShield] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<
    { id: number; text: string; x: number; y: number; color: string }[]
  >([]);

  // Basket position
  const [basketX, setBasketX] = useState((GAME_WIDTH - BASKET_WIDTH) / 2);
  const basketXRef = useRef((GAME_WIDTH - BASKET_WIDTH) / 2);
  basketXRef.current = basketX;

  const itemsRef = useRef<FallingItem[]>([]);
  const [renderItems, setRenderItems] = useState<FallingItem[]>([]);

  const animFrameRef = useRef<number | null>(null);
  const lastSpawnRef = useRef(0);
  const isPlayingRef = useRef(false);
  const frenzyRef = useRef(0);
  frenzyRef.current = bullFrenzyTime;

  // Touch controls for the basket
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (!isPlayingRef.current) return;
        const newX = Math.max(
          0,
          Math.min(GAME_WIDTH - BASKET_WIDTH, basketXRef.current + gestureState.dx * 0.15)
        );
        setBasketX(newX);
      },
    })
  ).current;

  // Direct tap on left/right half for fast mobile movement
  const handleMoveLeft = () => {
    setBasketX((prev) => Math.max(0, prev - 45));
  };

  const handleMoveRight = () => {
    setBasketX((prev) => Math.min(GAME_WIDTH - BASKET_WIDTH, prev + 45));
  };

  const spawnItem = (time: number) => {
    const roll = Math.random();
    let type: FallingItem['type'] = 'btc';
    let value = 50;
    let icon = 'logo-bitcoin';
    let color = '#f7931a';
    let speed = 3.2 + Math.random() * 1.8;
    const size = 32;

    if (roll < 0.35) {
      type = 'btc';
      value = 50;
      icon = 'logo-bitcoin';
      color = '#f7931a';
    } else if (roll < 0.6) {
      type = 'eth';
      value = 25;
      icon = 'diamond';
      color = '#627eea';
      speed = 3.5 + Math.random() * 1.5;
    } else if (roll < 0.78) {
      type = 'sol';
      value = 15;
      icon = 'flash';
      color = '#00f2fe';
      speed = 4.0 + Math.random() * 1.5;
    } else if (roll < 0.86) {
      type = 'bomb';
      value = 0;
      icon = 'skull';
      color = '#ff3366';
      speed = 3.0 + Math.random() * 1.2;
    } else if (roll < 0.93) {
      type = 'bull';
      value = 100;
      icon = 'rocket';
      color = '#00e676';
      speed = 4.2;
    } else if (roll < 0.97) {
      type = 'star';
      value = 120;
      icon = 'star';
      color = '#ffd700';
      speed = 3.8;
    } else {
      type = 'shield';
      value = 0;
      icon = 'shield-checkmark';
      color = '#38bdf8';
      speed = 3.4;
    }

    const newItem: FallingItem = {
      id: time + Math.random(),
      type,
      x: Math.random() * (GAME_WIDTH - size - 10) + 5,
      y: -size,
      speed,
      value,
      icon,
      color,
      size,
    };

    itemsRef.current.push(newItem);
  };

  const addFloatText = (text: string, x: number, y: number, color: string) => {
    const id = Date.now() + Math.random();
    setFloatingTexts((prev) => [...prev.slice(-4), { id, text, x, y, color }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((t) => t.id !== id));
    }, 900);
  };

  const triggerGameOver = useCallback((finalScore: number) => {
    isPlayingRef.current = false;
    setGameState('gameover');
    if (finalScore > 0) {
      addSats(finalScore, 'game_reward', 'Token Catcher Arcade');
      addXp(Math.floor(finalScore / 2));
      updateQuestProgress('catcher', Math.floor(finalScore / 20));
      updateQuestProgress('any', finalScore);
      sounds.playBigReward();
    } else {
      sounds.playBombExplosion();
    }
  }, [addSats, addXp, updateQuestProgress]);

  // Main game loop (60 FPS tick)
  useEffect(() => {
    if (gameState !== 'playing') return;
    isPlayingRef.current = true;

    let localLives = lives;
    let localScore = scoreSats;
    let localCombo = combo;
    let localMultiplier = multiplier;
    let localHasShield = hasShield;

    const gameLoop = (timestamp: number) => {
      if (!isPlayingRef.current) return;

      // Spawn items periodically (faster during frenzy)
      const spawnInterval = frenzyRef.current > 0 ? 550 : 850;
      if (timestamp - lastSpawnRef.current > spawnInterval) {
        spawnItem(timestamp);
        lastSpawnRef.current = timestamp;
      }

      const basketPos = basketXRef.current;
      const basketY = GAME_HEIGHT - 45;
      const nextItems: FallingItem[] = [];

      for (const item of itemsRef.current) {
        let currentY = item.y + item.speed;
        let currentX = item.x;

        // Magnet attraction during frenzy
        if (frenzyRef.current > 0 && item.type !== 'bomb') {
          const dx = basketPos + BASKET_WIDTH / 2 - currentX;
          currentX += dx * 0.05;
        }

        // Collision check with basket
        const hitX = currentX + item.size / 2 >= basketPos - 5 && currentX <= basketPos + BASKET_WIDTH + 5;
        const hitY = currentY + item.size >= basketY && currentY <= basketY + 28;

        if (hitX && hitY) {
          // Collected item!
          if (item.type === 'bomb') {
            if (localHasShield) {
              localHasShield = false;
              setHasShield(false);
              sounds.playClick();
              addFloatText('SHIELD BLOCKED!', basketPos, basketY - 20, '#38bdf8');
            } else {
              localLives -= 1;
              setLives(localLives);
              localCombo = 0;
              setCombo(0);
              localMultiplier = 1;
              setMultiplier(1);
              sounds.playBombExplosion();
              addFloatText('CRASH! -1 LIFE', basketPos, basketY - 20, '#ff3366');

              if (localLives <= 0) {
                triggerGameOver(localScore);
                return;
              }
            }
          } else if (item.type === 'shield') {
            localHasShield = true;
            setHasShield(true);
            sounds.playCoin();
            addFloatText('+SHIELD', basketPos, basketY - 20, '#38bdf8');
          } else if (item.type === 'bull') {
            setBullFrenzyTime(8); // 8 seconds of Bull frenzy!
            sounds.playBigReward();
            localMultiplier = 3;
            setMultiplier(3);
            localScore += item.value * 3;
            setScoreSats(localScore);
            addFloatText('BULL RUN! 3X', basketPos, basketY - 20, '#00e676');
          } else {
            // Normal token catch!
            sounds.playCoin();
            localCombo += 1;
            setCombo(localCombo);

            if (localCombo >= 15) localMultiplier = 4;
            else if (localCombo >= 10) localMultiplier = 3;
            else if (localCombo >= 5) localMultiplier = 2;
            setMultiplier(localMultiplier);

            const earned = item.value * localMultiplier;
            localScore += earned;
            setScoreSats(localScore);

            const multText = localMultiplier > 1 ? ` (${localMultiplier}x)` : '';
            addFloatText(`+${earned} Sats${multText}`, basketPos, basketY - 20, item.color);
          }
          continue; // Don't keep item
        }

        // Check if item fell off screen
        if (currentY > GAME_HEIGHT) {
          if (item.type !== 'bomb' && item.type !== 'shield' && frenzyRef.current <= 0) {
            // Missed a coin resets combo
            localCombo = 0;
            setCombo(0);
            localMultiplier = 1;
            setMultiplier(1);
          }
          continue;
        }

        nextItems.push({ ...item, y: currentY, x: currentX });
      }

      itemsRef.current = nextItems;
      setRenderItems(nextItems);

      animFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [gameState, triggerGameOver]);

  // Frenzy countdown timer
  useEffect(() => {
    if (bullFrenzyTime <= 0) return;
    const interval = setInterval(() => {
      setBullFrenzyTime((prev) => {
        if (prev <= 1) {
          setMultiplier(1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [bullFrenzyTime]);

  const handleStartGame = () => {
    if (wallet.energy < 10) {
      alert('Not enough Energy (needs 10). Wait for energy recharge or upgrade rigs!');
      return;
    }
    useArcadeEnergy(10);
    itemsRef.current = [];
    setRenderItems([]);
    setScoreSats(0);
    setLives(3);
    setCombo(0);
    setMultiplier(1);
    setBullFrenzyTime(0);
    setHasShield(false);
    setFloatingTexts([]);
    setBasketX((GAME_WIDTH - BASKET_WIDTH) / 2);
    setGameState('playing');
    sounds.playCoin();
  };

  return (
    <View style={styles.container}>
      {/* Top Bar Navigation */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color="#ffffff" />
          <Text style={styles.backBtnText}>Arcade Hub</Text>
        </TouchableOpacity>

        <View style={styles.topStatsRow}>
          <View style={styles.liveScoreBadge}>
            <Ionicons name="logo-bitcoin" size={16} color="#f7931a" />
            <Text style={styles.liveScoreText}>+{formatSats(scoreSats)} Sats</Text>
          </View>

          {bullFrenzyTime > 0 && (
            <View style={styles.frenzyBadge}>
              <Ionicons name="flame" size={14} color="#00e676" />
              <Text style={styles.frenzyBadgeText}>BULL RUN {bullFrenzyTime}s</Text>
            </View>
          )}
        </View>
      </View>

      {/* Game Stage Area */}
      <View style={[styles.gameStage, { width: GAME_WIDTH, height: GAME_HEIGHT }]}>
        {/* Sub-header status (Lives, Multiplier, Combo) */}
        <View style={styles.hudBar}>
          <View style={styles.livesRow}>
            {[1, 2, 3].map((heartIndex) => (
              <Ionicons
                key={heartIndex}
                name={heartIndex <= lives ? 'heart' : 'heart-dislike'}
                size={18}
                color={heartIndex <= lives ? '#ff3366' : '#475569'}
              />
            ))}
            {hasShield && <Ionicons name="shield-checkmark" size={18} color="#38bdf8" />}
          </View>

          <View style={styles.comboRow}>
            {combo > 2 && (
              <Text style={styles.comboText}>
                {combo} STREAK! <Text style={styles.comboMult}>({multiplier}x)</Text>
              </Text>
            )}
          </View>
        </View>

        {/* Falling items */}
        {renderItems.map((item) => (
          <View
            key={item.id}
            style={[
              styles.fallingItem,
              {
                left: item.x,
                top: item.y,
                width: item.size,
                height: item.size,
                backgroundColor: `${item.color}20`,
                borderColor: item.color,
              },
            ]}
          >
            <Ionicons name={item.icon as any} size={item.size * 0.65} color={item.color} />
          </View>
        ))}

        {/* Floating text alerts */}
        {floatingTexts.map((item) => (
          <Text
            key={item.id}
            style={[
              styles.floatingText,
              {
                left: Math.max(10, Math.min(GAME_WIDTH - 120, item.x)),
                top: item.y,
                color: item.color,
              },
            ]}
          >
            {item.text}
          </Text>
        ))}

        {/* Player Basket (Hardware Wallet) */}
        <View
          style={[
            styles.basket,
            {
              left: basketX,
              width: BASKET_WIDTH,
              top: GAME_HEIGHT - 50,
            },
          ]}
        >
          <View style={styles.basketTopGlow} />
          <Ionicons name="hardware-chip" size={18} color="#00f2fe" />
          <Text style={styles.basketLabel}>SATS VAULT</Text>
        </View>

        {/* Ready Overlay */}
        {gameState === 'ready' && (
          <View style={styles.overlayCenter}>
            <View style={styles.readyCard}>
              <View style={styles.readyIconBg}>
                <Ionicons name="cube-outline" size={48} color="#f7931a" />
              </View>
              <Text style={styles.readyTitle}>Token Catcher</Text>
              <Text style={styles.readySub}>
                Catch Bitcoin, Ethereum & Bull Rockets! Dodge Bear Market Bombs.
              </Text>

              <View style={styles.rulesList}>
                <View style={styles.ruleItem}>
                  <Ionicons name="logo-bitcoin" size={16} color="#f7931a" />
                  <Text style={styles.ruleText}>BTC: +50 Sats</Text>
                </View>
                <View style={styles.ruleItem}>
                  <Ionicons name="rocket" size={16} color="#00e676" />
                  <Text style={styles.ruleText}>Bull Rocket: 3X Magnet</Text>
                </View>
                <View style={styles.ruleItem}>
                  <Ionicons name="skull" size={16} color="#ff3366" />
                  <Text style={styles.ruleText}>Bear Trap: -1 Life</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.playBtn} onPress={handleStartGame}>
                <Ionicons name="play" size={20} color="#0a0b12" />
                <Text style={styles.playBtnText}>Play (10 Energy)</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Game Over Overlay */}
        {gameState === 'gameover' && (
          <View style={styles.overlayCenter}>
            <View style={styles.readyCard}>
              <Ionicons name="trophy" size={52} color="#ffd700" />
              <Text style={styles.readyTitle}>Session Finished!</Text>
              <Text style={styles.gameOverPrize}>+{formatSats(scoreSats)} SATS</Text>
              <Text style={styles.readySub}>Directly credited to your crypto balance.</Text>

              <TouchableOpacity style={styles.playBtn} onPress={handleStartGame}>
                <Ionicons name="refresh" size={18} color="#0a0b12" />
                <Text style={styles.playBtnText}>Play Again (10 Energy)</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryBtn} onPress={onBack}>
                <Text style={styles.secondaryBtnText}>Back to Hub</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Touch Directional Buttons (Left & Right for fast mobile action) */}
      {gameState === 'playing' && (
        <View style={styles.touchControlsRow}>
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={handleMoveLeft}
            activeOpacity={0.6}
          >
            <Ionicons name="arrow-back" size={26} color="#00f2fe" />
            <Text style={styles.controlBtnText}>MOVE LEFT</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlBtn}
            onPress={handleMoveRight}
            activeOpacity={0.6}
          >
            <Text style={styles.controlBtnText}>MOVE RIGHT</Text>
            <Ionicons name="arrow-forward" size={26} color="#00f2fe" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  topBar: {
    width: GAME_WIDTH,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
  topStatsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  liveScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#261b05',
    borderWidth: 1,
    borderColor: '#f7931a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  liveScoreText: {
    color: '#f7931a',
    fontWeight: '900',
    fontSize: 13,
  },
  frenzyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0c2e1f',
    borderWidth: 1,
    borderColor: '#00e676',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
  },
  frenzyBadgeText: {
    color: '#00e676',
    fontSize: 11,
    fontWeight: '800',
  },
  gameStage: {
    backgroundColor: '#0c0f1c',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1d2542',
    position: 'relative',
    overflow: 'hidden',
  },
  hudBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  livesRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  comboRow: {
    alignItems: 'flex-end',
  },
  comboText: {
    color: '#ffd700',
    fontSize: 12,
    fontWeight: '900',
  },
  comboMult: {
    color: '#00e676',
  },
  fallingItem: {
    position: 'absolute',
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingText: {
    position: 'absolute',
    fontSize: 13,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  basket: {
    position: 'absolute',
    height: 38,
    borderRadius: 12,
    backgroundColor: '#12182b',
    borderWidth: 1.5,
    borderColor: '#00f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  basketTopGlow: {
    position: 'absolute',
    top: -2,
    left: 4,
    right: 4,
    height: 3,
    backgroundColor: '#00f2fe',
    borderRadius: 2,
  },
  basketLabel: {
    color: '#00f2fe',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  overlayCenter: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 9, 18, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 20,
  },
  readyCard: {
    width: '100%',
    alignItems: 'center',
  },
  readyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2b1c06',
    borderWidth: 1,
    borderColor: '#f7931a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  readyTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 6,
  },
  readySub: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  rulesList: {
    width: '100%',
    backgroundColor: '#13182b',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#212a4a',
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ruleText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '600',
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#00e676',
    borderRadius: 14,
    paddingVertical: 14,
    width: '100%',
    justifyContent: 'center',
  },
  playBtnText: {
    color: '#0a0b12',
    fontSize: 15,
    fontWeight: '800',
  },
  gameOverPrize: {
    fontSize: 28,
    fontWeight: '900',
    color: '#00e676',
    marginVertical: 10,
  },
  secondaryBtn: {
    marginTop: 12,
    paddingVertical: 8,
  },
  secondaryBtnText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
  },
  touchControlsRow: {
    width: GAME_WIDTH,
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  controlBtn: {
    flex: 1,
    backgroundColor: '#141a30',
    borderWidth: 1,
    borderColor: '#252f52',
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  controlBtnText: {
    color: '#00f2fe',
    fontSize: 12,
    fontWeight: '800',
  },
});
