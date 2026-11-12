import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Minimal valid PNG generator for square icon with water drop color #0284c7 (RGBA: 2, 132, 199, 255)
function createSolidPNG(size, r, g, b, a = 255) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); // width
  ihdr.writeUInt32BE(size, 4); // height
  ihdr.writeUInt8(8, 8); // 8 bits per channel
  ihdr.writeUInt8(6, 9); // RGBA color type
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data: filter byte (0) + (r,g,b,a)*size per row
  const rowLength = 1 + size * 4;
  const rawData = Buffer.alloc(rowLength * size);

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.45;

  for (let y = 0; y < size; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < size; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Simple circular droplet badge
      if (dist <= radius) {
        // Subtle gradient
        const factor = Math.min(1, Math.max(0, (y / size)));
        const curR = Math.round(r * (1 - factor * 0.2));
        const curG = Math.round(g * (1 - factor * 0.15));
        const curB = Math.round(Math.min(255, b + 20));

        rawData[pxOffset] = curR;
        rawData[pxOffset + 1] = curG;
        rawData[pxOffset + 2] = curB;
        rawData[pxOffset + 3] = a;
      } else {
        // Transparent outside or dark background for maskable
        rawData[pxOffset] = 15; // slate-900 background
        rawData[pxOffset + 1] = 23;
        rawData[pxOffset + 2] = 42;
        rawData[pxOffset + 3] = 255;
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);

  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(calcCRC(body), 0);

  return Buffer.concat([len, body, crc]);
}

// CRC-32 table and calculation
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function calcCRC(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Write icons
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createSolidPNG(192, 2, 132, 199));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createSolidPNG(512, 2, 132, 199));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createSolidPNG(512, 2, 132, 199));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createSolidPNG(180, 2, 132, 199));

console.log('PWA icons successfully generated in /public');
