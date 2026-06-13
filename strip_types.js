const fs = require('fs');
let content = fs.readFileSync('src/lib/api.js', 'utf8');

// Remove : any annotations
content = content.replace(/:\s*any(\s*=\s*\{\})?/g, '');

fs.writeFileSync('src/lib/api.js', content, 'utf8');
console.log('Stripped types from api.js');
