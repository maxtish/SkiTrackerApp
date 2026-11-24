import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

interface Props {
  rollL: number;
  yawL: number;
  rollR: number;
  yawR: number;
  isError: boolean;
  topView: boolean;
}

const WIDTH = 340;
const HEIGHT = 220;

const SKI_PTS: [number, number, number][] = [
  [-0.22, -1.5, 0],
  [0.22, -1.5, 0],
  [0.22, 1.2, 0],
  [0.15, 1.65, 0.22],
  [-0.15, 1.65, 0.22],
  [-0.22, 1.2, 0],
];

function projectPoint(
  p: [number, number, number],
  rollDeg: number,
  yawDeg: number,
  xOff: number,
  topView: boolean,
): string {
  const [x, y, z] = p;
  const r = (rollDeg * Math.PI) / 180;
  const w = (yawDeg * Math.PI) / 180;

  // Roll вокруг Y
  const x1 = x * Math.cos(r) + z * Math.sin(r);
  const z1 = -x * Math.sin(r) + z * Math.cos(r);
  const y1 = y;

  // Yaw вокруг Z
  const x2 = x1 * Math.cos(w) - y1 * Math.sin(w) + xOff;
  const y2 = x1 * Math.sin(w) + y1 * Math.cos(w);
  const z2 = z1;

  // Наклон камеры
  const cp = topView ? Math.PI / 2 : 0.55;
  const cy = y2 * Math.cos(cp) - z2 * Math.sin(cp);
  const cz = y2 * Math.sin(cp) + z2 * Math.cos(cp);

  const sc = 260 / (5.2 + cy);
  const sx = WIDTH / 2 + x2 * sc;
  const sy = HEIGHT / 2 - cz * sc;
  return `${sx.toFixed(1)},${sy.toFixed(1)}`;
}

export const SkiVisualizer: React.FC<Props> = ({
  rollL,
  yawL,
  rollR,
  yawR,
  isError,
  topView,
}) => {
  const fill = isError ? 'rgba(255, 59, 48, 0.85)' : 'rgba(46, 204, 113, 0.85)';

  const leftPoints = SKI_PTS.map(p =>
    projectPoint(p, rollL, yawL, -0.75, topView),
  ).join(' ');
  const rightPoints = SKI_PTS.map(p =>
    projectPoint(p, rollR, yawR, 0.75, topView),
  ).join(' ');

  return (
    <View style={styles.box}>
      <Svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <Polygon
          points={leftPoints}
          fill={fill}
          stroke="#ffffff"
          strokeWidth={2}
        />
        <Polygon
          points={rightPoints}
          fill={fill}
          stroke="#ffffff"
          strokeWidth={2}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    overflow: 'hidden',
  },
});
