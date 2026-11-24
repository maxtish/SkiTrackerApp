import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  title: string;
  diffValue: number;
  leftVal: number;
  rightVal: number;
  isError: boolean;
}

export const MetricCard: React.FC<Props> = ({
  title,
  diffValue,
  leftVal,
  rightVal,
  isError,
}) => (
  <View style={[styles.card, isError && styles.cardErr]}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.val}>{diffValue.toFixed(1)}°</Text>
    <Text style={styles.sub}>
      L: {leftVal.toFixed(1)}° | R: {rightVal.toFixed(1)}°
    </Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#222',
    padding: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2ecc71',
    alignItems: 'center',
  },
  cardErr: {
    borderColor: '#ff3b30',
    backgroundColor: '#3a1616',
  },
  title: { color: '#eee', fontSize: 14 },
  val: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginVertical: 4 },
  sub: { color: '#aaa', fontSize: 12 },
});
