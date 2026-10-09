import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';
import { visualConfigInput } from './visual-contract.js';

const { Schema } = mongoose;
const embedded = { _id: false, strict: 'throw' };
const numbers = () => ({ type: [Number], required: true, default: undefined });
const pivot = new Schema({ position: numbers(), rotationQuaternion: numbers() }, embedded);
const colors = new Schema({ background: { type: String, required: true }, primary: { type: String, required: true }, accent: { type: String, required: true } }, embedded);
const config = new Schema({
  schemaVersion: { type: Number, required: true, enum: [1] },
  modelUrl: { type: String, required: true },
  modelScale: { type: Number, required: true },
  modelRotationQuaternion: numbers(),
  lightingIntensity: { type: Number, required: true },
  cameraPivotPoints: { type: [pivot], required: true, default: undefined },
  cameraFov: { type: Number, required: true },
  drivetrainAnimationSpeed: { type: Number, required: true },
  hexColors: { type: colors, required: true },
}, embedded);
config.pre('validate', function () { visualConfigInput.parse(this.toObject()); });

const visualSchema = new Schema({
  _id: { type: String, enum: ['current'], required: true },
  config: { type: config, required: true },
  revision: { type: String, required: true },
}, { strict: 'throw', timestamps: true, autoIndex: false, bufferCommands: false });
export const VisualConfig = mongoose.model('VisualConfig', visualSchema);

// Fixed singleton ID uses MongoDB's built-in unique _id index. Nothing is seeded.
// Revisions are random tokens so delete/recreate cannot revive a stale ETag.
export const visualRepository = {
  read: () => VisualConfig.findById('current').lean(),
  create: input => VisualConfig.create({ _id: 'current', config: visualConfigInput.parse(input), revision: randomUUID() }),
  replace: (revision, input) => VisualConfig.findOneAndUpdate(
    { _id: 'current', revision },
    { $set: { config: visualConfigInput.parse(input), revision: randomUUID() } },
    { new: true, runValidators: true },
  ).lean(),
  remove: revision => VisualConfig.deleteOne({ _id: 'current', revision }),
};
