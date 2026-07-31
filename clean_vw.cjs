const fs = require('fs');
const path = require('path');

function replaceClampInDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceClampInDir(fullPath);
        } else if (fullPath.endsWith('HostImpostore.tsx') || 
                   fullPath.endsWith('HostFalsario.tsx') ||
                   fullPath.endsWith('HostDisegnatore.tsx') ||
                   fullPath.endsWith('HostLaCarriera.tsx') ||
                   fullPath.endsWith('HostMultigame.tsx') ||
                   fullPath.endsWith('HostNomiCoseCitta.tsx') ||
                   fullPath.endsWith('HostVeroOFake.tsx')) {
            
            let content = fs.readFileSync(fullPath, 'utf8');
            // Replace clamp(Xrem, Yvw, Zrem) with Zrem
            // Also clamp(Xrem, Yvw, Zpx) with Zpx
            // Regex: clamp\([^,]+,\s*[^,]+vw,\s*([^)]+)\)
            const regex = /clamp\([^,]+,\s*[^,]+vw,\s*([^)]+)\)/g;
            if (regex.test(content)) {
                content = content.replace(regex, '$1');
                fs.writeFileSync(fullPath, content);
                console.log('Updated', fullPath);
            }
            
            // Wait, also check if there is any other vw/vh
            const vwRegex = /([0-9.]+)vw/g;
            if (vwRegex.test(content)) {
                content = content.replace(vwRegex, (match, p1) => {
                    // Convert vw to % or rem. 
                    // 100vw = 1920px = 120rem. 1vw = 1.2rem.
                    return `${(parseFloat(p1) * 1.2).toFixed(1)}rem`;
                });
                fs.writeFileSync(fullPath, content);
                console.log('Updated vw in', fullPath);
            }
            
            const vhRegex = /([0-9.]+)vh/g;
            if (vhRegex.test(content) && !fullPath.includes('GameLayoutTV')) {
                content = content.replace(vhRegex, (match, p1) => {
                    // 100vh = 1080px = 67.5rem. 1vh = 0.675rem.
                    if (p1 === '100') return '100%';
                    return `${(parseFloat(p1) * 0.675).toFixed(1)}rem`;
                });
                fs.writeFileSync(fullPath, content);
                console.log('Updated vh in', fullPath);
            }
        }
    }
}

replaceClampInDir(path.join(__dirname, 'src', 'games'));
console.log('Done');
