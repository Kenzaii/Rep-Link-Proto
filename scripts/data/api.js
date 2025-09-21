import { resolve } from '../boot/paths.js';

async function tryJson(url){
  const r = await fetch(url, {cache:'no-store'});
  if(!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

async function getResilient(rootPath){ // rootPath like "/mock/users.json"
  const candidates = [
    resolve(rootPath),        // "../mock/users.json" or "./mock/users.json"
    `.${rootPath}`,           // "./mock/users.json"
    `..${rootPath}`           // "../mock/users.json"
  ].filter((v,i,a)=>a.indexOf(v)===i);

  const errors = [];
  for(const c of candidates){
    try { return await tryJson(c); } catch(e){ errors.push(`${c} → ${e.message}`); }
  }
  throw new Error(`Fetch failed for ${rootPath}. Tried:\n- ${errors.join('\n- ')}`);
}

export const api = {
  async get(p){ return getResilient(p); },

  async users(){ return this.get('/mock/users.json'); },
  async opportunities(){ return this.get('/mock/opportunities.json'); },
  async products(){ return this.get('/mock/products.json'); },
  async campaigns(){ return this.get('/mock/campaigns.json'); },
  async onboarding(){ return this.get('/mock/onboarding.json'); },
  async partners(){ return this.get('/mock/partners.json'); },
  async singpassRep(){ return this.get('/mock/singpass/rep.json'); },
  async singpassBiz(){ return this.get('/mock/singpass/business.json'); },
  async helpIndex(){ return this.get('/mock/help/articles.json'); },
  async helpFAQ(){ return this.get('/mock/help/faq.json'); },

  async login(email, password){
    const users = await this.users().catch(() => [
      {id:'u-rep-001', name:'Demo Rep', email:'rep@replink.dev', role:'rep', __pw:'RepLink#2025'},
      {id:'u-biz-001', name:'Demo Business', email:'business@replink.dev', role:'business', company:'Rep-Link Demo Co.', __pw:'RepLink#2025'}
    ]);
    const em = String(email||'').trim().toLowerCase();
    const u = users.find(x => String(x.email).toLowerCase() === em);
    await new Promise(r=>setTimeout(r,200));
    const expected = u?.password ?? u?.__pw;
    if(!u) throw new Error('No such user');
    if(String(expected)!==String(password)) throw new Error('Incorrect password');
    const {password:_a, __pw:_b, ...safe} = u; return safe;
  }
};