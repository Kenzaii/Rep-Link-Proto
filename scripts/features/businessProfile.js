import { api } from '../data/api.js';
import { store } from '../data/store.js';

async function main(){
  const auth = store.get('auth');
  if (!auth?.isAuthed || auth.user?.role !== 'business'){ location.href = '../login.html'; return; }
  const $ = id => document.getElementById(id);

  const key = `profile.biz.${auth.user.id}`;
  const existing = JSON.parse(localStorage.getItem(key) || 'null');
  const mock = await api.singpassBiz().catch(()=>({}));

  const model = Object.assign({
    company: auth.user.company || mock.company || '',
    email: auth.user.email,
    uen: mock.uen || '',
    address: mock.address || '',
    contact: mock.contact || '',
    billingEmail: mock.billingEmail || '',
    bank: '',
    delivery: '',
    categories: '',
    verified: false,
    logo: ''
  }, existing || {});

  // Bind UI
  $('bizEmail').textContent = model.email;
  ['company','uen','address','contact','billingEmail','bank','delivery','categories'].forEach(id => $(id).value = model[id] || '');
  $('verified').checked = !!model.verified;

  if (model.logo) {
    $('logoPreview').src = model.logo;
    $('logoPreview').style.display = 'block';
    $('logoPlaceholder').style.display = 'none';
  }
  $('logoFile').addEventListener('change', (e)=>{
    const f = e.target.files?.[0]; if(!f) return;
    if (f.size > 1_048_576) { alert('Image too large (max 1MB).'); e.target.value=''; return; }
    const reader = new FileReader();
    reader.onload = () => { 
      model.logo = reader.result; 
      $('logoPreview').src = model.logo;
      $('logoPreview').style.display = 'block';
      $('logoPlaceholder').style.display = 'none';
    };
    reader.readAsDataURL(f);
  });

  $('saveBiz').addEventListener('click', ()=>{
    ['company','uen','address','contact','billingEmail','bank','delivery','categories'].forEach(id => model[id] = $(id).value.trim());
    model.verified = $('verified').checked;
    localStorage.setItem(key, JSON.stringify(model));
    alert('Profile saved');
  });
}

document.addEventListener('DOMContentLoaded', main);
