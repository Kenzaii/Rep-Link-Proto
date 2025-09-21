// Single source of truth for absolute URLs on GitHub Pages (project site)
export function siteBase() {
  // 1) Meta override wins (lets you change base without code edits)
  const meta = document.querySelector('meta[name="site-base"]')?.content;
  if (meta) return meta.replace(/\/+$/,''); // trim trailing slash

  // 2) Auto-detect for GH Pages project sites: https://host/<repo>/...
  const segs = location.pathname.split('/').filter(Boolean);
  if (location.hostname.endsWith('github.io') && segs.length > 0) {
    return `${location.origin}/${segs[0]}`; // origin + /RepoName
  }

  // 3) Fallback to origin (useful on other hosts)
  return location.origin;
}

// Build absolute URLs for internal navigation
export function hrefAbs(pathFromRoot) {
  if (!pathFromRoot) return siteBase();
  if (!pathFromRoot.startsWith('/')) pathFromRoot = '/' + pathFromRoot;
  return `${siteBase()}${pathFromRoot}`;
}
