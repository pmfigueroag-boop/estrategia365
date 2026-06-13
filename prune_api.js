const fs = require('fs');

let content = fs.readFileSync('src/lib/api.ts', 'utf8');

// Remove import uploadFile
content = content.replace('uploadFile, ', '');

// Remove Documents block
content = content.replace(/\/\/ ── Documents ───────────────────────────────────────────[\s\S]*?(?=\/\/ ── Stakeholders)/, '');

// Remove Digital Twin block
content = content.replace(/\/\/ ── Digital Twin \(Fase 3: Temporal\) ───────────────────────[\s\S]*?(?=\/\/ ── Maturity)/, '');

// Remove Wargaming block
content = content.replace(/\/\/ ── Wargaming ───────────────────────────────────────────[\s\S]*?(?=\/\/ ── V3: Institutional Features)/, '');

// Remove ESV Benchmarks
content = content.replace(/\s+getEsvBenchmarks:.*?\n/, '\n');
content = content.replace(/\s+getEsvComparison:.*?\n/, '\n');

// Remove V4 Advanced Optimization block
content = content.replace(/\/\/ ── V4: Advanced Optimization ───────────────────────────[\s\S]*?(?=\/\/ ── Auth)/, '');

// Remove AI Governance block
content = content.replace(/\/\/ ══════════════════════════════════════════════════════════\s*\n\s*\/\/ PHASE 3: AI Governance Dashboard\s*\n\s*\/\/ ══════════════════════════════════════════════════════════[\s\S]*?(?=\/\/ ══════════════════════════════════════════════════════════\s*\n\s*\/\/ PHASE 3: Observability Console)/, '');

// Remove Compliance Viewer block
content = content.replace(/\/\/ ══════════════════════════════════════════════════════════\s*\n\s*\/\/ PHASE 3: Compliance Viewer\s*\n\s*\/\/ ══════════════════════════════════════════════════════════[\s\S]*?(?=\/\/ ══════════════════════════════════════════════════════════\s*\n\s*\/\/ PHASE 5: Tenant Admin Console)/, '');

fs.writeFileSync('src/lib/api.ts', content, 'utf8');
console.log('Pruned api.ts successfully');
