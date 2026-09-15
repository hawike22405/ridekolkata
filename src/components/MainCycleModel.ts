import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export interface MainCycleHotspot {
  id: string;
  title: string;
  category: string;
  description: string;
  specs: string;
  position: [number, number, number];
}

export interface MainCycleMaterials {
  Parts: THREE.MeshStandardMaterial;
  CrankDamper: THREE.MeshStandardMaterial;
  Fork: THREE.MeshStandardMaterial;
  BarsSeatPedals: THREE.MeshStandardMaterial;
  Frame: THREE.MeshStandardMaterial;
  FrameBlack: THREE.MeshStandardMaterial;
  Wheels: THREE.MeshStandardMaterial;
  Tires: THREE.MeshStandardMaterial;
}

export interface MainCycleInstance {
  bikeGroup: THREE.Group;
  wheelFGroup: THREE.Group;
  wheelRGroup: THREE.Group;
  cranksGroup: THREE.Group;
  materials: MainCycleMaterials;
  nodes: Record<string, THREE.Object3D>;
  isGlbLoaded: boolean;
  modelStatus: string;
  updateAccentColor: (color: string) => void;
  setWireframe: (wireframe: boolean) => void;
  spinWheels: (deltaZ: number) => void;
  spinCranks: (deltaZ: number) => void;
  hotspots: MainCycleHotspot[];
  loadGlbFromUrl: (url: string) => Promise<boolean>;
  loadGlbFromBuffer: (buffer: ArrayBuffer, fileName?: string) => Promise<boolean>;
}

// Interactive Hotspot Telemetry
export const MAIN_CYCLE_HOTSPOTS: MainCycleHotspot[] = [
  {
    id: 'frame-geo',
    title: 'Hydroformed Frame Triangle',
    category: 'CHASSIS & GEOMETRY',
    description: 'Aircraft-grade 6061-T6 alloy frame (FrameL, FrameM, FrameBu, FrameBl) optimized for aggressive enduro descent and structural rigidity.',
    specs: '6061-T6 Double Butted Alloy • 148x12mm Boost',
    position: [0.1, 0.45, 0],
  },
  {
    id: 'rear-shock',
    title: 'Rear Coil Damper & Spring Linkage',
    category: 'SUSPENSION ARCHITECTURE',
    description: 'Precision four-bar linkage damper system (DamperT, DamperB, Spring) absorbing 160mm of high-speed trail chatter with hydraulic rebound control.',
    specs: '160mm Travel • Metric 205x65 Trunnion',
    position: [-0.35, 0.25, 0],
  },
  {
    id: 'front-fork',
    title: 'Inverted Suspension Fork & Crown',
    category: 'FRONT STANCHIONS',
    description: 'Dual-stanchion alloy suspension fork (ForkL, ForkUBars) with direct-mount handlebar integration and high-speed compression damping.',
    specs: '36mm Stanchions • 160mm Air Travel • Boost 110x15',
    position: [1.3, 0.65, 0],
  },
  {
    id: 'drivetrain',
    title: 'Cranks, Chain & Shadow Derailleur',
    category: 'DRIVETRAIN GROUPSET',
    description: 'Hollow-forged alloy crank arms, narrow-wide chainring, reinforced chain links, and 3-stage derailleur cage (Derailleur 001/002).',
    specs: '1x12 Speed Wide-Ratio • 170mm Crank Arms',
    position: [-0.9, -0.35, 0.15],
  },
  {
    id: 'wheelset',
    title: 'Reinforced Wheels & High-Traction Tires',
    category: 'ROLLING CHASSIS',
    description: 'Tubeless-ready alloy double-wall rims (wheelF_1, wheelR_1) wrapped in dual-compound aggressive knobby tires (wheelF_2, wheelR_2).',
    specs: '29" Front / 27.5" Rear Mullet • 2.6" Knobby Tread',
    position: [1.45, -0.4, 0],
  },
];

/**
 * Creates default material set matching the gltfjsx declaration
 */
