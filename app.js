const KEY='thee-onset-v2';const blank=()=>({businesses:[],transactions:[],assets:[],debts:[],repayments:[],currency:'KES'});
let db=load(),scope='all',bizScope='all',installEvent=null;
function load(){try{return {...blank(),...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return blank()}}
function save(){localStorage.setItem(KEY,JSON.stringify(db));render()}
const $=id=>document.getElementById(id),today=()=>new Date().toISOString().slice(0,10),uid=()=>crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random());
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cash=n=>new Intl.NumberFormat('en-KE',{style:'currency',currency:db.currency||'KES',maximumFractionDigits:2}).format(Number(n)||0);
const businessName=id=>db.businesses.find(b=>b.id===id)?.name||'Personal';
function visible(x){return (scope==='all'||(x.scope||'personal')===scope)&&(bizScope==='all'||x.businessId===bizScope)}
function filtered(arr){return arr.filter(visible)}
function switchPage(id){document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.dataset.page===id));document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id===id))}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>switchPage(b.dataset.page));document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>switchPage(b.dataset.go));
$('today').textContent=new Date().toLocaleDateString('en-KE',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
function scopeOptions(){document.querySelectorAll('.business-input').forEach(s=>{let old=s.value;s.innerHTML='<option value="">Personal / none</option>'+db.businesses.map(b=>`<option value="${b.id}">${esc(b.name)}</option>`).join('');s.value=old});$('businessScope').innerHTML='<option value="all">All businesses</option>'+db.businesses.map(b=>`<option value="${b.id}">${esc(b.name)}</option>`).join('');$('businessScope').value=bizScope;$('scope').value=scope}
$('scope').onchange=e=>{scope=e.target.value;render()};$('businessScope').onchange=e=>{bizScope=e.target.value;render()};
function bindForm(button,box,form,handler){$(button).onclick=()=>{$(form).reset();$(box).classList.toggle('hidden')};$(form).onsubmit=e=>{e.preventDefault();let scopeField=e.target.querySelector('.scope-input'),businessField=e.target.querySelector('.business-input');if(scopeField&&scopeField.value==='business'&&businessField&&!businessField.value){alert('Choose a business for this record.');return}handler(Object.fromEntries(new FormData(e.target)));e.target.reset();$(box).classList.add('hidden');save()}}
document.querySelectorAll('.cancel').forEach(b=>b.onclick=()=>b.closest('.form').classList.add('hidden'));
document.querySelectorAll('.scope-input').forEach(sel=>sel.addEventListener('change',()=>{
 const form=sel.closest('form'), biz=form.querySelector('.business-input');
 if(biz){biz.required=sel.value==='business';if(sel.value==='personal')biz.value='';}
}));
document.querySelectorAll('.business-input').forEach(sel=>sel.addEventListener('change',()=>{
 const form=sel.closest('form'), scopeField=form.querySelector('.scope-input');
 if(scopeField && sel.value) scopeField.value='business';
}));

bindForm('newTx','txBox','txForm',v=>{v.id=uid();v.amount=+v.amount;db.transactions.unshift(v)});
bindForm('newBusiness','businessBox','businessForm',v=>{v.id=uid();v.opening=+v.opening;db.businesses.push(v)});
bindForm('newAsset','assetBox','assetForm',v=>{v.id=uid();v.cost=+v.cost;v.value=+v.value;db.assets.push(v)});
bindForm('newDebt','debtBox','debtForm',v=>{v.id=uid();['original','balance','rate','payment'].forEach(k=>v[k]=+(v[k]||0));db.debts.push(v)});
$('addBusiness').onclick=()=>$('newBusiness').click();
function del(type,id){if(confirm('Delete this record? This cannot be undone unless you have a backup.')){db[type]=db[type].filter(x=>x.id!==id);save()}}
function card(title,meta,value,buttons){return `<article class="record"><h3>${esc(title)}</h3><p>${esc(meta)}</p><div class="value">${cash(value)}</div><div class="recordfoot">${buttons||''}</div></article>`}
function render(){
 scopeOptions();
 let tx=filtered(db.transactions),assets=filtered(db.assets),debts=filtered(db.debts),reps=db.repayments.filter(visible);
 let inc=tx.filter(x=>x.type==='income').reduce((s,x)=>s+x.amount,0),out=tx.filter(x=>x.type==='expense').reduce((s,x)=>s+x.amount,0),av=assets.reduce((s,x)=>s+x.value,0),dv=debts.reduce((s,x)=>s+x.balance,0);
 $('kIncome').textContent=cash(inc);$('kExpense').textContent=cash(out);$('kFlow').textContent=cash(inc-out);$('kWorth').textContent=cash(av-dv);$('kAssets').textContent=cash(av);$('kDebt').textContent=cash(dv);$('kBusinesses').textContent=db.businesses.length;$('kTransactions').textContent=tx.length;
 let months=[];for(let i=5;i>=0;i--){let d=new Date();d.setDate(1);d.setMonth(d.getMonth()-i);let key=d.toISOString().slice(0,7);let list=tx.filter(t=>(t.date||'').startsWith(key));months.push({key,label:d.toLocaleDateString('en',{month:'short'}),net:list.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0)-list.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0)})}
 let max=Math.max(1,...months.map(x=>Math.abs(x.net)));$('cashChart').innerHTML=months.map(m=>`<div class="barwrap"><div class="bar" title="${cash(m.net)}" style="height:${Math.max(3,Math.abs(m.net)/max*82)}px;opacity:${m.net<0?.55:1}"></div><small>${m.label}</small></div>`).join('');$('monthLabel').textContent='Last 6 months';
 $('recent').innerHTML=tx.slice(0,6).map(t=>`<div class="quickrow"><span>${esc(t.date)} · ${esc(t.category)} · ${esc(t.description||t.reference||'')}</span><b class="${t.type}">${t.type==='expense'?'−':'+'}${cash(t.amount)}</b></div>`).join('')||'<div class="empty">No transactions recorded.</div>';
 let search=$('txSearch').value.toLowerCase(),type=$('txType').value,channel=$('txChannel').value;
 let shown=tx.filter(t=>(type==='all'||t.type===type)&&(channel==='all'||t.account===channel)&&JSON.stringify(t).toLowerCase().includes(search));
 $('txRows').innerHTML=shown.map(t=>`<tr><td>${esc(t.date)}</td><td class="${t.type}">${esc(t.type)}</td><td>${esc(t.category)}</td><td>${esc(t.description||'')} ${t.reference?'· '+esc(t.reference):''}</td><td>${esc(t.account)}</td><td class="right">${cash(t.amount)}</td><td><button class="danger" onclick="del('transactions','${t.id}')">Delete</button></td></tr>`).join('');$('txEmpty').style.display=shown.length?'none':'block';
 $('businessList').innerHTML=db.businesses.map(b=>card(b.name,`${b.industry||'Business'} · ${b.reference||'No reference'}`,filtered(db.transactions).filter(t=>t.businessId===b.id&&t.type==='income').reduce((s,t)=>s+t.amount,0)-filtered(db.transactions).filter(t=>t.businessId===b.id&&t.type==='expense').reduce((s,t)=>s+t.amount,0),`<span class="muted">Net recorded cash flow</span><button onclick="del('businesses','${b.id}')">Delete</button>`)).join('')||'<div class="card empty">Add your first business.</div>';
 $('assetList').innerHTML=assets.map(a=>card(a.name,`${a.kind} · ${a.scope==='business'?businessName(a.businessId):'Personal'} · Cost ${cash(a.cost)}`,a.value,`<span class="muted">Change in value: ${cash(a.value-a.cost)}</span><button onclick="del('assets','${a.id}')">Delete</button>`)).join('')||'<div class="card empty">No assets or investments added yet.</div>';
 $('debtList').innerHTML=debts.map(d=>card(d.name,`${d.kind||'Debt'} · ${d.rate||0}% p.a. · Due ${d.due||'not set'}`,d.balance,`<button class="subbtn" onclick="repay('${d.id}')">＋ Log repayment</button><button onclick="del('debts','${d.id}')">Delete</button>`)).join('')||'<div class="card empty">No debts recorded.</div>';
 renderReport();
}
window.del=del;
window.repay=id=>{let d=db.debts.find(x=>x.id===id);if(!d)return;let amt=Number(prompt(`Repayment amount in KES. Current balance: ${cash(d.balance)}`));if(!amt||amt<=0||amt>d.balance){alert('Enter a positive amount no greater than the outstanding balance.');return}let date=prompt('Payment date (YYYY-MM-DD)',today());if(!date)return;d.balance=Math.max(0,d.balance-amt);db.repayments.unshift({id:uid(),debtId:id,name:d.name,amount:amt,date,scope:d.scope||'personal',businessId:d.businessId||''});db.transactions.unshift({id:uid(),type:'expense',amount:amt,date,category:'Debt repayment',account:'M-Pesa',scope:d.scope||'personal',businessId:d.businessId||'',description:`Repayment to ${d.name}`,reference:'Debt payment'});save()};
['txSearch','txType','txChannel'].forEach(id=>$(id).addEventListener(id==='txSearch'?'input':'change',render));
function renderReport(){let month=$('reportMonth').value||today().slice(0,7),t=filtered(db.transactions).filter(x=>(x.date||'').startsWith(month)),r=db.repayments.filter(x=>(x.date||'').startsWith(month)&&visible(x)),i=t.filter(x=>x.type==='income').reduce((s,x)=>s+x.amount,0),o=t.filter(x=>x.type==='expense'&&x.category!=='Debt repayment').reduce((s,x)=>s+x.amount,0),rp=r.reduce((s,x)=>s+x.amount,0);$('rIncome').textContent=cash(i);$('rExpense').textContent=cash(o);$('rFlow').textContent=cash(i-o-rp);$('rRepay').textContent=cash(rp);
 let cats={};t.filter(x=>x.type==='expense'&&x.category!=='Debt repayment').forEach(x=>cats[x.category]=(cats[x.category]||0)+x.amount);$('categoryReport').innerHTML=Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="reportline"><span>${esc(k)}</span><b>${cash(v)}</b></div>`).join('')||'<p class="note">No expenses for this month.</p>';
 $('businessReport').innerHTML=db.businesses.map(b=>{let q=t.filter(x=>x.businessId===b.id),bi=q.filter(x=>x.type==='income').reduce((s,x)=>s+x.amount,0),be=q.filter(x=>x.type==='expense').reduce((s,x)=>s+x.amount,0);return `<div class="reportline"><span>${esc(b.name)}</span><b>${cash(bi-be)}</b></div>`}).join('')||'<p class="note">Add a business to see its report.</p>';
}
$('reportMonth').value=today().slice(0,7);$('reportMonth').onchange=renderReport;
function download(name,content,type){let a=document.createElement('a'),u=URL.createObjectURL(new Blob([content],{type}));a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}
function csv(rows){return rows.map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\n')}
$('backupBtn').onclick=()=>download('thee-onset-v2-backup-'+today()+'.json',JSON.stringify(db,null,2),'application/json');
$('restoreFile').onchange=async e=>{let f=e.target.files[0];if(!f)return;try{let x=JSON.parse(await f.text());if(!Array.isArray(x.transactions)||!Array.isArray(x.businesses)||!Array.isArray(x.assets)||!Array.isArray(x.debts))throw Error('Backup format not recognised');if(confirm('Replace all current local records with this backup?')){db={...blank(),...x};save()}}catch(err){alert('Restore failed: '+err.message)}e.target.value=''};
$('txCsv').onclick=()=>download('thee-onset-transactions.csv',csv([['date','type','amount','category','account','scope','business','reference','description'],...db.transactions.map(t=>[t.date,t.type,t.amount,t.category,t.account,t.scope,businessName(t.businessId),t.reference,t.description])]),'text/csv');
$('exportReport').onclick=()=>{let m=$('reportMonth').value,arr=db.transactions.filter(t=>(t.date||'').startsWith(m)&&visible(t));download(`thee-onset-report-${m}.csv`,csv([['date','type','amount','category','business','account','description'],...arr.map(t=>[t.date,t.type,t.amount,t.category,businessName(t.businessId),t.account,t.description])]),'text/csv')};
$('currency').value=db.currency||'KES';$('currency').onchange=e=>{db.currency=e.target.value;save()};
$('mpesaImport').onclick=()=>$('mpesaFile').click();
$('mpesaFile').onchange=async e=>{let f=e.target.files[0];if(!f)return;try{let txt=await f.text(),lines=txt.split(/\r?\n/).filter(Boolean),rows=lines.map(line=>{let out=[],cur='',q=false;for(let i=0;i<line.length;i++){let c=line[i];if(c==='"'){if(q&&line[i+1]==='"'){cur+='"';i++}else q=!q}else if(c===','&&!q){out.push(cur);cur=''}else cur+=c}out.push(cur);return out});let head=rows.shift().map(x=>x.toLowerCase().trim());let idx=(terms)=>head.findIndex(h=>terms.some(t=>h.includes(t)));let di=idx(['date','completion time','time']),ai=idx(['amount','paid in','paid out','withdrawn','deposit']),ti=idx(['transaction type','type']),desc=idx(['details','description','transaction details','other party']),ref=idx(['receipt','code','transaction id']);if(di<0||ai<0)throw Error('Could not identify date and amount columns.');let added=0;rows.forEach(r=>{let raw=(r[ai]||'').replace(/[^\d.-]/g,''),amt=Math.abs(Number(raw));if(!amt)return;let date=(r[di]||'').slice(0,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(date)){let d=new Date(r[di]);if(!isNaN(d))date=d.toISOString().slice(0,10);else return}let typ=ti>=0&&/receive|deposit|in/i.test(r[ti])?'income':'expense';db.transactions.push({id:uid(),type:typ,amount:amt,date,category:'M-Pesa import',account:'M-Pesa',scope:'personal',businessId:'',reference:ref>=0?r[ref]:'',description:desc>=0?r[desc]:'Imported M-Pesa record'});added++});save();alert(`Imported ${added} row(s). Please review transaction types and amounts.`)}catch(err){alert('Import issue: '+err.message)}e.target.value=''};
let deferred;$('installBtn').classList.add('hidden');window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;$('installBtn').classList.remove('hidden')});$('installBtn').onclick=async()=>{if(deferred){deferred.prompt();deferred=null}else alert('Open Chrome menu and choose Add to Home screen.')};
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
render();
