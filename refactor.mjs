import fs from 'fs/promises';
import path from 'path';

const FEATURES = ["analysis", "compliance", "execution", "governance", "onboarding", "ops", "strategy", "charts"];

async function* walk(dir) {
    for await (const d of await fs.opendir(dir)) {
        const entry = path.join(dir, d.name);
        if (d.isDirectory()) yield* walk(entry);
        else if (d.isFile() && /\.(js|jsx|ts|tsx)$/.test(d.name)) yield entry;
    }
}

async function refactorPaths() {
    const srcDir = path.resolve('src');
    let updatedCount = 0;

    for await (const file of walk(srcDir)) {
        let content = await fs.readFile(file, 'utf8');
        let originalContent = content;

        for (const feat of FEATURES) {
            // dynamic imports: import('@/components/charts/...')
            const regexDyn = new RegExp(`import\\(['"]@/components/${feat}(/.*)?['"]\\)`, 'g');
            content = content.replace(regexDyn, `import('@/features/${feat}/components$1')`);

            // relative dynamic imports: import('../../components/charts/...')
            const regexDynRel = new RegExp(`import\\(['"](\\.\\./)+components/${feat}(/.*)?['"]\\)`, 'g');
            content = content.replace(regexDynRel, `import('@/features/${feat}/components$2')`);
            
            // missed static imports without space? like `import'@/components...` (unlikely but just in case)
        }

        if (content !== originalContent) {
            await fs.writeFile(file, content, 'utf8');
            updatedCount++;
        }
    }
    console.log(`Updated paths in ${updatedCount} files.`);
}

refactorPaths().catch(console.error);
