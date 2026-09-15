import * as THREE from 'three';

export interface EBikeBuildOptions {
  accentColor?: string;
  wireframeMode?: boolean;
  isDarkMode?: boolean;
  showHeadlight?: boolean;
}

export interface EBikeHotspot {
  id: string;
  title: string;
  category: string;
  description: string;
  specs: string;
  position: [number, number, number];
}

export interface EBikeModelResult {
  bikeGroup: THREE.Group;
  frontWheel: THREE.Group;
  rearWheel: THREE.Group;
  pedalGroup: THREE.Group;
  headlightLight: THREE.SpotLight;
  headlightLens: THREE.Mesh;
  hotspots: EBikeHotspot[];
  materials: {
    frameMat: THREE.MeshStandardMaterial;
    accentMat: THREE.MeshStandardMaterial;
    chromeMat: THREE.MeshStandardMaterial;
    caliperMat: THREE.MeshStandardMaterial;
    tireMat: THREE.MeshStandardMaterial;
    rimMat: THREE.MeshStandardMaterial;
    saddleMat: THREE.MeshStandardMaterial;
  };
  updateAccentColor: (color: string) => void;
  setWireframe: (wireframe: boolean) => void;
  setHeadlight: (on: boolean) => void;
}

/**
 * Procedural texture generator for the handlebar LCD digital dashboard
 */
function createLcdScreenTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Deep dark cyber-cockpit glass background
    ctx.fillStyle = '#06080b';
    ctx.fillRect(0, 0, 512, 256);

    // Bezel border glow
    ctx.strokeStyle = '#00ff66';
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, 496, 240);

    // Top Header: Brand & Mode
    ctx.fillStyle = '#ff5722';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('⚡ ECOWAY e-BIKE', 24, 38);

    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('PAS 5 • TURBO', 330, 38);

    // Horizontal Divider
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(24, 52);
    ctx.lineTo(488, 52);
    ctx.stroke();

    // Center Big Speed Readout
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 84px sans-serif';
    ctx.fillText('34', 28, 140);

    ctx.fillStyle = '#00ff66';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('KM/H', 140, 105);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('CURRENT VELOCITY', 140, 135);

    // Battery Indicator (5 Segment Bars)
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('BATTERY: 92%', 310, 85);

    // 5 Battery blocks
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = i < 4 ? '#00ff66' : '#10e050';
      ctx.fillRect(310 + i * 32, 98, 26, 18);
    }
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(308, 96, 162, 22);

    // Bottom telemetry row
    ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('TRIP: 18.4 KM', 24, 195);

    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('EST. RANGE: 62 KM', 260, 195);

    ctx.fillStyle = '#64748b';
    ctx.font = '14px monospace';
    ctx.fillText('MOTOR TORQUE: 75 Nm • 48V 750W PEAK', 24, 230);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Creates high-fidelity 3D E-Bike model matching the uploaded electric mountain bike
 */
