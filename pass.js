// "You want to pass? Try it" — JLPT N5–N1 self level check (kanji / vocabulary / grammar).
// Data: pass/pass-nX.json {k:[kanji,on,kun,en,ne], v:[word,reading,en,ne], g:[pattern,ne,example,translation]}
// Strokes: pass/strokes-nX.json {kanji:[svg path d...]} from KanjiVG (CC BY-SA 3.0, Ulrich Apel).
(function(){
const $=s=>document.querySelector(s);const shell=(a,b)=>window.PSH.shell(a,b);
const LV=['n5','n4','n3','n2','n1'];
const KIND={k:['漢字','Kanji'],v:['語彙','Vocabulary'],g:['文法','Grammar']};
const PER=100;
const PD={},SD={};
const PS={lv:'n5',kind:'k',page:0};
try{Object.assign(PS,JSON.parse(localStorage.getItem('rk_passui')||'{}'))}catch(e){}
const saveUI=()=>{try{localStorage.setItem('rk_passui',JSON.stringify(PS))}catch(e){}};
const keyOf=(lv,kind)=>(lv==='n3'&&kind==='g'?'rk_pass4_':'rk_pass3_')+lv+'_'+kind;
function getSet(lv,kind){try{return new Set(JSON.parse(localStorage.getItem(keyOf(lv,kind))||'[]'))}catch(e){return new Set()}}
function putSet(lv,kind,s){try{localStorage.setItem(keyOf(lv,kind),JSON.stringify([...s]))}catch(e){}}
async function load(lv){if(!PD[lv])PD[lv]=await fetch('pass/pass-'+lv+'.json').then(r=>r.json());return PD[lv]}
async function strokes(lv){if(!SD[lv])SD[lv]=await fetch('pass/strokes-'+lv+'.json').then(r=>r.json());return SD[lv]}
let KMAP=null;
async function kmap(){if(!KMAP)KMAP=await fetch('pass/kmap.json').then(r=>r.json());return KMAP}

const CSS=`
.ps-hero{background:var(--grad);color:#fff;border-radius:22px;padding:18px 18px 16px;margin:6px 0 14px}
.ps-hero h1{margin:0 0 4px;font-size:clamp(20px,5.4vw,28px)}.ps-hero p{margin:0;opacity:.9;font-size:14px;line-height:1.55}
.ps-row{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 10px}
.ps-row button{border:1.5px solid var(--line);background:var(--paper);color:var(--ink);border-radius:999px;padding:8px 14px;font-weight:800;font-size:14px;cursor:pointer}
.ps-row button.on{background:var(--grad,var(--ai));border-color:transparent;color:#fff;box-shadow:0 6px 16px rgba(53,39,201,.35);transform:scale(1.06)}
.ps-row button[data-lv].on::before{content:'✓ '}
.ps-note{font-size:13px;color:var(--muted);margin:4px 0 10px;line-height:1.5}
.ps-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));border:2px solid #555;border-radius:4px;overflow:hidden;gap:2px;background:#555}
.ps-cell{background:#cfe3fb;padding:7px 8px 9px;min-height:66px;display:flex;flex-direction:column;gap:3px;cursor:pointer;position:relative}
.ps-n2 .ps-cell,.ps-n1 .ps-cell{background:#d3f7e6}.ps-n3 .ps-cell{background:#fff1c9}
.ps-cell.on{background:#ffd9e3!important}
.ps-cell .top{display:flex;align-items:center;gap:6px;font-size:14px;color:#223;font-variant-numeric:tabular-nums}
.ps-cell input{width:20px;height:20px;margin:0;accent-color:var(--shu);flex:none}
.ps-cell .w{font:500 19px/1.25 var(--f-jp);color:#111;word-break:break-all}
.ps-cell .w.kj{font-size:30px;text-align:center}
.ps-cell .i{position:absolute;right:6px;top:6px;font-size:11px;color:#556;border:1px solid #889;border-radius:50%;width:18px;height:18px;display:grid;place-items:center;background:#fff8}
[data-theme=dark] .ps-cell{filter:brightness(.92)}
.ps-gl{border:1.5px solid var(--line);border-radius:14px;overflow:hidden;background:var(--paper)}
.ps-gr{display:flex;align-items:stretch;border-top:1px solid var(--line)}.ps-gr:first-child{border-top:0}
.ps-gr label{display:grid;place-items:center;width:52px;flex:none;border-right:1px solid var(--line);cursor:pointer}
.ps-gr input{width:24px;height:24px;accent-color:var(--ai)}
.ps-gr a{flex:1;padding:11px 12px;text-decoration:none;color:var(--ink)}
.ps-gr a b{font:600 17px var(--f-jp);color:var(--ai);display:block}.ps-gr a span{font-size:13.5px;color:var(--muted)}
.ps-gr.on{background:var(--ok-soft)}
.ps-pager{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:12px 0}
.ps-pager button{min-width:42px;border:1.5px solid var(--line);background:var(--paper);color:var(--ink);border-radius:10px;padding:7px 8px;font-weight:700;cursor:pointer}
.ps-units{flex-wrap:nowrap;overflow-x:auto;padding-bottom:6px;scrollbar-width:thin}.ps-units .ps-note{flex:none}.ps-units button{flex:none;display:flex;flex-direction:column;align-items:center;line-height:1.1;min-width:44px}.ps-units button small{font-size:10px;opacity:.7;font-weight:600}.ps-uh{margin:6px 0 8px;font-size:18px}.ps-uh small{color:var(--muted);font-weight:600}
.ps-pager button.on{background:var(--ink);color:var(--paper)}
.ps-bar{position:sticky;bottom:72px;z-index:5;display:flex;gap:8px;align-items:center;flex-wrap:wrap;background:var(--paper);border:1.5px solid var(--line);border-radius:16px;padding:10px;box-shadow:var(--shadow);margin:14px 0}
.ps-end{display:flex;justify-content:center;margin:18px 0 8px}.ps-end .btn{min-width:220px;padding:14px 22px;font-size:17px}.ps-bar .cnt{flex:1;font-weight:700;font-size:13.5px;min-width:90px}.ps-bar .btn{padding:9px 12px;font-size:14px}
.ps-check{background:#000080!important;color:#fff!important;padding:12px 28px!important;border-radius:6px!important;font-size:17px!important}
.ps-res{padding:16px;margin:12px 0}
.ps-res h2{margin:0 0 6px}.ps-big{font:900 44px/1 var(--f-disp);color:var(--ai)}
.ps-meter{height:12px;border-radius:99px;background:var(--line);overflow:hidden;margin:6px 0 2px}.ps-meter i{display:block;height:100%;background:linear-gradient(90deg,#0c9a60,#3d3df5)}
.ps-ok{color:var(--ok);font-weight:800}.ps-ng{color:var(--shu);font-weight:800}
.ps-tbl{width:100%;border-collapse:collapse;font-size:14px;margin:10px 0}
.ps-tbl th{background:#3a3d55;color:#fff;padding:9px 6px;font-weight:700}
.ps-tbl td{border:1px solid var(--line);padding:9px 6px;text-align:center}
.ps-tbl tr.me td{background:var(--shu-soft);font-weight:800}
.ps-tbl td:first-child{background:#3a3d55;color:#fff;font-weight:800}
.ps-modal{position:fixed;inset:0;background:rgba(10,12,30,.55);z-index:60;display:flex;align-items:flex-end;justify-content:center}
.ps-sheet{background:var(--paper);color:var(--ink);width:min(560px,100%);max-height:88vh;overflow:auto;border-radius:22px 22px 0 0;padding:18px 18px 26px}
@media(min-width:700px){.ps-modal{align-items:center}.ps-sheet{border-radius:22px}}
.ps-sheet .x{float:right;border:0;background:var(--ai-soft);color:var(--ai);width:36px;height:36px;border-radius:50%;font-size:18px;cursor:pointer}
.ps-kj{display:flex;gap:16px;align-items:center;flex-wrap:wrap}
.ps-svg{width:150px;height:150px;border:1.5px solid var(--line);border-radius:14px;background:
 linear-gradient(var(--line),var(--line)) 50% 0/1px 100% no-repeat,linear-gradient(var(--line),var(--line)) 0 50%/100% 1px no-repeat,#fffef8}
.ps-svg path{fill:none;stroke:#111;stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round}
.ps-svg text{font-size:8px;fill:#e81f55;font-family:sans-serif}
.ps-kv{font-size:15px;line-height:1.75}.ps-kv b{display:inline-block;min-width:92px;color:var(--muted);font-weight:700}
.ps-ne{font-size:20px;font-weight:800;color:var(--shu);margin:6px 0}
.ps-kbtns{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.ps-kbtns button{font:700 22px var(--f-jp);border:1.5px solid var(--line);background:var(--paper);color:var(--ink);border-radius:12px;width:48px;height:48px;cursor:pointer}
.ps-ex{background:var(--ai-soft);border-radius:14px;padding:12px;margin:10px 0}.ps-ex .jp{font:600 17px/1.7 var(--f-jp)}.ps-ex .nep{color:var(--muted);margin-top:4px}
.ps-h{margin:0 0 10px;font-size:19px}.ps-h small{font:600 14px var(--f-jp);color:var(--muted);margin-left:6px}
.ps-use{margin:0 0 14px}.ps-use .t{font-weight:800;font-size:16px;display:flex;gap:8px;align-items:center}.ps-use .t span{background:var(--ai);color:#fff;border-radius:50%;width:24px;height:24px;display:grid;place-items:center;font-size:13px;flex:none}
.ps-use p{margin:6px 0;line-height:1.6;font-size:14.5px}
.ps-ex rt,.ps-pr rt,.ps-ftbl rt{font-size:.55em;color:var(--muted)}
.ps-ftbl .r{border:1.5px solid var(--line);border-radius:12px;overflow:hidden;margin:0 0 8px}.ps-ftbl .l{background:#3a3d55;color:#fff;padding:7px 10px;font-weight:700;font-size:14px}.ps-ftbl .c{padding:8px 10px;font:500 17px/2 var(--f-jp)}
.ps-pr{padding-left:22px;margin:0 0 12px}.ps-pr li{padding:10px 8px;border-bottom:1px solid var(--line);border-radius:8px}.ps-pr li.ok{background:var(--ok-soft)}.ps-pr li.ng{background:var(--shu-soft)}
.ps-pr .q{font:500 17px/2.1 var(--f-jp)}.ps-pr .m{font-size:13px;color:var(--muted)}.ps-pr .a{font-size:14px;margin-top:3px}.ps-pr .a b{font-family:var(--f-jp);color:var(--ai)}
.ps-ops{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0 4px}.ps-ops button{display:flex;gap:8px;align-items:center;text-align:left;font:600 15.5px var(--f-jp);padding:10px 12px;border-radius:12px;border:2px solid var(--line);background:var(--paper);color:var(--ink);cursor:pointer}.ps-ops button i{font:800 12px var(--f-ui,sans-serif);font-style:normal;background:var(--ai-soft);color:var(--ai);border-radius:50%;width:22px;height:22px;display:grid;place-items:center;flex:none}.ps-ops button.sel{border-color:var(--ai);background:var(--ai-soft)}.ps-ops button.right{border-color:var(--ok);background:var(--ok-soft)}.ps-ops button.wrong{border-color:var(--shu);background:var(--shu-soft)}
.ps-bl{color:var(--ai);font-weight:700}.ps-why{margin-top:6px;font-size:14px;line-height:1.6}.ps-why p{margin:4px 0}
.ps-lg{display:inline-block;font:800 10.5px sans-serif;letter-spacing:.5px;background:var(--ai);color:#fff;border-radius:6px;padding:1px 6px;vertical-align:2px}.ps-lg.ne{background:var(--shu)}
.ps-nebox{border:1px dashed var(--shu);border-radius:14px;padding:10px 12px;margin:0 0 14px;background:var(--shu-soft)}.ps-nebox .lb{font-size:12px;font-weight:800;color:var(--shu);margin-bottom:2px}
.ps-hw{display:grid;gap:10px}.ps-hw label{display:grid;gap:4px;font-weight:700;font-size:13px}.ps-hw textarea{font:500 16px/1.6 var(--f-jp);border:2px solid var(--line);border-radius:12px;padding:8px 10px;background:var(--paper);color:var(--ink);resize:vertical;width:100%;box-sizing:border-box}.ps-hw textarea:focus{border-color:var(--ai);outline:0}
.ps-hwi .hd{display:flex;justify-content:space-between;gap:8px;align-items:center}.ps-hwi .hd b{font-family:var(--f-jp)}.ps-hwi .st{font-size:12px;font-weight:800;padding:3px 8px;border-radius:99px;background:var(--gold-soft,#fff3c4);color:#7a5a00}.ps-hwi .st.ok{background:var(--ok-soft);color:var(--ok)}.ps-hwi ol{font:500 16px/1.8 var(--f-jp);margin:8px 0}.ps-hwi .cm{background:var(--ai-soft);border-radius:10px;padding:8px 10px;margin:6px 0}
@media(max-width:480px){.ps-ops{grid-template-columns:1fr}}
.ps-in{font:600 16px var(--f-jp);width:8.5em;max-width:60vw;border:0;border-bottom:2px solid var(--ai);background:var(--ai-soft);color:var(--ink);padding:3px 6px;border-radius:6px 6px 0 0;margin:0 3px}
.kc{margin-top:6px;border:3px solid #4471c4;border-radius:14px;overflow:hidden;background:#fff;color:#111}
.kc-top{display:flex;justify-content:space-between;align-items:center;padding:10px 12px 0}.kc-st{font-size:12.5px;color:#556}
.kc-lv{display:inline-block;background:#4471c4;color:#fff;font:800 14px/1 var(--f-ui,sans-serif);padding:6px 10px;border-radius:6px;font-style:normal}
.kc-lv.kc-n4{background:#0c9a60}.kc-lv.kc-n3{background:#d98a00}.kc-lv.kc-n2{background:#c2185b}.kc-lv.kc-n1{background:#5e35b1}
.kc-w .kc-lv{font-size:10.5px;padding:3px 5px;margin-left:6px;vertical-align:2px}
.kc-main{display:flex;justify-content:center;align-items:center;gap:18px;padding:8px 10px 12px}.kc-big{font:700 104px/1 var(--f-jp)}.kc .ps-svg{width:120px;height:120px}
.kc-mean{background:#4471c4;color:#fff;text-align:center;padding:10px 12px}.kc-mean .ne{font-size:21px;font-weight:800}.kc-mean .en{font-size:15.5px;opacity:.95;margin-top:2px}
.kc-rds{display:grid;grid-template-columns:1fr 1fr}.kc-rd{padding:12px 8px;text-align:center}.kc-rd+.kc-rd{border-left:3px dashed #4471c4}
.kc-rd .h{display:inline-block;background:#e4e6ea;border:1.5px solid #888;font-weight:800;font-style:italic;padding:4px 12px;margin-bottom:6px;font-size:14px}
.kc-rd .r{font:500 17px/1.5 var(--f-jp)}.kc-rd .r span{display:block;font:400 13px var(--f-ui,sans-serif);color:#555}
.kc-wh{background:#7a8f9c;color:#fff;text-align:center;font-weight:800;padding:8px}
.kc-ws{display:grid;grid-template-columns:1fr 1fr;gap:0}.kc-w{padding:8px 10px;border-bottom:1px solid #e3e6ee}.kc-w:nth-child(odd){border-right:2px dashed #4471c4}
.kc-w .j{font:500 15px/1.5 var(--f-jp)}.kc-w .j b{font-size:17px}.kc-w .m{font-size:13px;color:#333}.kc-w .m span{color:#667}
@media(max-width:420px){.kc-ws{grid-template-columns:1fr}.kc-w:nth-child(odd){border-right:0}.kc-big{font-size:88px}}
.ps-credit{font-size:11.5px;color:var(--muted);margin:18px 0 0;line-height:1.5}
`;
function css(){if(!document.getElementById('psCss')){const s=document.createElement('style');s.id='psCss';s.textContent=CSS;document.head.appendChild(s)}}
const RD=s=>String(s||'').replace(/([^\s.]+)\.([^\s]+)/g,'$1($2)');
const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const LVINFO={n1:['900','2,000','10,000'],n2:['600','1,000','6,000'],n3:['450','700','3,500'],n4:['300','300','1,500'],n5:['150','100','800']};

function head(){return `<section class="ps-hero"><h1>You want to pass? Try it 🎯</h1><p>How many kanji, words and grammar points do you know? Tick ✓ the ones you know and press <b>Check!</b> Tap a word to see its meaning and stroke order.</p><p><a href="#pass/hw" style="color:inherit;font-weight:800">📒 My homework →</a></p></section>`}
function tabs(){
  return `<div class="ps-row">${LV.map(l=>`<button data-lv="${l}" class="${PS.lv===l?'on':''}">${l.toUpperCase()}</button>`).join('')}</div>
  <div class="ps-row">${Object.keys(KIND).map(k=>`<button data-kind="${k}" class="${PS.kind===k?'on':''}">${KIND[k][0]} · ${KIND[k][1]}</button>`).join('')}<button data-kind="r" class="${PS.kind==='r'?'on':''}">📊 結果 Result</button></div>`;
}
function itemsOf(d,kind){return d[kind]||[]}
function label(kind,x){return kind==='k'?x[0]:kind==='v'?x[0].split(';')[0].trim():x[0]}

window.renderPass=async function(){
  css();
  const parts=(location.hash.slice(1)).split('/');
  if(parts[1]==='g'&&parts[2]&&parts[3]!=null)return grammarPage(parts[2],+parts[3]);
  if(parts[1]==='hw')return hwPage();
  shell('pass',head()+tabs()+'<div id="psBody"><div class="bp-inl"><span class="bp-spin"></span>Loading… please wait</div></div>');
  bindTabs();
  if(PS.kind==='r')return results();
  let d;try{d=await load(PS.lv)}catch(e){$('#psBody').innerHTML='<p class="ps-note">Could not load the data. Please check your internet.</p>';return}
  const L=itemsOf(d,PS.kind),S=getSet(PS.lv,PS.kind),UN=d[PS.kind+'u'],pages=UN?UN.length:Math.ceil(L.length/PER);
  if(PS.page>=pages)PS.page=0;
  const a=UN?UN[PS.page][1]:PS.page*PER,b=UN?UN[PS.page][2]:Math.min(L.length,a+PER);
  const pager=UN?`<div class="ps-pager ps-units"><span class="ps-note" style="margin:0 6px 0 0">Unit:</span>${UN.map((u,i)=>`<button data-pg="${i}" class="${i===PS.page?'on':''}">${E(u[0].replace('Unit ',''))}<small>${u[2]-u[1]}</small></button>`).join('')}</div><h3 class="ps-uh">${E(UN[PS.page][0])} <small>(${b-a})</small></h3>`:pages>1?`<div class="ps-pager"><span class="ps-note" style="margin:0 6px 0 0">Page:</span>${Array.from({length:pages},(_,i)=>`<button data-pg="${i}" class="${i===PS.page?'on':''}">${i*PER+1}–${Math.min(L.length,(i+1)*PER)}</button>`).join('')}</div>`:'';
  let body;
  if(PS.kind==='g'){
    body=`<p class="ps-note">Tick ✓ the grammar you know. Tap a name to open its meaning and examples.</p><div class="ps-gl">${L.slice(a,b).map((x,j)=>{const i=a+j;return `<div class="ps-gr ${S.has(i)?'on':''}"><label><input type="checkbox" data-i="${i}" ${S.has(i)?'checked':''} aria-label="${E(x[0])}"></label><a href="#pass/g/${PS.lv}/${i}"><b>${i-a+1}. ${E(x[0])}</b><span>${E(x[1])}</span></a></div>`}).join('')}</div>`;
  }else{
    body=`<p class="ps-note">Tick ✓ the ${PS.kind==='k'?'kanji':'words'} you can read and understand. Tap ⓘ to see the meaning${PS.kind==='k'?' and stroke order':''}.</p><div class="ps-grid ps-${PS.lv}">${L.slice(a,b).map((x,j)=>{const i=a+j;return `<div class="ps-cell ${S.has(i)?'on':''}" data-c="${i}"><div class="top"><span>${String(i-a+1).padStart(2,'0')}</span><input type="checkbox" data-i="${i}" ${S.has(i)?'checked':''} aria-label="${E(label(PS.kind,x))}"></div><div class="w ${PS.kind==='k'?'kj':''}">${E(label(PS.kind,x))}</div><span class="i" data-inf="${i}">i</span></div>`}).join('')}</div>`;
  }
  $('#psBody').innerHTML=pager+body+(UN?nextU(UN,PS.page):pager)+`<div class="ps-end"><button class="btn ps-check" id="psCheck">Check! ✓</button></div>`+credit();
  const cnt=()=>{};
  const toggle=(i,on)=>{on?S.add(i):S.delete(i);putSet(PS.lv,PS.kind,S);const inp=document.querySelector(`input[data-i="${i}"]`);if(inp){inp.checked=on;(inp.closest('.ps-cell')||inp.closest('.ps-gr')).classList.toggle('on',on)}cnt()};
  document.querySelectorAll('#psBody input[data-i]').forEach(x=>x.onchange=()=>toggle(+x.dataset.i,x.checked));
  document.querySelectorAll('#psBody .ps-cell').forEach(c=>c.onclick=e=>{
    if(e.target.matches('input'))return;
    const i=+c.dataset.c;
    if(e.target.dataset.inf!=null||e.target.closest('.w'))return info(PS.kind,PS.lv,i);
    toggle(i,!S.has(i));
  });
  document.querySelectorAll('[data-pg]').forEach(x=>x.onclick=()=>{PS.page=+x.dataset.pg;saveUI();renderPass();window.scrollTo(0,0)});
  $('#psCheck').onclick=()=>{PS.kind='r';saveUI();renderPass();window.scrollTo(0,0)};
};
function nextU(UN,p){return `<div class="ps-pager" style="justify-content:space-between">${p>0?`<button data-pg="${p-1}">← ${E(UN[p-1][0])}</button>`:"<span></span>"}${p<UN.length-1?`<button data-pg="${p+1}" class="on">${E(UN[p+1][0])} →</button>`:""}</div>`}
function bindTabs(){
  document.querySelectorAll('[data-lv]').forEach(x=>x.onclick=()=>{if(PS.lv===x.dataset.lv)return;PS.lv=x.dataset.lv;PS.page=0;saveUI();const big=!PD[PS.lv];if(big&&window.BPLoad)BPLoad(true,'Loading '+PS.lv.toUpperCase()+'…');Promise.resolve(renderPass()).finally(()=>{window.BPLoad&&BPLoad(false)})});
  document.querySelectorAll('[data-kind]').forEach(x=>x.onclick=()=>{PS.kind=x.dataset.kind;PS.page=0;saveUI();if(!PD[PS.lv]&&window.BPLoad)BPLoad(true);Promise.resolve(renderPass()).finally(()=>{window.BPLoad&&BPLoad(false)})});
}
function credit(){return `<p class="ps-credit">Sources: kanji list <a href="https://github.com/davidluzgouveia/kanji-data">kanji-data</a> (MIT), word list <a href="https://github.com/jamsinclair/open-anki-jlpt-decks">open-anki-jlpt-decks</a> (MIT), stroke order <a href="https://kanjivg.tagaini.net">KanjiVG</a> © Ulrich Apel (CC BY-SA 3.0). Nepali meanings and grammar: BP Nihongo Hub.</p>`}

async function results(){
  const rows=[];let est=null;
  for(const lv of LV){
    let d;try{d=await load(lv)}catch(e){continue}
    const r={lv};for(const k of ['k','v','g']){r[k]=[getSet(lv,k).size,(d[k]||[]).length]}
    r.p=Math.round(100*(r.k[0]+r.v[0]+r.g[0])/Math.max(1,r.k[1]+r.v[1]+r.g[1]));rows.push(r);
  }
  // estimated level: hardest level where this and every easier level is at least 60%
  let ok=true;for(const r of rows){if(ok&&r.p>=60)est=r.lv;else ok=false}
  const cur=rows.find(r=>r.lv===PS.lv)||rows[0];
  const pct=([a,b])=>b?Math.round(100*a/b):0;
  const line=(k)=>{const [a,b]=cur[k];return `<div style="margin:10px 0"><div style="display:flex;justify-content:space-between;font-weight:700"><span>${KIND[k][0]} ${KIND[k][1]}</span><span><span class="ps-ok">✓ ${a}</span> · <span class="ps-ng">✗ ${b-a}</span> / ${b}</span></div><div class="ps-meter"><i style="width:${pct(cur[k])}%"></i></div></div>`};
  $('#psBody').innerHTML=`<div class="card ps-res"><h2>${cur.lv.toUpperCase()} Result</h2><div class="ps-big">${cur.p}%</div>${line('k')}${line('v')}${line('g')}
  <p class="ps-note">✓ = I know it, ✗ = not yet (study more).</p></div>
  <div class="card ps-res"><h2>Your estimated level</h2><div class="ps-big" style="color:var(--shu)">${est?est.toUpperCase():'Below N5'}</div>
  <p class="ps-note">You reach a level when you know 60% or more of that level and of every easier level. Tick ✓ the lists of the other levels too.</p>
  <table class="ps-tbl"><tr><th>JLPT</th><th>Kanji</th><th>Words</th><th>Grammar</th><th>%</th></tr>${rows.slice().reverse().map(r=>`<tr class="${r.lv===est?'me':''}"><td>${r.lv.toUpperCase()}</td><td>${r.k[0]}/${r.k[1]}</td><td>${r.v[0]}/${r.v[1]}</td><td>${r.g[0]}/${r.g[1]}</td><td>${r.p}%</td></tr>`).join('')}</table>
  <h3 style="margin:16px 0 4px">JLPT levels and study needed</h3>
  <table class="ps-tbl"><tr><th>JLPT</th><th>Study time</th><th>Kanji</th><th>Words</th></tr>${LV.slice().reverse().map(l=>`<tr><td>${l.toUpperCase()}</td><td>${LVINFO[l][0]} h</td><td>~${LVINFO[l][1]}</td><td>~${LVINFO[l][2]}</td></tr>`).join('')}</table>
  <p class="ps-note">Lists on this site: N5 kanji 103 / words 718, N4 144/668, N3 366/2140, N2 367/1906, N1 1232/2699 (each level has only its own items, nothing repeats; words with higher-level kanji are shown in hiragana).</p></div>
  <button class="btn ghost" id="psWrong">Show only ✗ ${KIND.k[1]}/${KIND.v[1]} I don't know</button><div id="psWL"></div>`+credit();
  $('#psWrong').onclick=async()=>{
    const d=await load(cur.lv);let h='';
    for(const k of ['k','v']){const S=getSet(cur.lv,k);const L=d[k].map((x,i)=>[x,i]).filter(([x,i])=>!S.has(i));
      h+=`<h3>${KIND[k][1]} ✗ ${L.length}</h3><div class="ps-grid ps-${cur.lv}">${L.slice(0,300).map(([x,i])=>`<div class="ps-cell" data-k="${k}" data-c="${i}"><div class="top"><span>${String(i+1).padStart(3,'0')}</span></div><div class="w ${k==='k'?'kj':''}">${E(label(k,x))}</div><span class="i">i</span></div>`).join('')}</div>${L.length>300?'<p class="ps-note">Showing the first 300 only.</p>':''}`}
    $('#psWL').innerHTML=h;
    document.querySelectorAll('#psWL .ps-cell').forEach(c=>c.onclick=()=>info(c.dataset.k,cur.lv,+c.dataset.c));
  };
}

function modal(html){
  const m=document.createElement('div');m.className='ps-modal';m.innerHTML=`<div class="ps-sheet" role="dialog" aria-modal="true"><button class="x" aria-label="Close">✕</button>${html}</div>`;
  document.body.appendChild(m);const close=()=>m.remove();m.onclick=e=>{if(e.target===m)close()};m.querySelector('.x').onclick=close;
  return m;
}
async function kanjiBlock(ch,lvHint){
  let lv=lvHint,d,x;
  if(lv){d=await load(lv);x=d.k.find(y=>y[0]===ch)}
  if(!x){const M=await kmap();lv=M[ch];if(!lv)return null;d=await load(lv);x=d.k.find(y=>y[0]===ch)}
  if(!x)return null;
  const S=await strokes(lv).catch(()=>({}));const P=S[ch]||[];
  return {lv,x,P};
}
function svgOf(P){
  return `<svg class="ps-svg" viewBox="0 0 109 109" aria-label="stroke order">${P.map((d,i)=>`<path d="${d}" style="stroke-dasharray:400;stroke-dashoffset:400"/>`).join('')}</svg>`;
}
function animate(svg){
  if(!svg)return;const ps=[...svg.querySelectorAll('path')];let t=0;
  ps.forEach(p=>{let L=400;try{L=Math.ceil(p.getTotalLength())+2}catch(e){}p.style.transition='none';p.style.strokeDasharray=L;p.style.strokeDashoffset=L});
  svg.getBoundingClientRect();
  ps.forEach((p,i)=>{const L=+p.style.strokeDasharray.split(',')[0]||400;const dur=Math.max(.25,L/120);setTimeout(()=>{p.style.transition=`stroke-dashoffset ${dur}s linear`;p.style.strokeDashoffset=0},t*1000);t+=dur+.12});
}
let KW=null;async function kwords(){if(!KW)KW=await fetch('pass/kw.json').then(r=>r.json()).catch(()=>({}));return KW}
const RM=(()=>{const m={};const base='あa い i う u え e お o か ka き ki く ku け ke こ ko さ sa し shi す su せ se そ so た ta ち chi つ tsu て te と to な na に ni ぬ nu ね ne の no は ha ひ hi ふ fu へ he ほ ho ま ma み mi む mu め me も mo や ya ゆ yu よ yo ら ra り ri る ru れ re ろ ro わ wa を o ん n が ga ぎ gi ぐ gu げ ge ご go ざ za じ ji ず zu ぜ ze ぞ zo だ da ぢ ji づ zu で de ど do ば ba び bi ぶ bu べ be ぼ bo ぱ pa ぴ pi ぷ pu ぺ pe ぽ po ぁ a ぃ i ぅ u ぇ e ぉ o'.replace('あa','あ a').split(' ');for(let i=0;i<base.length;i+=2)m[base[i]]=base[i+1];
 return t=>{t=String(t||'').replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-96));let o='';for(let i=0;i<t.length;i++){const c=t[i],n=t[i+1];
  if('ゃゅょ'.includes(n)&&m[c]){const v={'ゃ':'a','ゅ':'u','ょ':'o'}[n];let r=m[c];r=/^(shi|chi|ji)$/.test(r)?r.slice(0,-1)+v:r.slice(0,-1)+'y'+v;o+=r;i++;continue}
  if(c==='っ'){const r=n&&m[n];o+=r?r[0]:'';continue}if(c==='ー'){o+=o.slice(-1);continue}o+=m[c]!=null?m[c]:c}return o}})();
