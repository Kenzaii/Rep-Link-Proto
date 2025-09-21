import { api } from '../data/api.js';
import { store } from '../data/store.js';
import { resolve } from '../boot/paths.js';

function maskNRIC(s=''){ return s.replace(/^(\w)\w+(\w)$/, '$1*****$2'); }
function pct(n){ return Math.max(0, Math.min(100, Math.round(n))); }

function completionScore(m){
  let score = 0;
  const fields = ['name','phone','address','nationalId','bank','experience','skills','links','avatar'];
  fields.forEach(f => { if (m[f] && String(m[f]).trim().length >= 2) score += 100/fields.length; });
  return pct(score);
}

async function main(){
  const auth = store.get('auth');
  if (!auth?.isAuthed || auth.user?.role !== 'rep'){ location.href = '../login.html'; return; }
  const el = (id)=>document.getElementById(id);

  // Load profile from localStorage, otherwise prefill from mock Singpass + auth
  const key = `profile.rep.${auth.user.id}`;
  const existing = JSON.parse(localStorage.getItem(key) || 'null');
  const mock = await api.singpassRep().catch(()=>({}));
  const model = Object.assign({
    name: auth.user.name || mock.name || '',
    email: auth.user.email,
    phone: mock.phone || '',
    address: mock.address || '',
    nationalId: mock.nationalId || '',
    bank: mock.bankAccount || '',
    experience: '',
    skills: '',
    links: '',
    publicProfile: false,
    avatar: ''
  }, existing || {});

  // Bind UI
  el('email').textContent = model.email;
  ['name','phone','address','nationalId','bank','experience','skills','links'].forEach(id => el(id).value = model[id] || '');
  el('publicProfile').checked = !!model.publicProfile;

  // Avatar
  if (model.avatar) {
    el('avatarPreview').src = model.avatar;
    el('avatarPreview').style.display = 'block';
    el('avatarPlaceholder').style.display = 'none';
  }
  el('avatarFile').addEventListener('change', (e)=>{
    const f = e.target.files?.[0]; if(!f) return;
    if (f.size > 1_048_576) { alert('Image too large (max 1MB).'); e.target.value=''; return; }
    const reader = new FileReader();
    reader.onload = () => { 
      model.avatar = reader.result; 
      el('avatarPreview').src = model.avatar;
      el('avatarPreview').style.display = 'block';
      el('avatarPlaceholder').style.display = 'none';
      paintMeter(); 
    };
    reader.readAsDataURL(f);
  });

  // Save
  el('saveBtn').addEventListener('click', ()=>{
    ['name','phone','address','nationalId','bank','experience','skills','links'].forEach(id => model[id] = document.getElementById(id).value.trim());
    model.publicProfile = document.getElementById('publicProfile').checked;
    // Mask NRIC in UI but store full value locally for the demo
    el('nationalId').value = model.nationalId;
    localStorage.setItem(key, JSON.stringify(model));
    alert('Profile saved');
    paintMeter();
  });

  // Completion meter
  function paintMeter(){
    const c = completionScore(model);
    document.getElementById('meterFill').style.width = `${c}%`;
    document.getElementById('meterText').textContent = `${c}% complete`;
  }
  paintMeter();
}

document.addEventListener('DOMContentLoaded', main);
