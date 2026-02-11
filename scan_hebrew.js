const fs = require('fs');
const path = require('path');

function scanDir(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        if (file.startsWith('.') || file === 'node_modules') return;

        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            scanDir(fullPath);
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const hebrewRegex = /[\u0590-\u05FF]/g;
            const matches = content.match(hebrewRegex);

            if (matches) {
                console.log(`FOUND HEBREW IN: ${fullPath}`);
                const lines = content.split('\n');
                lines.forEach((line, i) => {
                    if (/[\u0590-\u05FF]/.test(line)) {
                        console.log(`Line ${i + 1}: ${line.trim()}`);
                    }
                });
            }
        }
    });
}

console.log('Scanning for Hebrew...');
scanDir('c:\\Users\\USER\\OneDrive\\שולחן העבודה\\recomp-pro\\src');
console.log('Scan complete.');