function createDefaultMaterials(accentColor: string): MainCycleMaterials {
  return {
    Frame: new THREE.MeshStandardMaterial({
      color: new THREE.Color(accentColor),
      metalness: 0.55,
      roughness: 0.3,
    }),
    FrameBlack: new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x151618),
      metalness: 0.35,
      roughness: 0.45,
    }),
    Parts: new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x9ca3af),
      metalness: 0.85,
      roughness: 0.25,
    }),
    CrankDamper: new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x2d3139),
      metalness: 0.75,
      roughness: 0.35,
    }),
    Fork: new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x18191c),
      metalness: 0.65,
      roughness: 0.35,
    }),
    BarsSeatPedals: new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x1a1c1e),
      roughness: 0.7,
      metalness: 0.2,
    }),
    Wheels: new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x111214),
      metalness: 0.8,
      roughness: 0.3,
    }),
    Tires: new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x1c1e22),
      roughness: 0.9,
      metalness: 0.05,
    }),
  };
}

/**
 * Procedural Fallback Geometry Builder
 * Generates the EXACT nodes and hierarchy when Main Cycle.glb is loading or not yet cached
 */
function buildProceduralGeometryTree(materials: MainCycleMaterials) {
  const nodes: Record<string, THREE.Object3D> = {};

  // Wheel Front (wheelF_1 Wheels, wheelF_2 Tires, wheelF_3 Parts)
  const wheelFGroup = new THREE.Group();
  wheelFGroup.position.set(1.45, 0, 0);

  const wheelFRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.85, 0.035, 16, 48),
    materials.Wheels
  );
  const wheelFTire = new THREE.Mesh(
    new THREE.TorusGeometry(0.96, 0.095, 20, 54),
    materials.Tires
  );
  const wheelFDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.28, 0.02, 32),
    materials.Parts
  );
  wheelFDisc.rotation.z = Math.PI / 2;

  // 16 Spokes
  const fSpokes = new THREE.Group();
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.85, 6), materials.Parts);
    spoke.position.set(Math.cos(angle) * 0.42, Math.sin(angle) * 0.42, 0);
    spoke.rotation.z = angle + Math.PI / 2;
    fSpokes.add(spoke);
  }

  nodes['wheelF_1'] = wheelFRim;
  nodes['wheelF_2'] = wheelFTire;
  nodes['wheelF_3'] = wheelFDisc;

  wheelFGroup.add(wheelFRim, wheelFTire, wheelFDisc, fSpokes);

  // Wheel Rear (wheelR_1 Wheels, wheelR_2 Tires, wheelR_3 Parts)
  const wheelRGroup = new THREE.Group();
  wheelRGroup.position.set(-1.45, 0, 0);

  const wheelRRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.85, 0.035, 16, 48),
    materials.Wheels
  );
  const wheelRTire = new THREE.Mesh(
    new THREE.TorusGeometry(0.96, 0.095, 20, 54),
    materials.Tires
  );
  const wheelRDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.28, 0.02, 32),
    materials.Parts
  );
  wheelRDisc.rotation.z = Math.PI / 2;

  const rSpokes = new THREE.Group();
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.85, 6), materials.Parts);
    spoke.position.set(Math.cos(angle) * 0.42, Math.sin(angle) * 0.42, 0);
    spoke.rotation.z = angle + Math.PI / 2;
    rSpokes.add(spoke);
  }

  nodes['wheelR_1'] = wheelRRim;
  nodes['wheelR_2'] = wheelRTire;
  nodes['wheelR_3'] = wheelRDisc;

  wheelRGroup.add(wheelRRim, wheelRTire, wheelRDisc, rSpokes);

  // Fork & Handlebars
  const forkUBars = new THREE.Group();
  const forkUBars_1 = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 1.4, 16), materials.Fork);
  forkUBars_1.position.set(1.15, 0.65, 0);
  forkUBars_1.rotation.z = -0.32;

  const forkUBars_2 = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.88, 16), materials.BarsSeatPedals);
  forkUBars_2.position.set(0.95, 1.25, 0);
  forkUBars_2.rotation.x = Math.PI / 2;

  const forkUBars_3 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.16), materials.Parts);
  forkUBars_3.position.set(0.98, 1.22, 0);

  nodes['ForkUBars_1'] = forkUBars_1;
  nodes['ForkUBars_2'] = forkUBars_2;
  nodes['ForkUBars_3'] = forkUBars_3;
  forkUBars.add(forkUBars_1, forkUBars_2, forkUBars_3);

  // Lower Fork
  const forkL = new THREE.Group();
  const forkL_1 = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.85, 16), materials.Fork);
  forkL_1.position.set(1.3, 0.25, 0);
  forkL_1.rotation.z = -0.32;

  const forkL_2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.14), materials.Parts);
  forkL_2.position.set(1.45, -0.05, 0);

  nodes['ForkL_1'] = forkL_1;
  nodes['ForkL_2'] = forkL_2;
  forkL.add(forkL_1, forkL_2);

  // Frame Components
  const frameL = new THREE.Group();
  // Down Tube (FrameL_1: Frame, FrameL_2: FrameBlack, FrameL_3: Parts)
  const frameL_1 = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.16, 0.13), materials.Frame);
  frameL_1.position.set(0.42, 0.45, 0);
  frameL_1.rotation.z = 0.58;

  const frameL_2 = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.14, 0.14), materials.FrameBlack);
  frameL_2.position.set(0.38, 0.45, 0);
  frameL_2.rotation.z = 0.58;

  const frameL_3 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.2, 16), materials.Parts);
  frameL_3.position.set(0.9, 1.05, 0);
  frameL_3.rotation.z = -0.32;

  nodes['FrameL_1'] = frameL_1;
  nodes['FrameL_2'] = frameL_2;
  nodes['FrameL_3'] = frameL_3;
  frameL.add(frameL_1, frameL_2, frameL_3);

  // Top Tube & Seat Tube (FrameM)
  const frameM = new THREE.Group();
  const frameM_1 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.25, 16), materials.Frame);
  frameM_1.position.set(0.25, 0.95, 0);
  frameM_1.rotation.z = -0.18;

  const frameM_2 = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.95, 16), materials.Parts);
  frameM_2.position.set(-0.35, 0.55, 0);
  frameM_2.rotation.z = 0.32;

  nodes['FrameM_1'] = frameM_1;
  nodes['FrameM_2'] = frameM_2;
  frameM.add(frameM_1, frameM_2);

  // Rear Triangle (FrameBu, FrameBl)
  const frameBu = new THREE.Group();
  const frameBu_1 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.25, 14), materials.Frame);
  frameBu_1.position.set(-0.9, 0.45, 0);
  frameBu_1.rotation.z = -0.58;

  const frameBu_2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.12), materials.Parts);
  frameBu_2.position.set(-1.42, 0.02, 0);

  nodes['FrameBu_1'] = frameBu_1;
  nodes['FrameBu_2'] = frameBu_2;
  frameBu.add(frameBu_1, frameBu_2);

  const frameBl = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.4, 14), materials.Frame);
  frameBl.position.set(-0.75, -0.05, 0);
  frameBl.rotation.z = 0.06;
  nodes['FrameBl'] = frameBl;

  // Damper, Spring & Shock
  const damperT = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.28, 16), materials.CrankDamper);
  damperT.position.set(-0.32, 0.48, 0);
  damperT.rotation.z = 0.5;

  const damperB = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.3, 16), materials.CrankDamper);
  damperB.position.set(-0.42, 0.32, 0);
  damperB.rotation.z = 0.5;

  const spring = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.018, 12, 32), materials.CrankDamper);
  spring.position.set(-0.37, 0.4, 0);
  spring.rotation.y = Math.PI / 2;

  nodes['DamperT'] = damperT;
  nodes['DamperB'] = damperB;
  nodes['Spring'] = spring;

  // Cranks, Pedals & Chain
  const cranksGroup = new THREE.Group();
  cranksGroup.position.set(0, -0.12, 0);

  const chainring = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.015, 24), materials.Parts);
  chainring.rotation.z = Math.PI / 2;

  const crankArmL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.3, 0.025), materials.CrankDamper);
  crankArmL.position.set(0, 0.12, 0.12);

  const crankArmR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.3, 0.025), materials.CrankDamper);
  crankArmR.position.set(0, -0.12, -0.12);

  const pedalL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.14), materials.BarsSeatPedals);
  pedalL.position.set(0, 0.25, 0.15);

  const pedalR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.14), materials.BarsSeatPedals);
  pedalR.position.set(0, -0.25, -0.15);

  nodes['Cranks'] = cranksGroup;
  nodes['PedalL'] = pedalL;
  nodes['PedalR'] = pedalR;
  cranksGroup.add(chainring, crankArmL, crankArmR, pedalL, pedalR);

  // Chain & Derailleurs
  const chain = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.014, 8, 36), materials.Parts);
  chain.position.set(-0.7, -0.08, 0.08);
  chain.scale.set(2.1, 0.38, 1);
  nodes['Chain'] = chain;

  const derailleur = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.12, 0.05), materials.Parts);
  derailleur.position.set(-1.42, -0.18, 0.1);
  const derailleur001 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 12), materials.Parts);
  derailleur001.position.set(-1.42, -0.24, 0.1);
  const derailleur002 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 12), materials.Parts);
  derailleur002.position.set(-1.38, -0.32, 0.1);

  nodes['Derailleur'] = derailleur;
  nodes['Derailleur001'] = derailleur001;
  nodes['Derailleur002'] = derailleur002;

  // Seat / Saddle
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.08, 0.22), materials.BarsSeatPedals);
  seat.position.set(-0.52, 1.05, 0);
  nodes['Seat'] = seat;

  // Cables (Line1, Line2)
  const line1 = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 1.8, 8), materials.BarsSeatPedals);
  line1.position.set(0.3, 0.75, 0.06);
  line1.rotation.z = 0.52;

  const line2 = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 1.6, 8), materials.BarsSeatPedals);
  line2.position.set(-0.2, 0.45, 0.06);
  line2.rotation.z = -0.32;

  nodes['Line1'] = line1;
  nodes['Line2'] = line2;

  // Assemble into root group
  const root = new THREE.Group();
  root.add(
    wheelFGroup,
    wheelRGroup,
    forkUBars,
    forkL,
    frameL,
    frameM,
    frameBu,
    frameBl,
    damperT,
    damperB,
    spring,
    cranksGroup,
    chain,
    derailleur,
    derailleur001,
    derailleur002,
    seat,
    line1,
    line2
  );

  return { root, nodes, wheelFGroup, wheelRGroup, cranksGroup };
}

