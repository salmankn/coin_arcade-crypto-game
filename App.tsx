import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';

import { GameProvider, useGame } from './src/context/GameContext';
import { Header } from './src/components/Header';
import { BottomNav, TabType } from './src/components/BottomNav';
import { WithdrawModal } from './src/components/WithdrawModal';
import { LootBoxModal } from './src/components/LootBoxModal';
import { TxExplorerModal } from './src/components/TxExplorerModal';

import { GamesScreen } from './src/screens/GamesScreen';
import { WalletScreen } from './src/screens/WalletScreen';
import { QuestsScreen } from './src/screens/QuestsScreen';
import { LeaderboardScreen } from './src/screens/LeaderboardScreen';
import { MarketScreen } from './src/screens/MarketScreen';

function MainApp() {
  const { quests } = useGame();
  const [currentTab, setCurrentTab] = useState<TabType>('games');

  // Modals state
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [lootModalVisible, setLootModalVisible] = useState(false);
  const [explorerState, setExplorerState] = useState<{
    visible: boolean;
    txHash: string;
    network: string;
    amount: number;
  }>({
    visible: false,
    txHash: '',
    network: '',
    amount: 0,
  });

  const unclaimedQuests = quests.filter((q) => q.progress >= q.target && !q.claimed).length;

  const handleOpenTxExplorer = (txHash: string, network: string, amount: number) => {
    setExplorerState({
      visible: true,
      txHash,
      network,
      amount,
    });
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="light" backgroundColor="#0a0b12" />

      {/* Persistent Crypto Header */}
      <Header
        onOpenWallet={() => setCurrentTab('wallet')}
        onOpenLoot={() => setLootModalVisible(true)}
      />

      {/* Main Content View by Selected Tab */}
      <View style={styles.contentContainer}>
        {currentTab === 'games' && (
          <GamesScreen onOpenLoot={() => setLootModalVisible(true)} />
        )}
        {currentTab === 'wallet' && (
          <WalletScreen
            onOpenWithdraw={() => setWithdrawModalVisible(true)}
            onOpenTxExplorer={handleOpenTxExplorer}
          />
        )}
        {currentTab === 'quests' && (
          <QuestsScreen onOpenLoot={() => setLootModalVisible(true)} />
        )}
        {currentTab === 'tourney' && <LeaderboardScreen />}
        {currentTab === 'market' && <MarketScreen />}
      </View>

      {/* Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        unclaimedQuestsCount={unclaimedQuests}
      />

      {/* Cashout / Withdrawal Flow Modal */}
      <WithdrawModal
        visible={withdrawModalVisible}
        onClose={() => setWithdrawModalVisible(false)}
        onViewTxExplorer={handleOpenTxExplorer}
      />

      {/* Satoshi Mystery Block Loot Modal */}
      <LootBoxModal
        visible={lootModalVisible}
        onClose={() => setLootModalVisible(false)}
      />

      {/* Blockchain Mempool Explorer Modal */}
      <TxExplorerModal
        visible={explorerState.visible}
        onClose={() => setExplorerState((prev) => ({ ...prev, visible: false }))}
        txHash={explorerState.txHash}
        network={explorerState.network}
        amount={explorerState.amount}
      />
    </SafeAreaView>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GameProvider>
        <MainApp />
      </GameProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#0a0b12',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#0a0b12',
  },
});