export function buildEBikeModel(options: EBikeBuildOptions = {}): EBikeModelResult {
  const {
    accentColor = '#ff5722', // Iconic sports orange from the image
    wireframeMode = false,
    isDarkMode = true,
    showHeadlight = true,
  } = options;

  const bikeGroup = new THREE.Group();

  // === MATERIALS ===
  // Deep Satin Charcoal / Matte Black for the main hydroformed chassis
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x18191c,
    roughness: 0.42,
    metalness: 0.65,
    wireframe: wireframeMode,
  });

  // Dynamic Neon/Sports Orange racing stripes & accent decals matching the image
  const accentMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(accentColor).getHex(),
    roughness: 0.28,
    metalness: 0.45,
    emissive: new THREE.Color(accentColor).getHex(),
    emissiveIntensity: 0.28,
    wireframe: wireframeMode,
  });

  // Polished Chrome / Silver Alloy for suspension stanchions, damper shaft, brake rotors
  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xe6ebf2,
    roughness: 0.1,
    metalness: 0.95,
    wireframe: wireframeMode,
  });

  // Drilled Stainless Steel Brake Rotor Material
  const rotorMat = new THREE.MeshStandardMaterial({
    color: 0xd0d7de,
    roughness: 0.18,
    metalness: 0.92,
    wireframe: wireframeMode,
  });

  // High-performance Red Sport Calipers
  const caliperMat = new THREE.MeshStandardMaterial({
    color: 0xd32f2f,
    roughness: 0.35,
    metalness: 0.7,
    wireframe: wireframeMode,
  });

  // Heavy-duty Rugged Mountain Bike Tire Rubber
  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x111215,
    roughness: 0.88,
    metalness: 0.05,
    wireframe: wireframeMode,
  });

  // Black Double-Wall Alloy Rim
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x1f2126,
    roughness: 0.35,
    metalness: 0.8,
    wireframe: wireframeMode,
  });

  // Contoured Sport Saddle Foam & Leatherette
  const saddleMat = new THREE.MeshStandardMaterial({
    color: 0x141517,
    roughness: 0.75,
    metalness: 0.1,
    wireframe: wireframeMode,
  });

  // Textured Handlebar Grip Rubber
  const gripMat = new THREE.MeshStandardMaterial({
    color: 0x0c0d0f,
    roughness: 0.95,
    metalness: 0.05,
    wireframe: wireframeMode,
  });

  // Amber Safety Reflector (Pedals)
  const amberReflectorMat = new THREE.MeshStandardMaterial({
    color: 0xff9100,
    emissive: 0xff6d00,
    emissiveIntensity: 0.4,
    roughness: 0.25,
    metalness: 0.2,
    wireframe: wireframeMode,
  });

  // White Spoke Reflector (Front Wheel Clip)
  const whiteReflectorMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xdddddd,
    emissiveIntensity: 0.3,
    roughness: 0.25,
    metalness: 0.2,
    wireframe: wireframeMode,
  });

  // Projector Headlight Lens & Bezel
  const headlightLensMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: showHeadlight ? 2.2 : 0.2,
    roughness: 0.05,
    metalness: 0.1,
    transparent: true,
    opacity: 0.95,
    wireframe: wireframeMode,
  });

  // LCD HUD Material with canvas texture
  const lcdTexture = createLcdScreenTexture();
  const lcdMat = new THREE.MeshBasicMaterial({
    map: lcdTexture,
    wireframe: wireframeMode,
  });

  // Helper to build a cylinder connecting two 3D points
  function createTube(
    p1: [number, number, number],
    p2: [number, number, number],
    radius = 0.05,
    material: THREE.Material = frameMat
  ): THREE.Mesh {
    const v1 = new THREE.Vector3(...p1);
    const v2 = new THREE.Vector3(...p2);
    const distance = v1.distanceTo(v2);
    const geo = new THREE.CylinderGeometry(radius, radius, distance, 16);
    const mesh = new THREE.Mesh(geo, material);

    const midPoint = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
    mesh.position.copy(midPoint);

    const dir = new THREE.Vector3().subVectors(v2, v1).normalize();
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    return mesh;
  }

  // === DISC BRAKE ASSEMBLY (FRONT & REAR) ===
  function createDiscBrakeAssembly(isFront: boolean): THREE.Group {
    const brakeGroup = new THREE.Group();

    // Drilled Brake Rotor Disc
    const rotorGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.012, 32);
    rotorGeo.rotateX(Math.PI / 2);
    const rotor = new THREE.Mesh(rotorGeo, rotorMat);
    brakeGroup.add(rotor);

    // Inner rotor cutout spiders / carrier
    for (let i = 0; i < 6; i++) {
      const armAngle = (i / 6) * Math.PI * 2;
      const spiderArm = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.28, 0.014),
        frameMat
      );
      spiderArm.position.set(Math.cos(armAngle) * 0.22, Math.sin(armAngle) * 0.22, 0);
      spiderArm.rotation.z = armAngle + Math.PI / 2;
      brakeGroup.add(spiderArm);
    }

    // Drilled Rotor Perforation Vent Rings (simulated with circular vent accents)
    for (let i = 0; i < 12; i++) {
      const ventAngle = (i / 12) * Math.PI * 2;
      const ventDot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.016, 0.016, 0.016, 8),
        frameMat
      );
      ventDot.rotateX(Math.PI / 2);
      ventDot.position.set(Math.cos(ventAngle) * 0.38, Math.sin(ventAngle) * 0.38, 0);
      brakeGroup.add(ventDot);
    }

    // Red Sport Brake Caliper
    const caliperBody = new THREE.Group();
    const caliperHousing = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.16, 0.09),
      caliperMat
    );
    caliperBody.add(caliperHousing);

    // Caliper mounting bolts
    const bolt1 = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.11, 8), chromeMat);
    bolt1.rotateX(Math.PI / 2);
    bolt1.position.set(0.05, 0.05, 0);
    caliperBody.add(bolt1);

    const bolt2 = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.11, 8), chromeMat);
    bolt2.rotateX(Math.PI / 2);
    bolt2.position.set(-0.05, -0.05, 0);
    caliperBody.add(bolt2);

    // Position caliper at rotor edge
    const caliperAngle = isFront ? Math.PI * 0.65 : Math.PI * 0.35;
    caliperBody.position.set(
      Math.cos(caliperAngle) * 0.44,
      Math.sin(caliperAngle) * 0.44,
      0
    );
    caliperBody.rotation.z = caliperAngle - Math.PI / 2;
    brakeGroup.add(caliperBody);

    return brakeGroup;
  }

  // === WHEEL ASSEMBLY (FAT TIRE WITH KNOBBY TREADS, DOUBLE-WALL RIM, MOTOR HUB) ===
  function createWheel(isRear = false): THREE.Group {
    const wheelGroup = new THREE.Group();

    // 1. Fat Mountain Bike Tire (Deep Torus)
    const tireGeo = new THREE.TorusGeometry(1.24, 0.22, 22, 54);
    const tire = new THREE.Mesh(tireGeo, tireMat);
    wheelGroup.add(tire);

    // 2. Knobby Tire Tread Blocks (Authentic off-road e-MTB knobby lugs matching the image)
    const lugCount = 38;
    for (let i = 0; i < lugCount; i++) {
      const angle = (i / lugCount) * Math.PI * 2;
      const r = 1.45;

      // Center knob
      const centerLug = new THREE.Mesh(
        new THREE.BoxGeometry(0.07, 0.06, 0.14),
        tireMat
      );
      centerLug.position.set(Math.cos(angle) * r, Math.sin(angle) * r, 0);
      centerLug.rotation.z = angle;
      wheelGroup.add(centerLug);

      // Left shoulder aggressive cornering block
      const leftLug = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.05, 0.08),
        tireMat
      );
      leftLug.position.set(Math.cos(angle + 0.04) * (r - 0.03), Math.sin(angle + 0.04) * (r - 0.03), 0.14);
      leftLug.rotation.z = angle;
      leftLug.rotation.x = 0.2;
      wheelGroup.add(leftLug);

      // Right shoulder aggressive cornering block
      const rightLug = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.05, 0.08),
        tireMat
      );
      rightLug.position.set(Math.cos(angle - 0.04) * (r - 0.03), Math.sin(angle - 0.04) * (r - 0.03), -0.14);
      rightLug.rotation.z = angle;
      rightLug.rotation.x = -0.2;
      wheelGroup.add(rightLug);
    }

    // 3. Matte Black Double-Wall Alloy Rim
    const rimGeo = new THREE.TorusGeometry(1.12, 0.042, 16, 54);
    const rim = new THREE.Mesh(rimGeo, rimMat);
    wheelGroup.add(rim);

    // Inner rim wall flange
    const innerRimGeo = new THREE.TorusGeometry(1.05, 0.02, 12, 48);
    const innerRim = new THREE.Mesh(innerRimGeo, rimMat);
    wheelGroup.add(innerRim);

    // 4. Hub & Motor
    if (isRear) {
      // Rear High-Torque Electric Hub Motor (as shown in the image with wide motor casing)
      const motorGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.32, 28);
      motorGeo.rotateX(Math.PI / 2);
      const motor = new THREE.Mesh(motorGeo, frameMat);
      wheelGroup.add(motor);

      // Motor side-cover plates with accent ring
      const motorCoverGeo = new THREE.CylinderGeometry(0.39, 0.39, 0.02, 28);
      motorCoverGeo.rotateX(Math.PI / 2);
      const motorCover = new THREE.Mesh(motorCoverGeo, rimMat);
      wheelGroup.add(motorCover);

      // Rear 7-Speed Gear Cassette (Drive side, z = 0.16)
      const cassetteGroup = new THREE.Group();
      cassetteGroup.position.set(0, 0, 0.18);
      for (let s = 0; s < 5; s++) {
        const cogRadius = 0.26 - s * 0.035;
        const cog = new THREE.Mesh(
          new THREE.CylinderGeometry(cogRadius, cogRadius, 0.016, 20),
          chromeMat
        );
        cog.rotateX(Math.PI / 2);
        cog.position.set(0, 0, s * 0.02);
        cassetteGroup.add(cog);
      }
      wheelGroup.add(cassetteGroup);
    } else {
      // Front Alloy QR Hub
      const frontHubGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.28, 16);
      frontHubGeo.rotateX(Math.PI / 2);
      const frontHub = new THREE.Mesh(frontHubGeo, chromeMat);
      wheelGroup.add(frontHub);

      // Hub flanges
      const flangeGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.03, 16);
      flangeGeo.rotateX(Math.PI / 2);
      const leftFlange = new THREE.Mesh(flangeGeo, frameMat);
      leftFlange.position.set(0, 0, 0.11);
      const rightFlange = new THREE.Mesh(flangeGeo, frameMat);
      rightFlange.position.set(0, 0, -0.11);
      wheelGroup.add(leftFlange);
      wheelGroup.add(rightFlange);

      // Front Wheel Spoke Reflector (White diamond clip reflector visible in image!)
      const reflectorGroup = new THREE.Group();
      const reflectorBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.08, 0.028),
        whiteReflectorMat
      );
      reflectorGroup.add(reflectorBody);
      reflectorGroup.position.set(0.65, 0.35, 0.05);
      reflectorGroup.rotation.z = 0.45;
      wheelGroup.add(reflectorGroup);
    }

    // 5. Stainless Steel Laced Spokes (Cross pattern on left and right hub flanges)
    const spokeCount = 28;
    for (let i = 0; i < spokeCount; i++) {
      const angle = (i / spokeCount) * Math.PI * 2;
      const spokeGeo = new THREE.CylinderGeometry(0.007, 0.007, 2.15, 6);
      const spoke = new THREE.Mesh(spokeGeo, chromeMat);
      spoke.rotation.z = angle + (i % 2 === 0 ? 0.06 : -0.06);
      spoke.position.set(0, 0, (i % 2 === 0 ? 1 : -1) * 0.05);
      wheelGroup.add(spoke);
    }

    // 6. Disc Brake Rotor & Caliper
    const discBrake = createDiscBrakeAssembly(!isRear);
    discBrake.position.set(0, 0, -0.14); // Non-drive side
    wheelGroup.add(discBrake);

    return wheelGroup;
  }

  // Add wheels at exact wheelbase points matching the e-MTB image
  const rearWheel = createWheel(true);
  rearWheel.position.set(-2.05, 0, 0);
  bikeGroup.add(rearWheel);

  const frontWheel = createWheel(false);
  frontWheel.position.set(2.05, 0, 0);
  bikeGroup.add(frontWheel);

  // === KEY CHASSIS NODES & HARDPOINTS ===
  const rearAxle: [number, number, number] = [-2.05, 0, 0];
  const frontAxle: [number, number, number] = [2.05, 0, 0];
  const bottomBracket: [number, number, number] = [-0.25, -0.12, 0];
  const seatPostCollar: [number, number, number] = [-0.78, 1.28, 0];
  const headTubeBottom: [number, number, number] = [1.52, 0.86, 0];
  const headTubeTop: [number, number, number] = [1.32, 1.44, 0];
  const rockerPivot: [number, number, number] = [-0.68, 0.88, 0];
  const rearShockTop: [number, number, number] = [-0.48, 0.98, 0];
  const rearShockBottom: [number, number, number] = [-0.34, 0.38, 0];

  // === FRONT SUSPENSION FORK (SUSPENSION FORK WITH ARCH, STANCHIONS & CROWN) ===
  const forkGroup = new THREE.Group();

  // Dual Lower Stanchion Slider Tubes (Black)
  const leftLower = createTube([frontAxle[0], frontAxle[1], 0.17], [1.72, 0.52, 0.17], 0.052, frameMat);
  const rightLower = createTube([frontAxle[0], frontAxle[1], -0.17], [1.72, 0.52, -0.17], 0.052, frameMat);
  forkGroup.add(leftLower);
  forkGroup.add(rightLower);

  // Fork Stiffening Arch (Bridges the two lower fork legs over the fat tire)
  const archGeo = new THREE.TorusGeometry(0.24, 0.038, 12, 24, Math.PI);
  archGeo.rotateZ(Math.PI / 2);
  archGeo.rotateY(Math.PI / 2);
  const forkArch = new THREE.Mesh(archGeo, frameMat);
  forkArch.position.set(1.72, 0.52, 0);
  forkArch.rotation.z = -0.4;
  forkGroup.add(forkArch);

  // Upper Chrome Stanchions (Gleaming mirror-finish suspension tubes)
  const leftStanchion = createTube([1.70, 0.48, 0.17], [headTubeBottom[0], headTubeBottom[1], 0.17], 0.042, chromeMat);
  const rightStanchion = createTube([1.70, 0.48, -0.17], [headTubeBottom[0], headTubeBottom[1], -0.17], 0.042, chromeMat);
  forkGroup.add(leftStanchion);
  forkGroup.add(rightStanchion);

  // Heavy-duty Forged Fork Crown (Joining both stanchions to steerer tube)
  const crownGeo = new THREE.BoxGeometry(0.16, 0.09, 0.44);
  const forkCrown = new THREE.Mesh(crownGeo, frameMat);
  forkCrown.position.set(headTubeBottom[0], headTubeBottom[1], 0);
  forkCrown.rotation.z = -0.32;
  forkGroup.add(forkCrown);

  // Fork Preload & Lockout Adjustment Dials on top of crown
  const lockoutDial = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 0.025, 16),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.2 })
  );
  lockoutDial.position.set(headTubeBottom[0] + 0.02, headTubeBottom[1] + 0.06, 0.17);
  forkGroup.add(lockoutDial);

  const preloadDial = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 0.025, 16),
    new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.8, roughness: 0.2 })
  );
  preloadDial.position.set(headTubeBottom[0] + 0.02, headTubeBottom[1] + 0.06, -0.17);
  forkGroup.add(preloadDial);

  // Projector LED Headlight Assembly (Mounted on fork crown as seen in image)
  const headlightGroup = new THREE.Group();
  headlightGroup.position.set(headTubeBottom[0] + 0.16, headTubeBottom[1] + 0.05, 0);

  // Headlight bracket
  const headlightBracket = createTube([0, 0, 0], [-0.14, -0.05, 0], 0.025, frameMat);
  headlightGroup.add(headlightBracket);

  // Cylindrical black housing
  const lightHousingGeo = new THREE.CylinderGeometry(0.095, 0.08, 0.18, 20);
  lightHousingGeo.rotateZ(Math.PI / 2);
  const lightHousing = new THREE.Mesh(lightHousingGeo, frameMat);
  headlightGroup.add(lightHousing);

  // Front chrome bezel ring
  const lightBezelGeo = new THREE.TorusGeometry(0.095, 0.016, 12, 24);
  lightBezelGeo.rotateY(Math.PI / 2);
  const lightBezel = new THREE.Mesh(lightBezelGeo, chromeMat);
  lightBezel.position.set(0.09, 0, 0);
  headlightGroup.add(lightBezel);

  // Projector Convex Lens
  const lightLensGeo = new THREE.SphereGeometry(0.09, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  lightLensGeo.rotateZ(-Math.PI / 2);
  const lightLens = new THREE.Mesh(lightLensGeo, headlightLensMat);
  lightLens.position.set(0.08, 0, 0);
  headlightGroup.add(lightLens);

  // Active Three.js Spotlight for forward headlight beam
  const headlightSpot = new THREE.SpotLight(
    0xffffff,
    showHeadlight ? (isDarkMode ? 3.5 : 2.0) : 0,
    18,
    Math.PI / 6,
    0.4,
    1.2
  );
  headlightSpot.position.set(0.12, 0, 0);
  const spotTarget = new THREE.Object3D();
  spotTarget.position.set(6, -1.2, 0);
  headlightGroup.add(spotTarget);
  headlightSpot.target = spotTarget;
  headlightGroup.add(headlightSpot);

  forkGroup.add(headlightGroup);
  bikeGroup.add(forkGroup);

  // === HEAD TUBE ===
  const headTube = createTube(headTubeBottom, headTubeTop, 0.076, frameMat);
  bikeGroup.add(headTube);

  // Headset bearings (Upper and lower alloy rings)
  const lowerCup = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.03, 20), chromeMat);
  lowerCup.position.set(...headTubeBottom);
  const upperCup = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.03, 20), chromeMat);
  upperCup.position.set(...headTubeTop);
  bikeGroup.add(lowerCup);
  bikeGroup.add(upperCup);

  // === INTEGRATED BATTERY DOWN TUBE (KEY E-BIKE FEATURE FROM IMAGE) ===
  // Thick, angular, hydroformed box/pentagon tube housing the 48V battery pack
  const downTubeGroup = new THREE.Group();

  const dtLength = new THREE.Vector3(...headTubeBottom).distanceTo(new THREE.Vector3(...bottomBracket));
  const dtMid = new THREE.Vector3().addVectors(new THREE.Vector3(...headTubeBottom), new THREE.Vector3(...bottomBracket)).multiplyScalar(0.5);

  // Main Battery Down-Tube Housing
  const batteryGeo = new THREE.BoxGeometry(0.19, dtLength * 0.94, 0.26);
  const batteryBody = new THREE.Mesh(batteryGeo, frameMat);
  downTubeGroup.position.copy(dtMid);

  const dtDir = new THREE.Vector3().subVectors(new THREE.Vector3(...headTubeBottom), new THREE.Vector3(...bottomBracket)).normalize();
  downTubeGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dtDir);
  downTubeGroup.add(batteryBody);

  // Left & Right Sports Orange Decal Racing Stripes (as in image)
  const leftStripeGeo = new THREE.BoxGeometry(0.012, dtLength * 0.75, 0.06);
  const leftStripe = new THREE.Mesh(leftStripeGeo, accentMat);
  leftStripe.position.set(0.098, 0, 0.1);
  downTubeGroup.add(leftStripe);

  const rightStripe = new THREE.Mesh(leftStripeGeo, accentMat);
  rightStripe.position.set(-0.098, 0, 0.1);
  downTubeGroup.add(rightStripe);

  // Battery Status LED Indicator dots on the side of the battery
  for (let i = 0; i < 4; i++) {
    const ledDot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.02, 10),
      new THREE.MeshBasicMaterial({ color: i < 3 ? 0x00ff66 : 0xffcc00 })
    );
    ledDot.rotateZ(Math.PI / 2);
    ledDot.position.set(0.10, -0.3 + i * 0.07, 0.08);
    downTubeGroup.add(ledDot);
  }

  // Keyhole Lock Cylinder on Battery Casing
  const keyHole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 12), chromeMat);
  keyHole.rotateZ(Math.PI / 2);
  keyHole.position.set(0.10, 0.35, 0.08);
  downTubeGroup.add(keyHole);

  bikeGroup.add(downTubeGroup);

  // === SLOPING HYDROFORMED TOP TUBE ===
  // Arches slightly from head tube to seat junction, with vibrant orange racing stripe along top ridge
  const topTube = createTube(headTubeTop, [-0.65, 1.12, 0], 0.058, frameMat);
  bikeGroup.add(topTube);

  const topStripe = createTube(
    [headTubeTop[0] - 0.05, headTubeTop[1] + 0.04, 0],
    [-0.60, 1.16, 0],
    0.022,
    accentMat
  );
  bikeGroup.add(topStripe);

  // === SEAT TUBE & SEATPOST ===
  const seatTube = createTube(bottomBracket, seatPostCollar, 0.062, frameMat);
  bikeGroup.add(seatTube);

  // Anodized Quick-Release Seat Collar Clamp
  const collarGeo = new THREE.CylinderGeometry(0.074, 0.074, 0.06, 16);
  const seatCollar = new THREE.Mesh(collarGeo, accentMat);
  seatCollar.position.set(...seatPostCollar);
  bikeGroup.add(seatCollar);

  // Aluminum Seatpost
  const seatPost = createTube(seatPostCollar, [-0.85, 1.58, 0], 0.042, frameMat);
  bikeGroup.add(seatPost);

  // === REAR DUAL FULL SUSPENSION (SHOCK ABSORBER & ROCKER LINK) ===
  const suspensionGroup = new THREE.Group();

  // Rocker Link Arms (Dual CNC alloy plates connecting seat tube, top tube, and rear triangle)
  const leftRocker = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.08, 0.022), frameMat);
  leftRocker.position.set(-0.62, 0.98, 0.10);
  leftRocker.rotation.z = -0.38;
  suspensionGroup.add(leftRocker);

  const rightRocker = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.08, 0.022), frameMat);
  rightRocker.position.set(-0.62, 0.98, -0.10);
  rightRocker.rotation.z = -0.38;
  suspensionGroup.add(rightRocker);

  // Rocker pivot axle pins
  const pivotPin1 = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.24, 12), chromeMat);
  pivotPin1.rotateX(Math.PI / 2);
  pivotPin1.position.set(...rockerPivot);
  suspensionGroup.add(pivotPin1);

  // Rear Shock Absorber Unit (Damper Canister + Chrome Piston Rod + Rebound Knob)
  const shockBody = createTube(rearShockBottom, [-0.41, 0.68, 0], 0.054, frameMat);
  const shockPiston = createTube([-0.41, 0.68, 0], rearShockTop, 0.032, chromeMat);
  suspensionGroup.add(shockBody);
  suspensionGroup.add(shockPiston);

  // Shock reservoir canister / air sleeve accent
  const shockCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.06, 16), accentMat);
  shockCollar.position.set(-0.41, 0.66, 0);
  suspensionGroup.add(shockCollar);

  bikeGroup.add(suspensionGroup);

  // === REAR SWINGARM (CHAINSTAYS & SEATSTAYS) ===
  // Lower Chainstays (Connecting Bottom Bracket motor cradle to rear dropouts on both sides)
  const leftChainstay = createTube(bottomBracket, [rearAxle[0], rearAxle[1], 0.16], 0.046, frameMat);
  const rightChainstay = createTube(bottomBracket, [rearAxle[0], rearAxle[1], -0.16], 0.046, frameMat);
  bikeGroup.add(leftChainstay);
  bikeGroup.add(rightChainstay);

  // Upper Seatstays (Connecting rear dropouts up to the rocker link arms)
  const leftSeatstay = createTube([rearAxle[0], rearAxle[1], 0.16], [-0.52, 0.94, 0.10], 0.038, frameMat);
  const rightSeatstay = createTube([rearAxle[0], rearAxle[1], -0.16], [-0.52, 0.94, -0.10], 0.038, frameMat);
  bikeGroup.add(leftSeatstay);
  bikeGroup.add(rightSeatstay);

  // Seatstay Orange Accent Decals (matching "e-BIKE" badge on stays in image)
  const stayDecal = createTube([-1.35, 0.44, 0.16], [-1.05, 0.62, 0.12], 0.042, accentMat);
  bikeGroup.add(stayDecal);

  // === REAR KICKSTAND (KEY AUTHENTIC DETAIL FROM IMAGE) ===
  const kickstandGroup = new THREE.Group();
  kickstandGroup.position.set(-1.85, 0.02, -0.18);

  // Kickstand mounting clamp on chainstay
  const ksClamp = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.07, 0.08), frameMat);
  kickstandGroup.add(ksClamp);

  // Kickstand arm extending down to ground
  const ksArm = createTube([0, 0, 0], [0.18, -1.24, -0.32], 0.024, frameMat);
  kickstandGroup.add(ksArm);

  // Wide rubber footpad
  const ksFoot = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.03, 0.14), tireMat);
  ksFoot.position.set(0.18, -1.24, -0.32);
  kickstandGroup.add(ksFoot);

  bikeGroup.add(kickstandGroup);

  // === ERGONOMIC SPORT SADDLE ===
  const saddleGroup = new THREE.Group();
  saddleGroup.position.set(-0.90, 1.62, 0);
  saddleGroup.rotation.z = 0.08;

  // Dual under-seat steel rail springs
  const railGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.45, 8);
  railGeo.rotateX(Math.PI / 2);
  const leftRail = new THREE.Mesh(railGeo, chromeMat);
  leftRail.position.set(0, -0.06, 0.05);
  const rightRail = new THREE.Mesh(railGeo, chromeMat);
  rightRail.position.set(0, -0.06, -0.05);
  saddleGroup.add(leftRail);
  saddleGroup.add(rightRail);

  // Main contoured saddle shell
  const saddleNose = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.11, 0.15), saddleMat);
  saddleNose.position.set(0.08, 0, 0);
  saddleGroup.add(saddleNose);

  const saddleRear = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.13, 0.36), saddleMat);
  saddleRear.position.set(-0.20, 0.02, 0);
  saddleGroup.add(saddleRear);

  // Center pressure-relief channel cutout (aesthetic dark groove)
  const reliefGroove = new THREE.Mesh(
    new THREE.BoxGeometry(0.46, 0.03, 0.04),
    new THREE.MeshBasicMaterial({ color: 0x0a0b0d })
  );
  reliefGroove.position.set(-0.06, 0.08, 0);
  saddleGroup.add(reliefGroove);

  bikeGroup.add(saddleGroup);

  // === COCKPIT & HANDLEBAR ASSEMBLY ===
  const cockpitGroup = new THREE.Group();
  cockpitGroup.position.set(...headTubeTop);

  // Threadless Stem (Clamping steerer to handlebars)
  const stemBody = createTube([0, 0, 0], [0.18, 0.22, 0], 0.046, frameMat);
  cockpitGroup.add(stemBody);

  const stemFaceplate = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.12), chromeMat);
  stemFaceplate.position.set(0.18, 0.22, 0);
  cockpitGroup.add(stemFaceplate);

  // Mountain Riser Handlebars with slight rise and sweep
  const barCenter: [number, number, number] = [0.18, 0.22, 0];
  const barLeftEnd: [number, number, number] = [0.12, 0.26, 0.72];
  const barRightEnd: [number, number, number] = [0.12, 0.26, -0.72];

  const leftBar = createTube(barCenter, barLeftEnd, 0.032, frameMat);
  const rightBar = createTube(barCenter, barRightEnd, 0.032, frameMat);
  cockpitGroup.add(leftBar);
  cockpitGroup.add(rightBar);

  // Ergonomic Contoured Palm-Rest Grips with Lock Rings
  const leftGrip = createTube([0.14, 0.25, 0.52], barLeftEnd, 0.045, gripMat);
  const rightGrip = createTube([0.14, 0.25, -0.52], barRightEnd, 0.045, gripMat);
  cockpitGroup.add(leftGrip);
  cockpitGroup.add(rightGrip);

  // Lock-on grip collars (anodized orange rings)
  const leftCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.018, 16), accentMat);
  leftCollar.rotateX(Math.PI / 2);
  leftCollar.position.set(0.14, 0.25, 0.52);
  const rightCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.018, 16), accentMat);
  rightCollar.rotateX(Math.PI / 2);
  rightCollar.position.set(0.14, 0.25, -0.52);
  cockpitGroup.add(leftCollar);
  cockpitGroup.add(rightCollar);

  // Dual Aluminum Brake Levers
  const leftLever = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.04, 0.18), chromeMat);
  leftLever.position.set(0.24, 0.21, 0.44);
  leftLever.rotation.y = 0.25;
  cockpitGroup.add(leftLever);

  const rightLever = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.04, 0.18), chromeMat);
  rightLever.position.set(0.24, 0.21, -0.44);
  rightLever.rotation.y = -0.25;
  cockpitGroup.add(rightLever);

  // Center Digital LCD Instrument Console (Key E-Bike Cockpit Detail)
  const lcdConsole = new THREE.Group();
  lcdConsole.position.set(0.16, 0.32, 0);
  lcdConsole.rotation.x = -0.45; // Angled up toward rider's eyes

  // Console housing with mount bracket
  const lcdMount = createTube([0, -0.1, 0], [0, 0, 0], 0.024, frameMat);
  lcdConsole.add(lcdMount);

  const lcdHousing = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.04), frameMat);
  lcdConsole.add(lcdHousing);

  // Screen display face with digital graphics
  const lcdScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.20, 0.12), lcdMat);
  lcdScreen.position.set(0, 0, 0.022);
  lcdConsole.add(lcdScreen);

  cockpitGroup.add(lcdConsole);

  // Flexible Internal Routing Cable Conduits
  const frontBrakeCable = createTube([0.22, 0.20, 0.40], [0.85, 0.45, 0.12], 0.012, frameMat);
  const rearBrakeCable = createTube([0.22, 0.20, -0.40], [0.85, 0.45, -0.12], 0.012, frameMat);
  cockpitGroup.add(frontBrakeCable);
  cockpitGroup.add(rearBrakeCable);

  bikeGroup.add(cockpitGroup);

  // === DRIVETRAIN & CRANKSET ===
  const pedalGroup = new THREE.Group();
  pedalGroup.position.set(...bottomBracket);

  // Bottom Bracket Motor Housing
  const bbMotorGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.22, 20);
  bbMotorGeo.rotateX(Math.PI / 2);
  const bbMotor = new THREE.Mesh(bbMotorGeo, frameMat);
  pedalGroup.add(bbMotor);

  // Chainring (48T) with Outer Bash Guard Ring (Drive side, z = 0.13)
  const chainring = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.32, 0.016, 32),
    frameMat
  );
  chainring.rotateX(Math.PI / 2);
  chainring.position.set(0, 0, 0.13);
  pedalGroup.add(chainring);

  // Bash Guard Ring
  const bashGuard = new THREE.Mesh(
    new THREE.TorusGeometry(0.33, 0.018, 12, 32),
    accentMat
  );
  bashGuard.position.set(0, 0, 0.14);
  pedalGroup.add(bashGuard);

  // Left & Right Crank Arms
  const crank1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.32, 0.025), frameMat);
  crank1.position.set(0, -0.16, 0.16);
  pedalGroup.add(crank1);

  const crank2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.32, 0.025), frameMat);
  crank2.position.set(0, 0.16, -0.16);
  pedalGroup.add(crank2);

  // Platform Pedals with Amber Safety Reflectors (as in image)
  function createPlatformPedal(isRight: boolean): THREE.Group {
    const pGroup = new THREE.Group();
    // Platform cage
    const cage = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.20), frameMat);
    pGroup.add(cage);

    // Front & Back Amber Reflectors
    const refFront = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.024, 0.01), amberReflectorMat);
    refFront.position.set(0, 0, 0.105);
    const refBack = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.024, 0.01), amberReflectorMat);
    refBack.position.set(0, 0, -0.105);
    pGroup.add(refFront);
    pGroup.add(refBack);

    // Axle
    const pAxle = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.08, 8), chromeMat);
    pAxle.rotateX(Math.PI / 2);
    pAxle.position.set(0, 0, isRight ? -0.12 : 0.12);
    pGroup.add(pAxle);

    return pGroup;
  }

  const pedalLeft = createPlatformPedal(false);
  pedalLeft.position.set(0, -0.32, 0.24);
  pedalGroup.add(pedalLeft);

  const pedalRight = createPlatformPedal(true);
  pedalRight.position.set(0, 0.32, -0.24);
  pedalGroup.add(pedalRight);

  bikeGroup.add(pedalGroup);

  // Drive Chain linking chainring to rear gear cassette
  const upperChain = createTube([bottomBracket[0], bottomBracket[1] + 0.32, 0.14], [rearAxle[0], rearAxle[1] + 0.22, 0.18], 0.014, chromeMat);
  const lowerChain = createTube([bottomBracket[0], bottomBracket[1] - 0.32, 0.14], [rearAxle[0], rearAxle[1] - 0.16, 0.18], 0.014, chromeMat);
  bikeGroup.add(upperChain);
  bikeGroup.add(lowerChain);

  // Rear Derailleur Body & Tension Pulley
  const derailleur = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.06), frameMat);
  derailleur.position.set(rearAxle[0] + 0.12, rearAxle[1] - 0.22, 0.20);
  bikeGroup.add(derailleur);

  // === GROUND CONTACT SHADOW PLANE ===
  // Realistic soft ground shadow beneath the wheels and kickstand
  const shadowGeo = new THREE.PlaneGeometry(5.4, 2.2);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 256;
  shadowCanvas.height = 128;
  const sCtx = shadowCanvas.getContext('2d');
  if (sCtx) {
    sCtx.clearRect(0, 0, 256, 128);
    // Rear wheel contact shadow
    const gradRear = sCtx.createRadialGradient(64, 64, 5, 64, 64, 50);
    gradRear.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    gradRear.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
    gradRear.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = gradRear;
    sCtx.beginPath();
    sCtx.ellipse(64, 64, 55, 30, 0, 0, Math.PI * 2);
    sCtx.fill();

    // Front wheel contact shadow
    const gradFront = sCtx.createRadialGradient(192, 64, 5, 192, 64, 50);
    gradFront.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    gradFront.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
    gradFront.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = gradFront;
    sCtx.beginPath();
    sCtx.ellipse(192, 64, 55, 30, 0, 0, Math.PI * 2);
    sCtx.fill();

    // Kickstand contact shadow
    const gradKick = sCtx.createRadialGradient(78, 90, 2, 78, 90, 20);
    gradKick.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
    gradKick.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = gradKick;
    sCtx.beginPath();
    sCtx.arc(78, 90, 18, 0, Math.PI * 2);
    sCtx.fill();
  }

  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    opacity: isDarkMode ? 0.85 : 0.55,
    depthWrite: false,
  });
  const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
  contactShadow.position.set(0, -1.45, 0);
  bikeGroup.add(contactShadow);

  // === INTERACTIVE TELEMETRY HOTSPOTS ===
  const hotspots: EBikeHotspot[] = [
    {
      id: 'battery',
      title: 'Integrated 48V Lithium Battery',
      category: 'Power & Range',
      description: 'Fully integrated removable downtube battery pack with LG 21700 cells, key lock, and intelligent BMS.',
      specs: '720Wh Capacity • 48V 15Ah • 80km Range',
      position: [0.65, 0.38, 0.20],
    },
    {
      id: 'suspension',
      title: 'Dual Air/Coil Suspension',
      category: 'Comfort & Stability',
      description: 'Adjustable preload hydraulic front fork paired with mid-pivot rear shock damper for Calcutta pothole absorption.',
      specs: '120mm Front Travel • 45mm Rear Stroke • Lockout Dial',
      position: [-0.45, 0.88, 0.15],
    },
    {
      id: 'cockpit',
      title: 'Smart LCD Command Display',
      category: 'Electronics & Cockpit',
      description: 'Backlit multi-function digital cluster showing real-time velocity, assist level 1-5, odometer, and battery percentage.',
      specs: 'IP65 Water Resistant • USB-C Charging Port • Auto-Headlight Sensor',
      position: [1.45, 1.76, 0.05],
    },
    {
      id: 'brakes',
      title: 'Hydraulic Disc Braking System',
      category: 'Safety & Control',
      description: 'Dual-piston sport calipers biting 180mm drilled stainless steel rotors with electronic motor cut-off safety switches.',
      specs: '180mm Drilled Rotors • Mineral Oil • Red Anodized Calipers',
      position: [2.05, 0.30, -0.22],
    },
    {
      id: 'motor',
      title: 'High-Torque Rear Hub Motor',
      category: 'Drivetrain & Boost',
      description: 'Brushless planetary geared hub motor delivering instant hill-climbing acceleration and regenerative coasting.',
      specs: '750W Peak Power • 75 Nm Torque • 35 km/h Top Assist',
      position: [-2.05, 0.0, -0.15],
    },
  ];

  // Dynamic update methods
  const updateAccentColor = (newColor: string) => {
    const col = new THREE.Color(newColor).getHex();
    accentMat.color.setHex(col);
    accentMat.emissive.setHex(col);
  };

  const setWireframe = (wf: boolean) => {
    frameMat.wireframe = wf;
    accentMat.wireframe = wf;
    chromeMat.wireframe = wf;
    rotorMat.wireframe = wf;
    caliperMat.wireframe = wf;
    tireMat.wireframe = wf;
    rimMat.wireframe = wf;
    saddleMat.wireframe = wf;
    gripMat.wireframe = wf;
  };

  const setHeadlight = (on: boolean) => {
    headlightSpot.intensity = on ? (isDarkMode ? 3.5 : 2.0) : 0;
    headlightLensMat.emissiveIntensity = on ? 2.2 : 0.2;
  };

  return {
    bikeGroup,
    frontWheel,
    rearWheel,
    pedalGroup,
    headlightLight: headlightSpot,
    headlightLens: lightLens,
    hotspots,
    materials: {
      frameMat,
      accentMat,
      chromeMat,
      caliperMat,
      tireMat,
      rimMat,
      saddleMat,
    },
    updateAccentColor,
    setWireframe,
    setHeadlight,
  };
}
