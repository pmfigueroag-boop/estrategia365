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

        // Replace component paths
        for (const feat of FEATURES) {
            // matches relative or absolute alias imports
            const regex1 = new RegExp(`from\\s+['"]@/components/${feat}(/.*)?['"]`, 'g');
            content = content.replace(regex1, `from '@/features/${feat}/components$1'`);
            
            const regex2 = new RegExp(`import\\s+['"]@/components/${feat}(/.*)?['"]`, 'g');
            content = content.replace(regex2, `import '@/features/${feat}/components$1'`);
            
            // relative paths like '../../components/analysis'
            const regex3 = new RegExp(`['"](\\.\\./)+components/${feat}(/.*)?['"]`, 'g');
            content = content.replace(regex3, `'@/features/${feat}/components$2'`);
        }

        // Replace context paths
        content = content.replace(/from\s+['"]@\/context\/([^'"]+)['"]/g, `from '@/features/plan/context/$1'`);
        content = content.replace(/['"](\.\.\/)+context\/([^'"]+)['"]/g, `'@/features/plan/context/$2'`);

        if (content !== originalContent) {
            await fs.writeFile(file, content, 'utf8');
            updatedCount++;
        }
    }
    console.log(`Updated paths in ${updatedCount} files.`);
}

refactorPaths().catch(console.error);
