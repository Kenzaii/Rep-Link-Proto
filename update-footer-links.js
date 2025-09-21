const fs = require('fs');
const path = require('path');

// Find all HTML files
function findHtmlFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findHtmlFiles(fullPath));
    } else if (stat.isFile() && item.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

// Update footer links
function updateFooterLinks(content, filePath) {
  let updated = false;
  
  // Check if this is a pages/ subdirectory file
  const isPagesFile = filePath.includes('pages/');
  const relativePath = isPagesFile ? '../' : '';
  
  // Update footer navigation links
  const oldFooterPattern = /<nav class="footer__nav">[\s\S]*?<\/nav>/g;
  const newFooterContent = `<nav class="footer__nav">
                        <a href="${relativePath}/help">Help Center</a>
                        <a href="${relativePath}/help?topic=faq">FAQ</a>
                        <a href="${relativePath}pages/privacy.html">Privacy Policy</a>
                        <a href="${relativePath}pages/terms.html">Terms of Service</a>
                    </nav>`;
  
  const newContent = content.replace(oldFooterPattern, newFooterContent);
  
  if (newContent !== content) {
    updated = true;
  }
  
  return { content: newContent, updated };
}

const rootDir = __dirname;
const htmlFiles = findHtmlFiles(rootDir);

console.log(`Found ${htmlFiles.length} HTML files`);

let updatedCount = 0;

htmlFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const { content: newContent, updated } = updateFooterLinks(content, file);
  
  if (updated) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Updated: ${file.replace(rootDir, '')}`);
    updatedCount++;
  }
});

console.log(`\nUpdated ${updatedCount} files with new Help Center links!`);
