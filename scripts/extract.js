const { spawnSync, spawn } = require('child_process');
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;
const fs = require('fs');
const path = require('path');

const framesDir = path.join(__dirname, '..', 'public', 'frames');
if (fs.existsSync(framesDir)) {
  fs.rmSync(framesDir, { recursive: true, force: true });
}
fs.mkdirSync(framesDir, { recursive: true });

console.log('Extracting frames from public/bg.mp4...');

// Let's test if webp is supported
const testWebp = spawnSync(ffmpeg, ['-formats'], { encoding: 'utf-8' });
const supportsWebp = testWebp.stdout.includes('webp');
console.log('Supports webp:', supportsWebp);

// Let's extract at 12 fps (~180 frames) or 15 fps (~226 frames).
// 15 fps gives 227 frames which provides ultra smooth scrubbing across scroll.
// We can output webp with -q:v 80 or high quality jpg with -q:v 3.
const ext = supportsWebp ? 'webp' : 'jpg';
const args = [
  '-i', 'public/bg.mp4',
  '-vf', 'fps=15,scale=1920:1080',
  '-q:v', supportsWebp ? '80' : '3',
  path.join(framesDir, `frame-%04d.${ext}`)
];

console.log('Running ffmpeg with args:', args.join(' '));
const proc = spawnSync(ffmpeg, args, { encoding: 'utf-8' });
if (proc.error) {
  console.error('Error running ffmpeg:', proc.error);
} else {
  const files = fs.readdirSync(framesDir);
  console.log(`Successfully extracted ${files.length} frames (${ext}) to public/frames/`);
  if (files.length > 0) {
    const stats = fs.statSync(path.join(framesDir, files[0]));
    console.log(`Sample frame: ${files[0]} size: ${Math.round(stats.size / 1024)} KB`);
  }
}