/**
 * Builds the Main Cycle 3D Model adhering to the gltfjsx declaration provided by user
 */
export function buildMainCycleModel(options: {
  accentColor?: string;
  wireframeMode?: boolean;
  isDarkMode?: boolean;
  onLoaded?: (status: string, isGlbActive?: boolean) => void;
}): MainCycleInstance {
  const { accentColor = '#ff5722', wireframeMode = false } = options;

  const bikeGroup = new THREE.Group();
  const materials = createDefaultMaterials(accentColor);

  let currentWheelF: THREE.Group;
  let currentWheelR: THREE.Group;
  let currentCranks: THREE.Group;
  let currentNodes: Record<string, THREE.Object3D> = {};
  let isGlbActive = false;
  let currentStatus = 'Initializing Model...';

  // Build the baseline procedural model matching the exact node names & structure
  const procedural = buildProceduralGeometryTree(materials);
  currentWheelF = procedural.wheelFGroup;
  currentWheelR = procedural.wheelRGroup;
  currentCranks = procedural.cranksGroup;
  currentNodes = procedural.nodes;
  bikeGroup.add(procedural.root);

  // Wireframe helper
  const applyWireframe = (wireframe: boolean) => {
    Object.values(materials).forEach((mat) => {
      mat.wireframe = wireframe;
    });
  };
  applyWireframe(wireframeMode);

  // Update accent color on materials.Frame
  const updateAccent = (color: string) => {
    materials.Frame.color.set(color);
  };

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');

  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);

  /**
   * Mounts a parsed GLTF scene into bikeGroup adhering to the gltfjsx user specifications:
   * Maps nodes.Chain, nodes.Cranks, nodes.DamperB, nodes.DamperT, nodes.Derailleur, nodes.ForkL,
   * nodes.ForkUBars, nodes.FrameBl, nodes.FrameBu, nodes.FrameL, nodes.FrameM, nodes.Line,
   * nodes.Pedal, nodes.Seat, nodes.Spring, nodes.wheelF, nodes.wheelR to castShadow & receiveShadow.
   */
  const mountParsedGltf = (gltfScene: THREE.Group) => {
    console.log('[MainCycleModel] Mounting GLTF model:', gltfScene);

    // Clear procedural geometry
    while (bikeGroup.children.length > 0) {
      bikeGroup.remove(bikeGroup.children[0]);
    }

    const glbNodes: Record<string, THREE.Object3D> = {};

    gltfScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (mesh.name) {
          glbNodes[mesh.name] = mesh;
        }

        // Apply dynamic color control if this is part of the Frame
        if (mesh.name.toLowerCase().includes('frame') && !mesh.name.toLowerCase().includes('black')) {
          mesh.material = materials.Frame;
        }
      }
    });

    // Auto-normalize bounding box so model fits in viewport perfectly
    const box = new THREE.Box3().setFromObject(gltfScene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const targetScale = maxDim > 0 ? 3.4 / maxDim : 1.0;
    gltfScene.scale.set(targetScale, targetScale, targetScale);

    // Center pivot
    gltfScene.position.x = -center.x * targetScale;
    gltfScene.position.y = -center.y * targetScale + 0.15;
    gltfScene.position.z = -center.z * targetScale;

    bikeGroup.add(gltfScene);

    // Find wheel nodes or groups
    let foundWheelF: THREE.Group | null = null;
    let foundWheelR: THREE.Group | null = null;
    let foundCranks: THREE.Group | null = null;

    gltfScene.traverse((obj) => {
      const lower = obj.name.toLowerCase();
      if ((lower.includes('wheelf') || lower.includes('frontwheel') || lower.includes('wheel_f')) && !foundWheelF) {
        foundWheelF = obj as THREE.Group;
      }
      if ((lower.includes('wheelr') || lower.includes('rearwheel') || lower.includes('wheel_r')) && !foundWheelR) {
        foundWheelR = obj as THREE.Group;
      }
      if ((lower.includes('crank') || lower.includes('pedal')) && !foundCranks) {
        foundCranks = obj as THREE.Group;
      }
    });

    const wrapWithCenterPivot = (obj: THREE.Object3D) => {
      const box = new THREE.Box3().setFromObject(obj);
      const center = new THREE.Vector3();
      box.getCenter(center);
      
      if (obj.parent) {
        obj.parent.worldToLocal(center);
      }
      
      const wrapper = new THREE.Group();
      wrapper.name = obj.name + '_PivotWrapper';
      wrapper.position.copy(center);
      
      const oldPos = obj.position.clone();
      
      if (obj.parent) {
        obj.parent.add(wrapper);
      }
      wrapper.add(obj);
      obj.position.subVectors(oldPos, center);
      
      return wrapper;
    };

    if (foundWheelF) currentWheelF = wrapWithCenterPivot(foundWheelF);
    if (foundWheelR) currentWheelR = wrapWithCenterPivot(foundWheelR);
    if (foundCranks) currentCranks = wrapWithCenterPivot(foundCranks);

    currentNodes = glbNodes;
    isGlbActive = true;
    currentStatus = 'Main Cycle.glb Loaded Active';
    options.onLoaded?.(currentStatus, true);
  };

  /**
   * Load from ArrayBuffer (e.g. from Drag & Drop or File Upload)
   */
  const loadGlbFromBuffer = async (buffer: ArrayBuffer, fileName: string = 'Main Cycle.glb'): Promise<boolean> => {
    return new Promise((resolve) => {
      currentStatus = `Parsing ${fileName}...`;
      options.onLoaded?.(currentStatus, isGlbActive);

      gltfLoader.parse(
        buffer,
        '',
        (gltf) => {
          mountParsedGltf(gltf.scene);
          resolve(true);
        },
        (err) => {
          console.error('[MainCycleModel] GLTF Buffer parse error:', err);
          currentStatus = `Failed to parse ${fileName}`;
          options.onLoaded?.(currentStatus, isGlbActive);
          resolve(false);
        }
      );
    });
  };

  /**
   * Load from URL with robust check
   */
  const loadGlbFromUrl = async (url: string): Promise<boolean> => {
    try {
      currentStatus = `Checking ${url}...`;
      options.onLoaded?.(currentStatus, isGlbActive);

      // Verify URL first to prevent HTML SPA JSON parse syntax error
      const check = await fetch(url, { method: 'HEAD' });
      const contentType = check.headers.get('content-type') || '';

      if (!check.ok || contentType.includes('text/html')) {
        console.log(`[MainCycleModel] File '${url}' not found or returned html. Keeping high-fidelity procedural replica active.`);
        currentStatus = 'Ready for Main Cycle.glb (Procedural active)';
        options.onLoaded?.(currentStatus, false);
        return false;
      }

      currentStatus = `Downloading ${url}...`;
      options.onLoaded?.(currentStatus, isGlbActive);

      return new Promise((resolve) => {
        gltfLoader.load(
          url,
          (gltf) => {
            mountParsedGltf(gltf.scene);
            resolve(true);
          },
          (progress) => {
            if (progress.total > 0) {
              const pct = Math.round((progress.loaded / progress.total) * 100);
              currentStatus = `Loading ${pct}%`;
              options.onLoaded?.(currentStatus, isGlbActive);
            }
          },
          (err) => {
            console.warn(`[MainCycleModel] GLTF load error for ${url}:`, err);
            currentStatus = 'Procedural model active (Drop Main Cycle.glb to load)';
            options.onLoaded?.(currentStatus, false);
            resolve(false);
          }
        );
      });
    } catch (err) {
      console.warn('[MainCycleModel] Fetch check failed:', err);
      currentStatus = 'Procedural model active';
      options.onLoaded?.(currentStatus, false);
      return false;
    }
  };

  // Attempt to load /Main Cycle.glb deferred to avoid TDZ in caller
  setTimeout(() => {
    loadGlbFromUrl('/Main Cycle.glb');
  }, 0);

  return {
    bikeGroup,
    get wheelFGroup() {
      return currentWheelF;
    },
    get wheelRGroup() {
      return currentWheelR;
    },
    get cranksGroup() {
      return currentCranks;
    },
    materials,
    get nodes() {
      return currentNodes;
    },
    get isGlbLoaded() {
      return isGlbActive;
    },
    get modelStatus() {
      return currentStatus;
    },
    updateAccentColor: updateAccent,
    setWireframe: applyWireframe,
    spinWheels: (delta: number) => {
      if (currentWheelF) currentWheelF.rotation.x -= delta;
      if (currentWheelR) currentWheelR.rotation.x -= delta;
    },
    spinCranks: (delta: number) => {
      if (currentCranks) currentCranks.rotation.x -= delta;
    },
    hotspots: MAIN_CYCLE_HOTSPOTS,
    loadGlbFromUrl,
    loadGlbFromBuffer,
  };
}
