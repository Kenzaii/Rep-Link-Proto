const fs = require('fs');
const path = require('path');

// Find all HTML files in pages directory
function findPagesHtmlFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && item === 'pages') {
      // Look in pages directory
      const pagesItems = fs.readdirSync(fullPath);
      for (const pageItem of pagesItems) {
        const pagePath = path.join(fullPath, pageItem);
        const pageStat = fs.statSync(pagePath);
        if (pageStat.isFile() && pageItem.endsWith('.html')) {
          files.push(pagePath);
        }
      }
    }
  }
  return files;
}

// Fix footer links for pages files with correct relative paths
function fixPagesFooterLinks(content) {
  // Replace the incorrect paths with correct relative paths
  let newContent = content.replace(
    /<a href="pages\/help\/index\.html">Help Center<\/a>/g,
    '<a href="help/index.html">Help Center</a>'
  );
  
  newContent = newContent.replace(
    /<a href="pages\/help\/index\.html\?topic=faq">FAQ<\/a>/g,
    '<a href="help/index.html?topic=faq">FAQ</a>'
  );
  
  newContent = newContent.replace(
    /<a href="pages\/privacy\.html">Privacy Policy<\/a>/g,
    '<a href="privacy.html">Privacy Policy</a>'
  );
  
  newContent = newContent.replace(
    /<a href="pages\/terms\.html">Terms of Service<\/a>/g,
    '<a href="terms.html">Terms of Service</a>'
  );
  
  return newContent;
}

const rootDir = __dirname;
const pagesFiles = findPagesHtmlFiles(rootDir);

console.log(`Found ${pagesFiles.length} HTML files in pages directory`);

let updatedCount = 0;

pagesFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const newContent = fixPagesFooterLinks(content);
  
  if (newContent !== content) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Updated: ${file.replace(rootDir, '')}`);
    updatedCount++;
  }
});

console.log(`\nFixed ${updatedCount} pages files with correct relative paths!`);
