import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors, role } from '../theme/tokens';

/** Bundled empty-state art (FR-012/014, D2): drawn with react-native-svg rather
 *  than shipping raster files — same "scan-bracket" viewfinder motif as ScanRing,
 *  so every empty state still reads as Lahza, not a generic icon. All bundled,
 *  no runtime fetch (FR-022). */
const SIZE = 120;

function Brackets() {
  const c = colors.glowTeal;
  const arm = 18;
  const corners: [number, number, number, number][] = [
    [10, 10, arm, 0], // top-left: right, down
    [SIZE - 10, 10, -arm, 0],
    [10, SIZE - 10, arm, 0],
    [SIZE - 10, SIZE - 10, -arm, 0],
  ];
  return (
    <>
      {corners.map(([x, y, dx], i) => (
        <Path
          key={i}
          d={`M ${x} ${y + (i < 2 ? arm : -arm)} L ${x} ${y} L ${x + dx} ${y}`}
          stroke={c}
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
        />
      ))}
    </>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
      <Brackets />
      {children}
    </Svg>
  );
}

const mid = SIZE / 2;

export const illustrations = {
  gallery: () => (
    <Frame>
      <Rect x={mid - 24} y={mid - 18} width={48} height={36} rx={6} stroke={colors.inkFaint} strokeWidth={2.5} fill="none" />
      <Circle cx={mid - 10} cy={mid - 6} r={5} stroke={colors.inkFaint} strokeWidth={2.5} fill="none" />
      <Path d={`M ${mid - 24} ${mid + 14} L ${mid - 6} ${mid - 2} L ${mid + 6} ${mid + 8} L ${mid + 24} ${mid - 4} L ${mid + 24} ${mid + 18} L ${mid - 24} ${mid + 18} Z`} fill={colors.paperSunk} />
    </Frame>
  ),
  search: () => (
    <Frame>
      <Circle cx={mid - 6} cy={mid - 6} r={18} stroke={colors.inkFaint} strokeWidth={2.5} fill="none" />
      <Path d={`M ${mid + 7} ${mid + 7} L ${mid + 22} ${mid + 22}`} stroke={colors.inkFaint} strokeWidth={3} strokeLinecap="round" />
    </Frame>
  ),
  permission: () => (
    <Frame>
      <Rect x={mid - 16} y={mid - 4} width={32} height={26} rx={4} stroke={colors.inkFaint} strokeWidth={2.5} fill="none" />
      <Path d={`M ${mid - 10} ${mid - 4} L ${mid - 10} ${mid - 14} A 10 10 0 0 1 ${mid + 10} ${mid - 14} L ${mid + 10} ${mid - 4}`} stroke={colors.inkFaint} strokeWidth={2.5} fill="none" />
    </Frame>
  ),
  offline: () => (
    <Frame>
      <Path
        d={`M ${mid - 22} ${mid + 6} A 12 12 0 0 1 ${mid - 20} ${mid - 12} A 16 16 0 0 1 ${mid + 14} ${mid - 14} A 11 11 0 0 1 ${mid + 22} ${mid + 6} Z`}
        stroke={colors.inkFaint}
        strokeWidth={2.5}
        fill="none"
      />
      <Path d={`M ${mid - 16} ${mid - 10} L ${mid + 18} ${mid + 16}`} stroke={role.identity} strokeWidth={2.5} strokeLinecap="round" />
    </Frame>
  ),
} as const;
