import { hrefAbs } from './siteBase.js';

export function rootPrefix(){ return ''; } // no longer needed when using absolute
export function resolve(pathFromRoot){ return hrefAbs(pathFromRoot); } // absolute JSON/assets