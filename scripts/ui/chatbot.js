/**
 * Chatbot UI
 * Handles chat interface for authenticated users
 */

import { store } from '../data/store.js';

// Helper functions
function now() { return new Date().toISOString(); }
function fmt(ts) { return new Date(ts).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}); }

function loadAll() {
  return JSON.parse(localStorage.getItem('chatThreads') || '{}');
}

function saveAll(data) {
  localStorage.setItem('chatThreads', JSON.stringify(data));
}

function loadThreads() {
  return JSON.parse(localStorage.getItem('chatThreadList') || '[]');
}

function saveThreads(threads) {
  localStorage.setItem('chatThreadList', JSON.stringify(threads));
}

function agentReply(query, { to }) {
  const replies = {
    'intro': 'Hi! I\'m interested in partnering with your business. I have experience in B2B sales and would love to discuss how I can help grow your revenue.',
    'commission': 'What commission structure do you offer for sales representatives? I\'m looking for competitive rates that reflect the value I bring.',
    'pricing': 'Could you share your pricing structure for the products/services? I\'d like to understand the market positioning and margins.',
    'next step': 'Great! What would be the next step in the partnership process? I\'m ready to move forward and start representing your brand.',
    'thanks': 'Thank you for your time! I look forward to hearing from you soon and potentially working together.'
  };
  
  const lowerQuery = query.toLowerCase();
  for (const [key, reply] of Object.entries(replies)) {
    if (lowerQuery.includes(key)) {
      return reply;
    }
  }
  
  return 'Thank you for your message. I\'ll review this and get back to you with a detailed response soon.';
}

function ensureUI() {
  if (document.querySelector('[data-chat-launcher]')) return;
  
  const chatHTML = `
    <div class="chat-launcher" data-chat-launcher>
      <button type="button" aria-label="Open chat">💬</button>
    </div>
    
    <div class="chat-panel" data-chat-panel hidden>
      <header class="chat-header">
        <h3>Sales Assistant</h3>
        <button class="chat-close" data-chat-close type="button" aria-label="Close chat">✕</button>
      </header>
      
      <div class="chat-body" data-chat-body>
        <div class="chat-quick" data-quick></div>
        <div class="chat-typing" data-typing hidden>Agent is typing...</div>
      </div>
      
      <div class="chat-input">
        <input type="text" id="chatInput" placeholder="Type your message..." />
        <button class="chat-send" id="chatSend" type="button">→</button>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', chatHTML);
}

async function init(){
  const auth = store.get('auth');
  if(!auth?.isAuthed) return; // only when logged in

  ensureUI();

  // Re-query every time in case markup was just injected
  const launcher = document.querySelector('[data-chat-launcher] button');
  const panel    = document.querySelector('[data-chat-panel]');
  const body     = document.querySelector('[data-chat-body]');
  const quick    = document.querySelector('[data-quick]');
  const typing   = document.querySelector('[data-typing]');
  const input    = document.getElementById('chatInput');
  const sendBtn  = document.getElementById('chatSend');

  if(!launcher || !panel || !body || !input || !sendBtn){ return; } // hard guard

  const threads = await loadThreads();
  const storeAll = loadAll();
  const uid = auth.user.id;
  const currentId = threads[0]?.id || 'general';
  const key = `${uid}:${currentId}`;
  storeAll[key] = storeAll[key] || [
    {role:'agent', text:'Hi! Pick a quick reply or type a message. I\'ll help you draft professional outreach to the business.', ts: now()}
  ];
  saveAll(storeAll);

  function paint(){
    const list = loadAll()[key] || [];
    body.innerHTML = list.map(m=>`
      <div class="chat-msg ${m.role==='you'?'you':'agent'}">
        <div>${m.text.replace(/\n/g,'<br>')}</div>
        <div class="chat-meta">${fmt(m.ts)}</div>
      </div>`).join('');
    body.scrollTop = body.scrollHeight;
  }
  function add(role, text){
    const all = loadAll(); all[key] = all[key] || [];
    all[key].push({role,text,ts:now()}); saveAll(all); paint();
  }

  // Quick suggestions
  const SUG = ['intro','commission','pricing','next step','thanks'];
  quick.innerHTML = SUG.map(s=>`<button data-sug="${s}">${s}</button>`).join('');
  quick.addEventListener('click', e=>{
    const b = e.target.closest('button[data-sug]'); if(!b) return;
    input.value = b.dataset.sug; input.focus();
  });

  // Panel toggles — add a class in addition to removing [hidden]
  function open(){
    panel.hidden = false;
    panel.classList.add('is-open');
    launcher.setAttribute('aria-expanded','true');
    paint(); input.focus();
  }
  function close(){
    panel.classList.remove('is-open');
    setTimeout(()=>{ panel.hidden = true; }, 120); // let the fade finish
    launcher.setAttribute('aria-expanded','false');
  }

  launcher.onclick = () => (panel.hidden ? open() : close());
  document.querySelector('[data-chat-close]').onclick = close;

  // Typing + reply
  function respond(q){
    typing.hidden = false;
    setTimeout(()=>{
      typing.hidden = true;
      add('agent', agentReply(q, {to: currentId}));
    }, 600);
  }
  function send(){
    const v = input.value.trim(); if(!v) return;
    add('you', v); input.value = '';
    respond(v);
  }
  input.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); send(); }});
  sendBtn.addEventListener('click', send);

  // First-time auto open
  if(!sessionStorage.getItem('chatSeen')){ open(); sessionStorage.setItem('chatSeen','1'); }
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('auth:changed', init);
