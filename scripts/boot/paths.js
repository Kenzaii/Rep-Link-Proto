export function rootPrefix() {
  const isSub = location.pathname.toLowerCase().includes('/pages/');
  if (location.protocol === 'file:') return isSub ? '..' : '.';
  return isSub ? '..' : '.';
}

export function resolve(pathFromRoot) {
  const base = rootPrefix();
  return `${base}${pathFromRoot}`;
}