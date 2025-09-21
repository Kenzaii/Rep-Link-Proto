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

// Fix footer links to point to working help pages
function fixFooterLinks(content, filePath) {
  let updated = false;
  
  // Check if this is a pages/ subdirectory file
  const isPagesFile = filePath.includes('pages/');
  
  if (isPagesFile) {
    // For pages/ files, use relative paths to help pages
    const newFooterContent = `<nav class="footer__nav">
                        <a href="help/index.html">Help Center</a>
                        <a href="help/index.html?topic=faq">FAQ</a>
                        <a href="privacy.html">Privacy Policy</a>
                        <a href="terms.html">Terms of Service</a>
                    </nav>`;
    
    const oldFooterPattern = /<nav class="footer__nav">[\s\S]*?<\/nav>/g;
    const newContent = content.replace(oldFooterPattern, newFooterContent);
    
    if (newContent !== content) {
      updated = true;
      return { content: newContent, updated };
    }
  } else {
    // For root files, use paths to pages/help/
    const newFooterContent = `<nav class="footer__nav">
                        <a href="pages/help/index.html">Help Center</a>
                        <a href="pages/help/index.html?topic=faq">FAQ</a>
                        <a href="pages/privacy.html">Privacy Policy</a>
                        <a href="pages/terms.html">Terms of Service</a>
                    </nav>`;
    
    const oldFooterPattern = /<nav class="footer__nav">[\s\S]*?<\/nav>/g;
    const newContent = content.replace(oldFooterPattern, newFooterContent);
    
    if (newContent !== content) {
      updated = true;
      return { content: newContent, updated };
    }
  }
  
  return { content, updated };
}

const rootDir = __dirname;
const htmlFiles = findHtmlFiles(rootDir);

console.log(`Found ${htmlFiles.length} HTML files`);

let updatedCount = 0;

htmlFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const { content: newContent, updated } = fixFooterLinks(content, file);
  
  if (updated) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Updated: ${file.replace(rootDir, '')}`);
    updatedCount++;
  }
});

console.log(`\nUpdated ${updatedCount} files with working Help Center links!`);
