import * as THREE from 'three';

// Materials
const trackMaterial = new THREE.MeshStandardMaterial({ color: '#1d4ed8', roughness: 0.4 }); // Blue plastic
const railMaterial = new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.2 }); // Silver
const sleeperMaterial = new THREE.MeshStandardMaterial({ color: '#fbbf24', roughness: 0.8 }); // Yellow plastic
const shinkansenBody = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.2 });
const shinkansenStripe = new THREE.MeshStandardMaterial({ color: '#2563eb', roughness: 0.2 });
const steamBody = new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.5 });
const steamAccent = new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.4 });
const ghostMaterial = new THREE.MeshStandardMaterial({ color: '#10b981', transparent: true, opacity: 0.4, wireframe: true });

export const StraightTrack = ({ ghost = false }: { ghost?: boolean }) => {
  const mat = ghost ? ghostMaterial : trackMaterial;
  return (
    <group>
      {/* Base */}
      <mesh material={mat} position={[0, 0.05, 0]}>
        <boxGeometry args={[0.8, 0.1, 1]} />
      </mesh>
      {/* Rails */}
      {!ghost && (
        <>
          <mesh material={railMaterial} position={[-0.25, 0.12, 0]}>
            <boxGeometry args={[0.05, 0.05, 1]} />
          </mesh>
          <mesh material={railMaterial} position={[0.25, 0.12, 0]}>
            <boxGeometry args={[0.05, 0.05, 1]} />
          </mesh>
          {/* Sleepers */}
          {[-0.3, 0, 0.3].map((z, i) => (
             <mesh key={i} material={sleeperMaterial} position={[0, 0.1, z]}>
                <boxGeometry args={[0.6, 0.02, 0.1]} />
             </mesh>
          ))}
        </>
      )}
    </group>
  );
};

export const CurvedTrack = ({ ghost = false }: { ghost?: boolean }) => {
  const mat = ghost ? ghostMaterial : trackMaterial;

  return (
    <group>
      {/* Base using an arc approximation to look like toy track */}
      <mesh material={mat} position={[-0.5, 0.05, -0.5]} rotation={[-Math.PI/2, 0, 0]}>
        <ringGeometry args={[0.1, 0.9, 16, 1, -Math.PI/2, Math.PI/2]} />
      </mesh>

      {!ghost && (
        <group position={[-0.5, 0.12, -0.5]} rotation={[-Math.PI/2, 0, 0]}>
           <mesh material={railMaterial}>
             <ringGeometry args={[0.22, 0.28, 16, 1, -Math.PI/2, Math.PI/2]} />
           </mesh>
           <mesh material={railMaterial}>
             <ringGeometry args={[0.72, 0.78, 16, 1, -Math.PI/2, Math.PI/2]} />
           </mesh>
        </group>
      )}
    </group>
  );
};

export const Shinkansen = () => (
  <group>
    {/* Main body */}
    <mesh material={shinkansenBody} position={[0, 0.3, 0]}>
      <boxGeometry args={[0.4, 0.4, 0.8]} />
    </mesh>
    {/* Nose - apply rotation on the mesh itself since geometry doesn't accept rotation in r3f in latest typings easily */}
    <mesh material={shinkansenBody} position={[0, 0.2, 0.5]} rotation={[Math.PI/2, 0, 0]}>
      <coneGeometry args={[0.2, 0.4, 16]} />
    </mesh>
    {/* Stripe */}
    <mesh material={shinkansenStripe} position={[0, 0.3, 0]}>
      <boxGeometry args={[0.42, 0.1, 0.8]} />
    </mesh>
    {/* Wheels */}
    {[-0.25, 0.25].map((z, i) => (
      <group key={i} position={[0, 0.1, z]}>
        <mesh material={steamBody} position={[-0.15, 0, 0]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
        </mesh>
        <mesh material={steamBody} position={[0.15, 0, 0]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
        </mesh>
      </group>
    ))}
  </group>
);

export const SteamLocomotive = () => (
  <group>
    {/* Boiler */}
    <mesh material={steamBody} position={[0, 0.3, 0.1]} rotation={[Math.PI/2, 0, 0]}>
      <cylinderGeometry args={[0.15, 0.15, 0.6, 16]} />
    </mesh>
    {/* Cabin */}
    <mesh material={steamBody} position={[0, 0.4, -0.3]}>
      <boxGeometry args={[0.35, 0.4, 0.3]} />
    </mesh>
    {/* Funnel */}
    <mesh material={steamAccent} position={[0, 0.6, 0.3]}>
      <cylinderGeometry args={[0.05, 0.03, 0.2]} />
    </mesh>
    {/* Wheels */}
    {[-0.3, 0, 0.3].map((z, i) => (
      <group key={i} position={[0, 0.1, z]}>
        <mesh material={steamAccent} position={[-0.15, 0, 0]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
        </mesh>
        <mesh material={steamAccent} position={[0.15, 0, 0]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
        </mesh>
      </group>
    ))}
  </group>
);
