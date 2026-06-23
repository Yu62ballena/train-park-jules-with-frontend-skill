import { create } from 'zustand';


export type TrackType = 'straight' | 'curve' | 'station';
export type Direction = 0 | 1 | 2 | 3; // 0: N, 1: E, 2: S, 3: W
export type GameMode = 'FREE' | 'TEMPLATE' | 'PRESET';
export type CameraMode = 'OVERVIEW' | 'FIRST_PERSON';
export type TrainType = 'shinkansen' | 'steam';

export interface Position {
  x: number;
  z: number;
}

export interface TrackPiece {
  id: string;
  type: TrackType;
  position: Position;
  rotation: Direction; // The direction the "entrance" faces. For curve, entrance is 0, exit is 1 (90 deg turn).
}

export interface Train {
  id: string;
  type: TrainType;
  trackId: string;
  progress: number; // 0 to 1 along current track piece
  speed: number;
  reversed: boolean;
}

export interface TemplatePiece {
    type: TrackType;
    position: Position;
    rotation: Direction;
}

interface AppState {
  mode: GameMode;
  cameraMode: CameraMode;
  tracks: Record<string, TrackPiece>;
  trains: Record<string, Train>;
  selectedTool: TrackType | null;
  selectedTrainType: TrainType;
  templateTracks: TemplatePiece[];

  // Actions
  setMode: (mode: GameMode) => void;
  setCameraMode: (mode: CameraMode) => void;
  setSelectedTool: (tool: TrackType | null) => void;
  setSelectedTrainType: (type: TrainType) => void;
  addTrack: (track: Omit<TrackPiece, 'id'>) => void;
  removeTrack: (id: string) => void;
  addTrain: (trackId: string) => void;
  updateTrainProgress: (id: string, progress: number, newTrackId?: string) => void;
  loadPreset: () => void;
  loadTemplate: () => void;
  clearAll: () => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useStore = create<AppState>((set, get) => ({
  mode: 'FREE',
  cameraMode: 'OVERVIEW',
  tracks: {},
  trains: {},
  selectedTool: 'straight',
  selectedTrainType: 'shinkansen',
  templateTracks: [],

  setMode: (mode) => {
      set({ mode });
      if (mode === 'PRESET') get().loadPreset();
      else if (mode === 'TEMPLATE') get().loadTemplate();
      else get().clearAll();
  },
  setCameraMode: (cameraMode) => set({ cameraMode }),
  setSelectedTool: (selectedTool) => set({ selectedTool }),
  setSelectedTrainType: (selectedTrainType) => set({ selectedTrainType }),

  addTrack: (trackData) => {
    const id = generateId();
    // Prevent overlapping tracks at exact same coordinate
    const exists = Object.values(get().tracks).some(
        t => t.position.x === trackData.position.x && t.position.z === trackData.position.z
    );
    if (!exists) {
        set((state) => ({
        tracks: { ...state.tracks, [id]: { ...trackData, id } },
        }));
    }
  },

  removeTrack: (id) => set((state) => {
    const newTracks = { ...state.tracks };
    delete newTracks[id];
    return { tracks: newTracks };
  }),

  addTrain: (trackId) => {
    const id = generateId();
    set((state) => ({
      trains: {
        ...state.trains,
        [id]: {
          id,
          type: state.selectedTrainType,
          trackId,
          progress: 0,
          speed: 0.01,
          reversed: false,
        },
      },
    }));
  },

  updateTrainProgress: (id, progress, newTrackId) => set((state) => {
    const train = state.trains[id];
    if (!train) return state;
    return {
      trains: {
        ...state.trains,
        [id]: { ...train, progress, trackId: newTrackId ?? train.trackId },
      },
    };
  }),

  loadPreset: () => {
    const presetTracks: Record<string, TrackPiece> = {};
    const addP = (x: number, z: number, type: TrackType, r: Direction) => {
        const id = generateId();
        presetTracks[id] = { id, position: { x, z }, type, rotation: r };
    };

    // Simple oval loop
    addP(0, 0, 'curve', 2);
    addP(1, 0, 'straight', 1);
    addP(2, 0, 'straight', 1);
    addP(3, 0, 'curve', 3);
    addP(3, 1, 'straight', 2);
    addP(3, 2, 'curve', 0);
    addP(2, 2, 'straight', 3);
    addP(1, 2, 'straight', 3);
    addP(0, 2, 'curve', 1);
    addP(0, 1, 'straight', 0);

    const firstId = Object.keys(presetTracks)[0];
    const trains = {
        'train1': { id: 'train1', type: 'shinkansen' as TrainType, trackId: firstId, progress: 0, speed: 0.015, reversed: false }
    };

    set({ tracks: presetTracks, trains, templateTracks: [] });
  },

  loadTemplate: () => {
    set({ tracks: {}, trains: {} });
    // An 8-figure shape template
    const template: TemplatePiece[] = [
        { position: {x:0, z:0}, type: 'curve', rotation: 1 },
        { position: {x:1, z:0}, type: 'straight', rotation: 1 },
        { position: {x:2, z:0}, type: 'curve', rotation: 2 },
        { position: {x:2, z:1}, type: 'curve', rotation: 0 },
        { position: {x:3, z:1}, type: 'straight', rotation: 1 },
        { position: {x:4, z:1}, type: 'curve', rotation: 2 },
        { position: {x:4, z:2}, type: 'curve', rotation: 3 },
        { position: {x:3, z:2}, type: 'straight', rotation: 3 },
        { position: {x:2, z:2}, type: 'curve', rotation: 1 },
        { position: {x:2, z:3}, type: 'curve', rotation: 3 },
        { position: {x:1, z:3}, type: 'straight', rotation: 3 },
        { position: {x:0, z:3}, type: 'curve', rotation: 0 },
        { position: {x:0, z:2}, type: 'straight', rotation: 0 },
        { position: {x:0, z:1}, type: 'straight', rotation: 0 },
    ];
    set({ templateTracks: template });
  },

  clearAll: () => set({ tracks: {}, trains: {}, templateTracks: [] }),
}));
