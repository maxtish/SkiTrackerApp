import React from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SkiSettings } from '../hooks/useSettings';

interface Props {
  settings: SkiSettings;
  onChange: (patch: Partial<SkiSettings>) => void;
  onReset: () => void;
}

const Stepper: React.FC<{
  label: string;
  value: string;
  onMinus: () => void;
  onPlus: () => void;
}> = ({ label, value, onMinus, onPlus }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.controls}>
      <TouchableOpacity style={styles.stepBtn} onPress={onMinus}>
        <Text style={styles.stepText}>−</Text>
      </TouchableOpacity>
      <Text style={styles.valText}>{value}</Text>
      <TouchableOpacity style={styles.stepBtn} onPress={onPlus}>
        <Text style={styles.stepText}>+</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export const SettingsPanel: React.FC<Props> = ({
  settings,
  onChange,
  onReset,
}) => {
  const clamp = (val: number, min: number, max: number) =>
    Math.min(max, Math.max(min, Number(val.toFixed(2))));

  return (
    <View style={styles.box}>
      <Stepper
        label="Допуск закантовки"
        value={`${settings.rollLimit.toFixed(0)}°`}
        onMinus={() =>
          onChange({ rollLimit: clamp(settings.rollLimit - 1, 2, 45) })
        }
        onPlus={() =>
          onChange({ rollLimit: clamp(settings.rollLimit + 1, 2, 45) })
        }
      />
      <Stepper
        label="Допуск параллельности"
        value={`${settings.yawLimit.toFixed(1)}°`}
        onMinus={() =>
          onChange({ yawLimit: clamp(settings.yawLimit - 0.5, 1, 30) })
        }
        onPlus={() =>
          onChange({ yawLimit: clamp(settings.yawLimit + 0.5, 1, 30) })
        }
      />
      <Stepper
        label="Чувствительность"
        value={`x${settings.sensitivity.toFixed(1)}`}
        onMinus={() =>
          onChange({ sensitivity: clamp(settings.sensitivity - 0.1, 0.3, 3.0) })
        }
        onPlus={() =>
          onChange({ sensitivity: clamp(settings.sensitivity + 0.1, 0.3, 3.0) })
        }
      />

      <View style={styles.row}>
        <Text style={styles.label}>Инверсия оси L</Text>
        <Switch
          value={settings.invertRollL}
          onValueChange={v => onChange({ invertRollL: v })}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Инверсия оси R</Text>
        <Switch
          value={settings.invertRollR}
          onValueChange={v => onChange({ invertRollR: v })}
        />
      </View>

      <TouchableOpacity style={styles.resetBtn} onPress={onReset}>
        <Text style={styles.resetText}>Сбросить настройки по умолчанию</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#1b1b1b',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  label: { color: '#ddd', fontSize: 14 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: '#2c3e50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  valText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    minWidth: 46,
    textAlign: 'center',
  },
  resetBtn: {
    marginTop: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  resetText: { color: '#95a5a6', fontSize: 13 },
});
