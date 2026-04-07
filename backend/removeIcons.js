const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const importRegex = /import\s*\{([\s\S]*?)\}\s*from\s*['"]lucide-react['"];?/g;
      
      let newContent = content;
      let match;
      let found = false;
      while ((match = importRegex.exec(content)) !== null) {
        found = true;
        const importBlock = match[1];
        const icons = importBlock.split(',').map(s => s.trim().replace(/\n/g, '')).filter(Boolean);
        
        newContent = newContent.replace(match[0], '');
        
        for (const icon of icons) {
          // Remove JSX usages like <Icon /> and <Icon ... />
          const jsxRegexSelfClose = new RegExp(`<${icon}\\b[^>]*?\\/\\s*>`, 'g');
          const jsxRegexOpenClose = new RegExp(`<${icon}\\b[^>]*?>[\\s\\S]*?<\\/${icon}>`, 'g');
          newContent = newContent.replace(jsxRegexSelfClose, '');
          newContent = newContent.replace(jsxRegexOpenClose, '');
          
          // Remove object properties like `icon: Icon,` or `icon={<Icon />}`
          // If it was `icon={<Icon />}`, it was removed above, leaving `icon={}` which is invalid TSX!
          // So let's match `icon=\{\s*\}` and remove it:
          newContent = newContent.replace(/icon=\{\s*\}/g, '');
          
          // Match bare object properties: `icon: Icon,`
          const objProp1 = new RegExp(`[a-zA-Z0-9_]*icon\\s*:\\s*${icon}\\s*,?`, 'g');
          newContent = newContent.replace(objProp1, '');

          // Match bare object properties: `icon: Icon` (at end of object)
          const objProp2 = new RegExp(`[a-zA-Z0-9_]*icon\\s*:\\s*${icon}\\b`, 'g');
          newContent = newContent.replace(objProp2, '');
          
          // Replace `<stat.icon ...>` usages if there are any
          // actually this is specific to `stat.icon` but let's just do `<[a-zA-Z0-9_.]*icon\\b[^\>]*?\\/>`
          newContent = newContent.replace(/<[a-zA-Z0-9_.]*icon\b[^>]*?\/>/g, '');
        }
      }
      
      if (found) {
        fs.writeFileSync(fullPath, newContent);
        console.log('Processed', fullPath);
      }
    }
  }
}

processDir(path.join(__dirname, '../frontend/src'));
