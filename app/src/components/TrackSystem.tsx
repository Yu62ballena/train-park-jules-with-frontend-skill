import { useCallback } from 'react';

import { useStore } from '../store/useStore';
import type { Direction } from '../store/useStore';
import { StraightTrack, CurvedTrack } from './Models';

const GRID_SIZE = 1;

export const TrackSystem = () => {
  const { tracks, mode, templateTracks, selectedTool, addTrack } = useStore();
  // eslint-disable-next-line
  // const { camera } = useThree();

  const handlePlaneClick = useCallback((e: any) => {
    e.stopPropagation();
    if (mode === 'PRESET' || !selectedTool || (selectedTool !== 'straight' && selectedTool !== 'curve')) return;

    // Determine grid position based on click intersection point
    const x = Math.round(e.point.x / GRID_SIZE);
    const z = Math.round(e.point.z / GRID_SIZE);

    // Basic rotation logic: try to connect to an adjacent piece if there is one
    let rotation: Direction = 0; // Default north

    // Simplistic snapping: just look at neighbours to guess rotation
    const n = Object.values(tracks).find(t => t.position.x === x && t.position.z === z - 1);
    const s = Object.values(tracks).find(t => t.position.x === x && t.position.z === z + 1);
    const e_pos = Object.values(tracks).find(t => t.position.x === x + 1 && t.position.z === z);
    const w_pos = Object.values(tracks).find(t => t.position.x === x - 1 && t.position.z === z);

    if (selectedTool === 'straight') {
      if (e_pos || w_pos) rotation = 1; // East-West alignment
      else rotation = 0; // North-South
    } else if (selectedTool === 'curve') {
        // Simple logic for curve snapping (0=NW, 1=NE, 2=SE, 3=SW)
        if (s && e_pos) rotation = 2; // connects South and East
        else if (s && w_pos) rotation = 3; // connects South and West
        else if (n && e_pos) rotation = 1; // connects North and East
        else rotation = 0; // default North-West
    }

    addTrack({ position: { x, z }, type: selectedTool, rotation });
  }, [mode, selectedTool, tracks, addTrack]);

  return (
    <group>
      {/* Invisible plane to catch clicks for track placement */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} onClick={handlePlaneClick}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Grid helper */}
      <gridHelper args={[100, 100, 0xffffff, 0xffffff]} material-opacity={0.2} material-transparent />

      {/* Render Template Ghost Tracks */}
      {mode === 'TEMPLATE' && templateTracks.map((t, i) => (
        <group key={`template-${i}`} position={[t.position.x, 0, t.position.z]} rotation={[0, -t.rotation * (Math.PI/2), 0]}>
           {t.type === 'straight' ? <StraightTrack ghost /> : <CurvedTrack ghost />}
        </group>
      ))}

      {/* Render Actual Tracks */}
      {Object.values(tracks).map(t => (
        <group key={t.id} position={[t.position.x, 0, t.position.z]} rotation={[0, -t.rotation * (Math.PI/2), 0]}>
           {t.type === 'straight' ? <StraightTrack /> : <CurvedTrack />}
        </group>
      ))}
    </group>
  );
};
