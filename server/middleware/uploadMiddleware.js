import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALLOWED_MIME_TO_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

function createUploader(subFolder) {
  const targetDir = path.resolve(__dirname, '..', env.uploadDir, subFolder);
  fs.mkdirSync(targetDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, targetDir),
    filename: (req, file, cb) => {
      const ext = ALLOWED_MIME_TO_EXT[file.mimetype] || '.jpg';
      const randomName = crypto.randomBytes(16).toString('hex');
      cb(null, `${Date.now()}-${randomName}${ext}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME_TO_EXT[file.mimetype]) {
      return cb(null, true);
    }
    const err = new Error('Only JPEG, PNG, and WebP image files are permitted.');
    err.statusCode = 400;
    return cb(err, false);
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: env.maxFileSizeMb * 1024 * 1024 },
  });
}

export const reportImageUpload = createUploader('reports');
export const claimEvidenceUpload = createUploader('claims');
