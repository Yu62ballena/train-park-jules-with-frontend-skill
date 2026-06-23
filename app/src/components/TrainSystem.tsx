import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useStore } from '../store/useStore';
import type { TrackPiece } from '../store/useStore';
import { Shinkansen, SteamLocomotive } from './Models';
import * as THREE from 'three';

// Helper to get connected track
const getNextTrack = (currentTrack: TrackPiece, allTracks: Record<string, TrackPiece>, reversed: boolean): TrackPiece | null => {
    // Very simplified routing logic based on current rotation and position
    // A real implementation would map out ports explicitly
    let dx = 0, dz = 0;

    // Simplistic port calculation based on rotation
    if (currentTrack.type === 'straight') {
        if (currentTrack.rotation === 0 || currentTrack.rotation === 2) {
            dz = reversed ? 1 : -1; // Moving N/S
        } else {
            dx = reversed ? -1 : 1; // Moving E/W
        }
    } else if (currentTrack.type === 'curve') {
        // Curve connects (e.g. rot 0 is NW: N port to W port)
        if (currentTrack.rotation === 0) {
           if(reversed) dx = -1; else dz = -1;
        } else if (currentTrack.rotation === 1) {
           if(reversed) dz = -1; else dx = 1;
        } else if (currentTrack.rotation === 2) {
           if(reversed) dx = 1; else dz = 1;
        } else if (currentTrack.rotation === 3) {
           if(reversed) dz = 1; else dx = -1;
        }
    }

    const nextPos = { x: currentTrack.position.x + dx, z: currentTrack.position.z + dz };
    return Object.values(allTracks).find(t => t.position.x === nextPos.x && t.position.z === nextPos.z) || null;
};

// Calculate position and rotation along a track piece (progress 0 to 1)
const getTrackTransform = (track: TrackPiece, progress: number, reversed: boolean) => {
    const pos = new THREE.Vector3();
    const rot = new THREE.Euler();

    let p = reversed ? 1 - progress : progress;

    if (track.type === 'straight') {
        // Local path from z=0.5 to z=-0.5
        const localZ = 0.5 - p;
        pos.set(0, 0, localZ);
        // apply track rotation
        const angle = -track.rotation * (Math.PI/2);
        pos.applyAxisAngle(new THREE.Vector3(0,1,0), angle);
        pos.x += track.position.x;
        pos.z += track.position.z;
        rot.set(0, angle, 0);
    } else if (track.type === 'curve') {
        // Curve from N port (z=-0.5) to W port (x=-0.5)
        const angleOffset = p * (Math.PI/2); // 0 to 90 deg
        const radius = 0.5;
        // Center is at -0.5, -0.5 relative to tile center
        const cx = -0.5, cz = -0.5;

        // At p=0, angle=0. We want pos to be (0, -0.5). So x = cx + r*cos(0), z = cz + r*sin(0) is not right.
        // N port is (0, -0.5). Center (-0.5, -0.5). Vector from C to N is (0.5, 0).
        // Angle 0 -> (cx + r, cz) = (0, -0.5).
        // W port is (-0.5, 0). Vector from C to W is (0, 0.5).
        // Angle pi/2 -> (cx, cz + r) = (-0.5, 0).

        const localX = cx + radius * Math.cos(angleOffset);
        const localZ = cz + radius * Math.sin(angleOffset);

        pos.set(localX, 0, localZ);

        // base curve rot
        const trackAngle = -track.rotation * (Math.PI/2);
        pos.applyAxisAngle(new THREE.Vector3(0,1,0), trackAngle);
        pos.x += track.position.x;
        pos.z += track.position.z;

        // Tangent rotation
        rot.set(0, trackAngle - angleOffset + (Math.PI/2), 0);
    }

    // Face the correct way
    if (reversed) {
        rot.y += Math.PI;
    }

    return { pos, rot };
};

const TrainInstance = ({ trainId }: { trainId: string }) => {
    const { trains, tracks, updateTrainProgress, cameraMode } = useStore();
    const train = trains[trainId];
    const groupRef = useRef<THREE.Group>(null);
    const { camera } = useThree();

    useFrame(() => {
        if (!train) return;
        let currentTrack = tracks[train.trackId];
        if (!currentTrack) return;

        let newProgress = train.progress + train.speed;
        let newTrackId = train.trackId;

        if (newProgress >= 1) {
            newProgress = 0;
            const next = getNextTrack(currentTrack, tracks, train.reversed);
            if (next) {
                newTrackId = next.id;
                currentTrack = next;
            } else {
                // End of line, bounce back (reverse)
                useStore.setState((s) => ({
                    trains: {
                        ...s.trains,
                        [trainId]: { ...s.trains[trainId], reversed: !train.reversed, progress: 0 }
                    }
                }));
                return;
            }
        }

        updateTrainProgress(trainId, newProgress, newTrackId);

        // Update 3D position
        if (groupRef.current) {
            const { pos, rot } = getTrackTransform(currentTrack, newProgress, train.reversed);
            groupRef.current.position.copy(pos);
            groupRef.current.rotation.copy(rot);

            if (cameraMode === 'FIRST_PERSON') {
                // Attach camera to this train
                const camOffset = new THREE.Vector3(0, 0.4, 0.3); // Slightly above and forward
                camOffset.applyEuler(rot);
                camera.position.copy(pos).add(camOffset);

                const lookAtOffset = new THREE.Vector3(0, 0.4, 2);
                lookAtOffset.applyEuler(rot);
                camera.lookAt(pos.clone().add(lookAtOffset));
            }
        }
    });

    if (!train) return null;

    return (
        <group ref={groupRef}>
            {train.type === 'shinkansen' ? <Shinkansen /> : <SteamLocomotive />}
        </group>
    );
};

export const TrainSystem = () => {
    const { trains, tracks, selectedTool, addTrain } = useStore();

    // Click handler to place trains on tracks
    const handleAddTrain = () => {
        if (selectedTool !== null) return; // Only place if train tool is selected
        // Find a random track to place it on if clicked generally, or we could use raycasting.
        // For simplicity, if we click anywhere and have train selected, place on the first available track.
        const firstTrackId = Object.keys(tracks)[0];
        if (firstTrackId) {
             addTrain(firstTrackId);
             useStore.getState().setSelectedTool('straight'); // reset tool
        }
    };

    return (
        <group onClick={handleAddTrain}>
             {/* Large transparent plane to catch train clicks */}
             <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]} visible={false}>
                 <planeGeometry args={[100, 100]} />
             </mesh>
             {Object.keys(trains).map(id => (
                <TrainInstance key={id} trainId={id} />
             ))}
        </group>
    );
};
