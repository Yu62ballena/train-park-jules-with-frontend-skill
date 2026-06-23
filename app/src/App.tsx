import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import { UI } from './components/UI';
import { TrackSystem } from './components/TrackSystem';
import { TrainSystem } from './components/TrainSystem';
import { useStore } from './store/useStore';

function App() {
  const { cameraMode, mode } = useStore();

  useEffect(() => {
    // Initialize in FREE mode
    if(Object.keys(useStore.getState().tracks).length === 0 && mode === 'FREE') {
      useStore.getState().setMode('FREE');
    }
  }, [mode]);

  return (
    <div className="w-screen h-screen bg-sky-200 overflow-hidden relative">
      <UI />
      <Canvas
        shadows
        camera={{ position: [0, 5, 5], fov: 50 }}
        className="w-full h-full"
      >
        <Sky sunPosition={[100, 20, 100]} turbidity={0.1} rayleigh={0.5} />
        <ambientLight intensity={0.4} />
        <directionalLight
          castShadow
          position={[10, 10, 5]}
          intensity={1.5}
          shadow-mapSize={[1024, 1024]}
        />

        {/* Environment - Green field */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.05, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#4ade80" roughness={1} />
        </mesh>

        {/* Simple distant mountains */}
        <mesh position={[0, 0, -20]}>
          <coneGeometry args={[10, 5, 4]} />
          <meshStandardMaterial color="#16a34a" />
        </mesh>
        <mesh position={[-15, 0, -15]}>
          <coneGeometry args={[8, 6, 4]} />
          <meshStandardMaterial color="#15803d" />
        </mesh>
        <mesh position={[15, 0, -18]}>
          <coneGeometry args={[12, 7, 4]} />
          <meshStandardMaterial color="#166534" />
        </mesh>

        <TrackSystem />
        <TrainSystem />

        {cameraMode === 'OVERVIEW' && (
          <OrbitControls
            makeDefault
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2.1}
            minDistance={2}
            maxDistance={20}
            target={[0, 0, 0]}
          />
        )}
      </Canvas>
    </div>
  );
}

export default App;
