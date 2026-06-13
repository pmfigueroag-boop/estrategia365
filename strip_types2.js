const fs = require('fs');
let content = fs.readFileSync('src/lib/api.js', 'utf8');

// Remove "as any"
content = content.replace(/as any/g, '');
// Wait, replacing "as any" might leave "(data ).access_token" which is valid but looks weird. Or "(data).access_token".
// Let's replace "(data as any)" with "data" entirely.
content = content.replace(/\(data as any\)/g, 'data');
// Wait, I already removed `: any` with the previous script. Let's see if there are other `as any`
// Let's just do:
content = content.replace(/as any/g, '');

fs.writeFileSync('src/lib/api.js', content, 'utf8');
console.log('Stripped remaining types from api.js');
