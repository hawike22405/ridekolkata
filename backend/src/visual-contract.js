import { z } from 'zod';

const axis = z.number().finite().min(-10000).max(10000);
export const vector3 = z.tuple([axis, axis, axis]);
const component = z.number().finite().min(-1).max(1);
export const quaternion = z.tuple([component, component, component, component])
  .refine(value => Math.abs(Math.hypot(...value) - 1) <= 1e-6, 'Quaternion [x,y,z,w] must have unit length (tolerance 0.000001)');
export const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a six-digit #RRGGBB color');

export const modelUrl = z.string().min(1).max(2048).refine(value => {
  // No server-side fetching. Absolute URLs must be HTTPS; relative URLs resolve
  // against the frontend origin, never against the API host implicitly.
  if (/[\\\s\u0000-\u001f\u007f]/.test(value)) return false;
  const relative = value.startsWith('/') && !value.startsWith('//');
  if (!relative && !value.startsWith('https://')) return false;
  try {
    const decoded = decodeURIComponent(value);
    if (/[\\\u0000-\u001f\u007f]/.test(decoded)) return false;
    if (decoded.split(/[/?#]/).some(part => part === '.' || part === '..')) return false;
    const url = new URL(value, 'https://relative-url-validation.invalid');
    return !url.username && !url.password && !url.hash && /\.(glb|gltf)$/i.test(decodeURIComponent(url.pathname));
  } catch { return false; }
}, 'Use a root-relative or HTTPS .glb/.gltf URL without credentials, fragment, or traversal');

export const cameraPivot = z.strictObject({
  position: vector3,
  rotationQuaternion: quaternion,
});

export const visualConfigInput = z.strictObject({
  schemaVersion: z.literal(1),
  modelUrl,
  modelScale: z.number().finite().min(0.001).max(100),
  modelRotationQuaternion: quaternion,
  lightingIntensity: z.number().finite().min(0).max(20),
  cameraPivotPoints: z.array(cameraPivot).min(1).max(32),
  cameraFov: z.number().finite().min(10).max(120),
  drivetrainAnimationSpeed: z.number().finite().min(0).max(20),
  hexColors: z.strictObject({ background: hexColor, primary: hexColor, accent: hexColor }),
});

// The same executable contract guards both writes and public output.
export const visualConfigResponse = z.strictObject({
  data: visualConfigInput,
  revision: z.uuid(),
  updatedAt: z.iso.datetime(),
});
