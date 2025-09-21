// GitHub Pages safe path helpers
export function rootPrefix() {
  const path = location.pathname;
  
  // Handle GitHub Pages subdirectory (e.g., /repo-name/)
  // Check if we're in a GitHub Pages subdirectory
  const pathParts = path.split('/').filter(Boolean);
  if (pathParts.length > 0 && pathParts[0] !== 'pages') {
    // We're in a subdirectory like /repo-name/
    return `/${pathParts[0]}/`;
  }
  
  // Handle local /pages/ subdirectory
  const pagesIndex = path.indexOf('/pages/');
  return pagesIndex >= 0 ? path.slice(0, pagesIndex) : '';
}

export function resolve(pathFromRoot) {
  return `${rootPrefix()}${pathFromRoot}`;
}
