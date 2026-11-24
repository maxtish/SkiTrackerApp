import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SkiSettings } from '../hooks/useSettings';
import { AxisKey, SkiTelemetry } from '../types/ski';

interface Props {
  rawLeft: SkiTelemetry;
  rawRight: SkiTelemetry;
  settings: SkiSettings;
  onChange: (patch: Partial<SkiSettings>) => void;
}

const AXES: AxisKey[] = ['X', 'Y', 'Z'];

const SkiAxisBlock: React.FC<{
  title: string;
  data: SkiTelemetry;
  rollAxis: AxisKey;
  yawAxis: AxisKey;
  onSetRoll: (a: AxisKey) => void;
  onSetYaw: (a: AxisKey) => void;
}> = ({ title, data, rollAxis, yawAxis, onSetRoll, onSetYaw }) => {
  const getVal = (a: AxisKey) =>
    a === 'X' ? data.angleX : a === 'Y' ? data.angleY : data.angleZ;

  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>{title}</Text>
      {AXES.map(axis => {
        const isRoll = rollAxis === axis;
        const isYaw = yawAxis === axis;
        return (
          <View key={axis} style={styles.row}>
            <Text style={styles.axisName}>Ось {axis}:</Text>
            <Text style={styles.axisVal}>{getVal(axis).toFixed(1)}°</Text>
            <TouchableOpacity
              style={[styles.btn, isRoll && styles.btnActiveRoll]}
              onPress={() => onSetRoll(axis)}
            >
              <Text style={styles.btnText}>Закантовка</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, isYaw && styles.btnActiveYaw]}
              onPress={() => onSetYaw(axis)}
            >
              <Text style={styles.btnText}>Поворот</Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
};

export const AxisMapperPanel: React.FC<Props> = ({
  rawLeft,
  rawRight,
  settings,
  onChange,
}) => (
  <View style={styles.container}>
    <Text style={styles.hint}>
      Наклони или поверни датчик — нажми кнопку напротив оси, которая меняется:
    </Text>
    <SkiAxisBlock
      title="Левая лыжа (L)"
      data={rawLeft}
      rollAxis={settings.rollAxisL}
      yawAxis={settings.yawAxisL}
      onSetRoll={a => onChange({ rollAxisL: a })}
      onSetYaw={a => onChange({ yawAxisL: a })}
    />
    <SkiAxisBlock
      title="Правая лыжа (R)"
      data={rawRight}
      rollAxis={settings.rollAxisR}
      yawAxis={settings.yawAxisR}
      onSetRoll={a => onChange({ rollAxisR: a })}
      onSetYaw={a => onChange({ yawAxisR: a })}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1b1b1b',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  hint: { color: '#aaa', fontSize: 12, marginBottom: 10 },
  block: { marginBottom: 10 },
  blockTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  axisName: { color: '#ccc', width: 46, fontSize: 13 },
  axisVal: {
    color: '#2ecc71',
    width: 58,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
    marginRight: 4,
  },
  btn: {
    flex: 1,
    backgroundColor: '#2c3e50',
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnActiveRoll: { backgroundColor: '#27ae60' },
  btnActiveYaw: { backgroundColor: '#2980b9' },
  btnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
