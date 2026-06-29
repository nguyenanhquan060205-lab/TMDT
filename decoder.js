const fs = require('fs');
// This script decodes base64 and writes authController.ts
const b64 = process.argv[2];
const content = Buffer.from(b64, 'base64').toString('utf-8');
fs.writeFileSync('backend/src/controllers/authController.ts', content, 'utf-8');
console.log('Written ' + content.length + ' bytes');
