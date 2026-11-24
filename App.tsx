import { useKeepAwake } from '@sayem314/react-native-keep-awake';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AxisMapperPanel } from './src/components/AxisMapperPanel';
import { MetricCard } from './src/components/MetricCard';
import { SettingsPanel } from './src/components/SettingsPanel';
import { SkiVisualizer } from './src/components/SkiVisualizer';
import { useSettings } from './src/hooks/useSettings';
import { useSkiTracker } from './src/hooks/useSkiTracker';
import { ConnectionStatus } from './src/types/ski';

const statusColor = (s: ConnectionStatus) => {
  if (s === 'connected') return '#2ecc71';
  if (s === 'scanning' || s === 'connecting') return '#f1c40f';
  return '#7f8c8d';
};

export default function App() {
  useKeepAwake();

  const { settings, updateSettings, resetSettings } = useSettings();
  const {
    leftStatus,
    rightStatus,
    rawLeft,
    rawRight,
    rollL,
    rollR,
    yawL,
    yawR,
    diffRoll,
    diffYaw,
    isRollError,
    isYawError,
    error,
    connect,
    disconnect,
    resetZero,
    recalibrate,
  } = useSkiTracker(settings);

  const [topView, setTopView] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAxes, setShowAxes] = useState(false);

  const anyConnected =
    leftStatus === 'connected' || rightStatus === 'connected';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>Ski 3D Tracker</Text>

        {/* Статусы подключения L и R */}
        <View style={styles.statusRow}>
          <View style={styles.badge}>
            <View
              style={[styles.dot, { backgroundColor: statusColor(leftStatus) }]}
            />
            <Text style={styles.badgeText}>L: {leftStatus}</Text>
          </View>
          <View style={styles.badge}>
            <View
              style={[
                styles.dot,
                { backgroundColor: statusColor(rightStatus) },
              ]}
            />
            <Text style={styles.badgeText}>R: {rightStatus}</Text>
          </View>
        </View>

        {/* Активные лимиты и выбранные оси */}
        <Text style={styles.limitsInfo}>
          Roll ≤ {settings.rollLimit.toFixed(0)}° ({settings.rollAxisL}/
          {settings.rollAxisR}) | Yaw ≤ {settings.yawLimit.toFixed(1)}° (
          {settings.yawAxisL}/{settings.yawAxisR}) | x
          {settings.sensitivity.toFixed(1)}
        </Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <SkiVisualizer
          rollL={rollL}
          yawL={yawL}
          rollR={rollR}
          yawR={yawR}
          isError={isRollError || isYawError}
          topView={topView}
        />

        <View style={styles.metricsRow}>
          <MetricCard
            title="Закантовка"
            diffValue={diffRoll}
            leftVal={rollL}
            rightVal={rollR}
            isError={isRollError}
          />
          <MetricCard
            title="Параллельность"
            diffValue={diffYaw}
            leftVal={yawL}
            rightVal={yawR}
            isError={isYawError}
          />
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[
              styles.btn,
              anyConnected ? styles.btnDanger : styles.btnPrimary,
            ]}
            onPress={anyConnected ? disconnect : connect}
          >
            <Text style={styles.btnText}>
              {anyConnected ? 'Отключить' : 'Подключить'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnTool, showAxes && styles.btnToolActive]}
            onPress={() => {
              setShowAxes(v => !v);
              setShowSettings(false);
            }}
          >
            <Text style={styles.btnText}>Оси</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnTool, showSettings && styles.btnToolActive]}
            onPress={() => {
              setShowSettings(v => !v);
              setShowAxes(false);
            }}
          >
            <Text style={styles.btnText}>Настр. ⚙</Text>
          </TouchableOpacity>
        </View>

        {showAxes && (
          <AxisMapperPanel
            rawLeft={rawLeft}
            rawRight={rawRight}
            settings={settings}
            onChange={updateSettings}
          />
        )}

        {showSettings && (
          <SettingsPanel
            settings={settings}
            onChange={updateSettings}
            onReset={resetSettings}
          />
        )}

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.btnSecondary} onPress={resetZero}>
            <Text style={styles.btnText}>Сбросить ноль</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecondary} onPress={recalibrate}>
            <Text style={styles.btnText}>Калибровка</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => setTopView(v => !v)}
          >
            <Text style={styles.btnText}>
              {topView ? 'Вид: Сверху' : 'Вид: Сзади'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  scroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 },
  header: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  statusRow: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  badgeText: { color: '#ddd', fontSize: 13 },
  limitsInfo: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  errorText: { color: '#ff3b30', textAlign: 'center', marginTop: 8 },
  metricsRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  btnRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  btn: { flex: 2, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  btnPrimary: { backgroundColor: '#3498db' },
  btnDanger: { backgroundColor: '#c0392b' },
  btnTool: {
    flex: 1,
    backgroundColor: '#34495e',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnToolActive: {
    backgroundColor: '#2980b9',
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: '#2c3e50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