async function showKanji(ch,lv){
  const [b,W]=await Promise.all([kanjiBlock(ch,lv),kwords()]);if(!b){modal(`<p>${E(ch)}: no data.</p>`);return}
  const {x,P}=b;const L=b.lv.toUpperCase();
  const KT=t=>t.replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+96));const on=KT(String(x[1]||'')).split(/[、,・\s]+/).filter(Boolean),kun=String(x[2]||'').split(/[、,・\s]+/).filter(Boolean);
  const rcol=(t,a)=>`<div class="kc-rd"><div class="h">${t}</div>${a.length?a.map(r=>`<div class="r"><b>${E(RD(r).replace(/-/g,"〜"))}</b><span>${E(RM(r.replace(/[.\-]/g,'')))}</span></div>`).join(''):'<div class="r">—</div>'}</div>`;
  const ws=(W[ch]||[]);
  const m=modal(`<div class="kc">
   <div class="kc-top"><span class="kc-lv kc-${b.lv}">JLPT ${L}</span><span class="kc-st">${P.length} strokes · ${P.length}画</span></div>
   <div class="kc-main"><div class="kc-big">${E(x[0])}</div>${svgOf(P)}</div>
   <div class="kc-mean"><div class="ne">${E(x[4])}</div><div class="en">${E(String(x[3]||'').toLowerCase())}</div></div>
   <div class="kc-rds">${rcol('音読み Onyomi',on)}${rcol('訓読み Kunyomi',kun)}</div>
   <p class="ps-note" style="text-align:center;margin:8px 0">Stroke order (書き順): the strokes are drawn in order. <button class="btn ghost" id="psRe" style="padding:5px 12px">▶ Again</button></p>
   ${ws.length?`<div class="kc-wh">Common words · この漢字の言葉</div><div class="kc-ws">${ws.map(w=>`<div class="kc-w"><div class="j"><b>${E(w[0])}</b>【${E(w[1])}】<i class="kc-lv kc-n${w[4]}">N${w[4]}</i></div><div class="m">${E(w[3])} · <span>${E(w[2])}</span></div></div>`).join('')}</div>`:''}
  </div>`);
  const svg=m.querySelector('svg');animate(svg);m.querySelector('#psRe').onclick=()=>animate(svg);
}
async function info(kind,lv,i){
  const d=await load(lv);const x=d[kind][i];if(!x)return;
  if(kind==='k')return showKanji(x[0],lv);
  if(kind==='v'){
    const w=x[0].split(';')[0].trim();const ks=[...new Set([...w].filter(c=>/[一-鿿]/.test(c)))];
    const m=modal(`<div style="font:700 40px/1.2 var(--f-jp)">${E(w)}</div><div class="ps-note" style="font-size:17px">${E(x[1])}</div>
    <div class="ps-ne">${E(x[3])}</div><div class="ps-kv"><div><b>English</b> ${E(x[2])}</div><div><b>Level</b> ${lv.toUpperCase()}</div></div>
    ${x[4]?`<p class="ps-note" style="margin-top:10px">At ${lv.toUpperCase()} this word is usually written in hiragana. In kanji (higher level): <b style="font-family:var(--f-jp);font-size:17px">${E(x[4])}</b></p>`:''}
    ${ks.length?`<p class="ps-note" style="margin-top:12px">Kanji in this word (tap for meaning and stroke order):</p><div class="ps-kbtns">${ks.map(c=>`<button data-k="${E(c)}">${E(c)}</button>`).join('')}</div>`:''}`);
    m.querySelectorAll('[data-k]').forEach(btn=>btn.onclick=()=>{m.remove();showKanji(btn.dataset.k)});
  }
}
const GD={};
async function gdata(lv){if(!(lv in GD))GD[lv]=await fetch('pass/gd-'+lv+'.json').then(r=>r.ok?r.json():{}).catch(()=>({}));return GD[lv]}
function nrm(t){return String(t||'').replace(/[\s　。、,，．.！!？?「」]/g,'').replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-96)).replace(/[xX✕✖]/g,'×').replace(/[０-９]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248))}
function rng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
function shuf(a,r){a=a.slice();for(let k=a.length-1;k>0;k--){const j=Math.floor(r()*(k+1));[a[k],a[j]]=[a[j],a[k]]}return a}
const POOL={};
function pool(lv,G){if(POOL[lv])return POOL[lv];const P=[];Object.keys(G).forEach(j=>(G[j].p||[]).forEach(q=>{const t=[].concat(q[1])[0];if(t)P.push({t:String(t),j:+j})}));return POOL[lv]=P}
/* 4 options: the answer + 3 wrong answers taken from nearby grammar points of the same level */
function opts(lv,G,i,k,q){
  const ans=String([].concat(q[1])[0]),ok=new Set(q[2].concat(q[1]).map(nrm)),sep=/[、,]/.test(ans),seen=new Set([nrm(ans)]);
  const c=pool(lv,G).filter(o=>{const n=nrm(o.t);if(!n||ok.has(n)||seen.has(n)||/[、,]/.test(o.t)!==sep)return false;seen.add(n);return true})
    .map(o=>Object.assign({s:Math.abs(o.j-i)+3*Math.abs(o.t.length-ans.length)},o)).sort((a,b)=>a.s-b.s).slice(0,9);
  const r=rng(i*31+k*7+lv.charCodeAt(1));
  if(sep&&c.length<3){/* answers like 「から、まで」: build wrong pairs from common particles */
    const n=ans.split(/[、,]/).length,PT=['は','が','を','に','で','へ','と','も','の','から','まで','や','より'];
    for(let z=0;z<40&&c.length<6;z++){const t=Array.from({length:n},()=>PT[Math.floor(r()*PT.length)]).join('、'),m=nrm(t);if(!ok.has(m)&&!seen.has(m)){seen.add(m);c.push({t,j:-1})}}}
  return shuf([{t:ans,j:i,ok:1}].concat(shuf(c,r).slice(0,3)),r);
}
async function grammarPage(lv,i){
  shell('pass','<div id="psBody"><div class="bp-inl"><span class="bp-spin"></span>Loading… please wait</div></div>');
  const [d,G]=await Promise.all([load(lv).catch(()=>null),gdata(lv)]);const x=d&&d.g[i];
  if(!x){$('#psBody').innerHTML='<p>Not found.</p>';return}
  const S=getSet(lv,'g'),g=G[i];
  const nav=`<div style="display:flex;gap:8px;justify-content:space-between;margin:12px 0">${i>0?`<a class="btn ghost" href="#pass/g/${lv}/${i-1}">← Previous</a>`:'<span></span>'}${i<d.g.length-1?`<a class="btn" href="#pass/g/${lv}/${i+1}">Next →</a>`:''}</div>`;
  const tl=j=>G[j]&&G[j].u&&G[j].u[0]?G[j].u[0][0]:'';
  let body,OP=[];
  const hw=`<div class="card ps-res"><h2 class="ps-h">④ Homework <small>宿題</small></h2>
    ${g&&g.h.length?g.h.map(h=>`<div class="ps-ex"><div class="jp">${h[0]}</div><div class="nep">${E(h[1])}</div></div>`).join(''):`<p class="ps-note">Make 3 sentences of your own with <b style="font-family:var(--f-jp)">${E(x[0])}</b>.</p>`}
    <p class="ps-note">Write 3 sentences with this grammar and press <b>Send</b>. Your teacher will check them. · यो व्याकरण प्रयोग गरेर ३ वटा वाक्य लेख्नुहोस् र <b>Send</b> थिच्नुहोस्।</p>
    <div class="ps-hw">${[1,2,3].map(n=>`<label>Sentence ${n}<textarea id="psH${n}" rows="2" maxlength="300" placeholder="例：…"></textarea></label>`).join('')}</div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:8px"><button class="btn ps-check" id="psHs">Send ✉</button><a class="btn ghost" href="#pass/hw">📒 My homework</a><span id="psHm" class="ps-note" style="margin:0"></span></div></div>`;
  if(g){
    OP=g.p.map((q,k)=>opts(lv,G,i,k,q));
    body=`<div class="card ps-res"><h2 class="ps-h">① How to use <small>使い方</small></h2>
    <div class="ps-nebox"><div class="lb"><span class="ps-lg ne">NE</span> नेपालीमा</div><b>${E(x[1])}</b><div class="ps-ex"><div class="jp">${E(x[2])}</div><div class="nep">${E(x[3])}</div></div></div>
    ${g.u.map((u,k)=>`<div class="ps-use"><div class="t"><span>${k+1}</span>${E(u[0])}</div><p><span class="ps-lg">EN</span> ${E(u[1])}</p>${u[4]?`<p><span class="ps-lg ne">NE</span> ${E(u[4])}</p>`:''}<div class="ps-ex"><div class="jp">${u[2]}</div><div class="nep">${E(u[3])}</div></div></div>`).join('')}</div>
    ${g.f.length?`<div class="card ps-res"><h2 class="ps-h">② How to make <small>作り方</small></h2><div class="ps-ftbl">${g.f.map(f=>`<div class="r"><div class="l">${E(f[0])}</div><div class="c">${f[1]}</div></div>`).join('')}</div></div>`:''}
    ${g.p.length?`<div class="card ps-res"><h2 class="ps-h">③ Practice <small>練習</small></h2><p class="ps-note">Choose the right answer for （　　）, then press <b>Check answers</b>. · सही उत्तर छान्नुहोस् र <b>Check answers</b> थिच्नुहोस्।</p>
    <ol class="ps-pr">${g.p.map((q,k)=>`<li data-k="${k}"><div class="q">${q[0].replace(/＿{2,}/g,'<span class="ps-bl">（　　）</span>')}</div><div class="m">${E(q[3])}</div><div class="ps-ops">${OP[k].map((o,n)=>`<button type="button" data-k="${k}" data-o="${n}"><i>${n+1}</i>${E(o.t)}</button>`).join('')}</div><div class="a"></div></li>`).join('')}</ol>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><button class="btn ps-check" id="psPc">Check answers</button><button class="btn ghost" id="psPs">Show answers</button><b id="psPsc"></b></div></div>`:''}`;
  }else{
    body=`<div class="card ps-res"><h3 style="margin:0 0 6px">Meaning</h3><div class="ps-ne">${E(x[1])}</div>
    <h3 style="margin:14px 0 6px">Example</h3><div class="ps-ex"><div class="jp">${E(x[2])}</div><div class="nep">${E(x[3])}</div></div><p class="ps-note">Full lesson for this point is coming soon.</p></div>`;
  }
  $('#psBody').innerHTML=`<p><a href="#pass">← ${lv.toUpperCase()} grammar list</a></p>
  <section class="ps-hero"><p>${lv.toUpperCase()} · Grammar ${i+1}/${d.g.length}</p><h1 style="font-family:var(--f-jp)">${E(x[0])}</h1>${g&&g.u[0]?`<p>${E(g.u[0][0])}</p>`:''}</section>
  ${body}${hw}
  <label class="card" style="display:flex;gap:10px;align-items:center;padding:14px;font-weight:700"><input type="checkbox" id="psGk" ${S.has(i)?'checked':''} style="width:22px;height:22px"> I understand this grammar ✓</label>
  ${nav}`;
  $('#psGk').onchange=e=>{const s=getSet(lv,'g');e.target.checked?s.add(i):s.delete(i);putSet(lv,'g',s)};
  if(g&&g.p.length){
    const sel={};
    document.querySelectorAll('.ps-ops button').forEach(b=>b.onclick=()=>{const k=+b.dataset.k;sel[k]=+b.dataset.o;b.parentNode.querySelectorAll('button').forEach(z=>z.classList.toggle('sel',z===b))});
    const show=(mark)=>{let ok=0;g.p.forEach((q,k)=>{const li=$(`.ps-pr li[data-k="${k}"]`),O=OP[k],c=O.findIndex(o=>o.ok),s0=sel[k],good=s0===c;if(good)ok++;
      li.classList.toggle('ok',mark&&good);li.classList.toggle('ng',mark&&!good);
      li.querySelectorAll('.ps-ops button').forEach((z,n)=>{z.classList.toggle('right',n===c);z.classList.toggle('wrong',mark&&n===s0&&!good)});
      const w=(mark&&s0!=null&&!good)?O[s0]:null,wx=w&&d.g[w.j];
      li.querySelector('.a').innerHTML=(mark?(good?'<span class="ps-ok">✓ Correct · सही</span>':`<span class="ps-ng">✗ ${s0==null?'No answer · उत्तर छानिएन':'Wrong · गलत'}</span>`):'')+
      `<div class="ps-why"><p><span class="ps-lg">EN</span> Answer: <b>${E(O[c].t)}</b> — this is <b>${E(x[0])}</b>${tl(i)?` (${E(tl(i))})`:''}. The sentence means: “${E(String(q[3]).replace(/[.。]$/,''))}”.${w?` Your choice <b>${E(w.t)}</b>${wx?` belongs to <b>${E(wx[0])}</b>${tl(w.j)?` (${E(tl(w.j))})`:''}`:''} and does not fit this sentence.`:''}</p>
      <p><span class="ps-lg ne">NE</span> सही उत्तर: <b>${E(O[c].t)}</b> — यहाँ <b>${E(x[0])}</b> (${E(x[1])}) प्रयोग हुन्छ।${w?` तपाईंले छान्नुभएको <b>${E(w.t)}</b>${wx?` <b>${E(wx[0])}</b> (${E(wx[1])}) को रूप हो,`:''} त्यसैले यो वाक्यमा मिल्दैन।`:''}</p></div>`});
      if(mark)$('#psPsc').innerHTML=`Score: ${ok} / ${g.p.length} ${ok===g.p.length?'🎉':''}`};
    $('#psPc').onclick=()=>show(true);$('#psPs').onclick=()=>show(false);
  }
  $('#psHs').onclick=async()=>{const m=$('#psHm'),B=window.PSH.be&&window.PSH.be();
    const sn=[1,2,3].map(n=>$('#psH'+n).value.trim());
    if(!sn.some(Boolean)){m.textContent='Please write at least one sentence. · कम्तिमा एउटा वाक्य लेख्नुहोस्।';return}
    if(!B||!B.ok){m.textContent='Sending is not available here.';return}
    if(!B.user){m.innerHTML='Please <a href="#acc">log in</a> first, then send. · पहिले <a href="#acc">Log in</a> गर्नुहोस्।';return}
    const btn=$('#psHs');btn.disabled=true;m.textContent='Sending…';
    try{await B.api.hwSend(B.user.uid,{lv,gi:i,gp:x[0],s:sn,name:(B.prof&&B.prof.name)||B.user.displayName||'',email:B.user.email||''});
      [1,2,3].forEach(n=>$('#psH'+n).value='');m.innerHTML='✓ Sent! See it in <a href="#pass/hw">📒 My homework</a>. · पठाइयो!'}
    catch(e){m.textContent='Could not send. Please try again. · पठाउन सकिएन।';btn.disabled=false;return}
    btn.disabled=false};
}
async function hwPage(){
  shell('pass','<div id="psBody"><div class="bp-inl"><span class="bp-spin"></span>Loading… please wait</div></div>');
  const B=window.PSH.be&&window.PSH.be(),top=`<p><a href="#pass">← Pass? Try it</a></p><section class="ps-hero"><h1>📒 My homework <small style="font-family:var(--f-jp)">宿題</small></h1><p>Homework you sent from the grammar pages, and your teacher's check.</p></section>`;
  if(!B||!B.ok){$('#psBody').innerHTML=top+'<p class="ps-note">Not available here.</p>';return}
  if(!B.ready){setTimeout(hwPage,500);return}
  if(!B.user){$('#psBody').innerHTML=top+'<div class="card ps-res"><p>Please <a href="#acc">log in</a> to see your homework. · <a href="#acc">Log in</a> गर्नुहोस्।</p></div>';return}
  let L=[];try{L=await B.api.myHw(B.user.uid)}catch(e){$('#psBody').innerHTML=top+'<p class="ps-note">Could not load. Please try again later.</p>';return}
  const fd=ms=>ms?new Date(ms).toISOString().slice(0,10):'';
  $('#psBody').innerHTML=top+(L.length?L.map(h=>`<div class="card ps-res ps-hwi"><div class="hd"><a href="#pass/g/${E(h.lv)}/${+h.gi}"><b>${E(String(h.lv||'').toUpperCase())} · ${E(h.gp)}</b></a><span class="st ${h.status==='checked'?'ok':''}">${h.status==='checked'?'✓ Checked':'⏳ Waiting'}</span></div>
    <ol>${(h.s||[]).filter(Boolean).map(t=>`<li>${E(t)}</li>`).join('')}</ol>${h.comment?`<div class="cm">👩‍🏫 ${E(h.comment)}</div>`:''}<small class="ps-note">${fd(h.created)}</small></div>`).join(''):'<div class="card ps-res"><p>No homework sent yet. Open a grammar point, write 3 sentences and press Send.</p></div>');
}
})();
