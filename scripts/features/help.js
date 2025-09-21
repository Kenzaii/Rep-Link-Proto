// /scripts/features/help.js
const API = {
  async loadAll(){
    const [base, faq] = await Promise.allSettled([
      fetch('../../mock/help/articles.json', {cache:'no-store'}).then(r=>r.json()),
      fetch('../../mock/help/faq.json',      {cache:'no-store'}).then(r=>r.json())
    ]);
    const data = (base.value || { topics:[], articles:[] });
    // Inject FAQ topic if present
    if (faq.status === 'fulfilled' && faq.value) {
      const t = faq.value.topic || { id:'faq', title:'FAQ', desc:'Frequently asked questions' };
      if (!data.topics.find(x=>x.id===t.id)) data.topics.push(t);
      const faqArticles = (faq.value.questions||[]).map(q => ({
        id: q.id,
        topic: t.id,
        title: q.q,
        updated: q.updated || '',
        excerpt: (q.a_html||'').replace(/<[^>]+>/g,' ').slice(0,140)+'…',
        body: q.a_html || ''
      }));
      // Deduplicate on id if already exists
      const seen = new Set(data.articles.map(a=>a.id));
      faqArticles.forEach(a=>{ if(!seen.has(a.id)) data.articles.push(a); });
    }
    return data;
  },
  search(data, q, topic){
    let list = data.articles;
    if (topic) list = list.filter(a=>a.topic===topic);
    const term = (q||'').trim().toLowerCase();
    if (!term) return list;
    return list.filter(a =>
      [a.title, a.excerpt, a.body].some(s => (s||'').toLowerCase().includes(term)));
  },
  byId: (data, id) => data.articles.find(a=>a.id===id),
  topic: (data, id) => data.topics.find(t=>t.id===id)
};

// Popularity (very simple, local)
const POPKEY = 'help_views_v1';
function bumpView(id){
  const views = JSON.parse(localStorage.getItem(POPKEY)||'{}'); views[id]=(views[id]||0)+1;
  localStorage.setItem(POPKEY, JSON.stringify(views));
}
function topArticles(data, n=5){
  const views = JSON.parse(localStorage.getItem(POPKEY)||'{}');
  return [...data.articles]
    .sort((a,b)=> (views[b.id]||0)-(views[a.id]||0))
    .slice(0,n);
}

// ---------- HELP HOME ----------
if (location.pathname.endsWith('/help/index.html')) {
  const data = await API.loadAll();

  // Topic tiles
  const topics = document.getElementById('topicGrid');
  topics.innerHTML = data.topics.map(t=>`
    <article class="topic card card--link" data-topic="${t.id}" tabindex="0" role="button" aria-pressed="false">
      <h3 class="t__title">${t.title}</h3>
      <p class="t__desc muted">${t.desc||''}</p>
    </article>`).join('');

  // Show "Popular"
  const popularWrap = document.getElementById('popularList');
  if (popularWrap) {
    const pop = topArticles(data, 6);
    popularWrap.innerHTML = pop.map(a=>`
      <div class="result-card">
        <a href="article.html?id=${encodeURIComponent(a.id)}">${a.title}</a>
        <p class="muted">${a.excerpt||''}</p>
      </div>`).join('') || `<p class="muted">No popular articles yet.</p>`;
  }

  // Topic click/keyboard
  topics.addEventListener('click', e=>{
    const card = e.target.closest('.topic'); if(!card) return;
    renderResults(API.search(data, '', card.dataset.topic), data, {topic:card.dataset.topic});
  });
  topics.addEventListener('keydown', e=>{
    if(e.key==='Enter' || e.key===' '){
      const card = e.target.closest('.topic'); if(!card) return;
      renderResults(API.search(data, '', card.dataset.topic), data, {topic:card.dataset.topic});
      e.preventDefault();
    }
  });

  // Pre-filter via URL (?topic=... or ?q=...)
  const url = new URLSearchParams(location.search);
  const q0 = url.get('q') || '';
  const t0 = url.get('topic') || '';
  if (q0 || t0) {
    document.getElementById('q').value = q0 || '';
    renderResults(API.search(data, q0, t0), data, {topic:t0, q:q0});
  }

  // Search submit
  document.getElementById('helpSearch').addEventListener('submit', e=>{
    e.preventDefault();
    const q = new FormData(e.currentTarget).get('q') || '';
    renderResults(API.search(data, q), data, {q});
  });

  function renderResults(list, all, {topic,q}={}){
    const res = document.getElementById('results');
    const ul  = document.getElementById('resultList');
    const pager = document.getElementById('pager');
    res.hidden = false;

    const pageSize = 8; let page = 1;
    function paint(){
      const start=(page-1)*pageSize, items=list.slice(start, start+pageSize);
      const topicName = topic ? (API.topic(all, topic)?.title || '') : '';
      document.getElementById('resultsTitle')?.replaceChildren(
        document.createTextNode(topicName ? `${topicName}` : (q?`Results for "${q}"`:'Results'))
      );
      ul.innerHTML = items.map(a => `
        <div class="result-card">
          <a href="article.html?id=${encodeURIComponent(a.id)}">${a.title}</a>
          <p class="muted">${a.excerpt||''}</p>
        </div>`).join('') || `<p class="muted">No results.</p>`;

      const total = Math.ceil(list.length / pageSize) || 1;
      pager.innerHTML = Array.from({length: total}).map((_,i)=>`
        <button ${i+1===page?'class="is-active"':''} data-p="${i+1}">${i+1}</button>`).join('');
    }
    pager.onclick = e => { const p = e.target.dataset.p; if(!p) return; page = +p; paint(); };
    paint();
    res.scrollIntoView({behavior:'smooth', block:'start'});
  }
}

// ---------- ARTICLE ----------
if (location.pathname.endsWith('/help/article.html')) {
  const data = await API.loadAll();
  const params = new URLSearchParams(location.search);
  const id = params.get('id') || '';
  const a = API.byId(data, id);

  const titleEl = document.getElementById('title');
  const metaEl  = document.getElementById('meta');
  const bodyEl  = document.getElementById('body');
  const tocEl   = document.getElementById('toc');

  if (!a) {
    titleEl.textContent = 'Article not found';
    bodyEl.innerHTML = `<p>Please return to the <a href="index.html">Help Center</a>.</p>`;
  } else {
    bumpView(a.id);
    document.getElementById('docTitle').textContent = `${a.title} • Rep-Link Help`;
    titleEl.textContent = a.title;
    metaEl.textContent = a.updated ? `Updated ${a.updated}` : '';
    bodyEl.innerHTML = a.body;

    const topic = API.topic(data, a.topic);
    const bcCat = document.getElementById('bcCat'); const bcTitle = document.getElementById('bcTitle');
    bcCat.textContent = topic?.title || 'All topics';
    bcCat.href = `index.html?topic=${encodeURIComponent(topic?.id||'')}`;
    bcTitle.textContent = a.title;

    // Build TOC
    const hs = bodyEl.querySelectorAll('h2, h3');
    tocEl.innerHTML = Array.from(hs).map((h,i)=>{ const hid = h.id || `h-${i}`; h.id = hid; return `<a href="#${hid}">${h.textContent}</a>`; }).join('');
  }

  // Feedback mock
  document.addEventListener('click', (e)=>{
    const b = e.target.closest('[data-fb]'); if(!b) return;
    b.disabled = true; b.textContent = 'Thanks!';
  });
}