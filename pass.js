// "You want to pass? Try it" — JLPT N5–N1 self level check (kanji / vocabulary / grammar).
// Data: pass/pass-nX.json {k:[kanji,on,kun,en,ne], v:[word,reading,en,ne], g:[pattern,ne,example,translation]}
// Strokes: pass/strokes-nX.json {kanji:[svg path d...]} from KanjiVG (CC BY-SA 3.0, Ulrich Apel).
(function(){
const $=s=>document.querySelector(s);const shell=(a,b)=>window.PSH.shell(a,b);
const LV=['n5','n4','n3','n2','n1'];
const KIND={k:['漢字','कान्जी'],v:['語彙','शब्द (अर्थ)'],g:['文法','व्याकरण']};
const PER=100;
const PD={},SD={};
const PS={lv:'n5',kind:'k',page:0};
try{Object.assign(PS,JSON.parse(localStorage.getItem('rk_passui')||'{}'))}catch(e){}
const saveUI=()=>{try{localStorage.setItem('rk_passui',JSON.stringify(PS))}catch(e){}};
const keyOf=(lv,kind)=>'rk_pass2_'+lv+'_'+kind;
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
.ps-row button.on{background:var(--ai);border-color:var(--ai);color:#fff}
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
.ps-pager button.on{background:var(--ink);color:var(--paper)}
.ps-bar{position:sticky;bottom:72px;z-index:5;display:flex;gap:8px;align-items:center;flex-wrap:wrap;background:var(--paper);border:1.5px solid var(--line);border-radius:16px;padding:10px;box-shadow:var(--shadow);margin:14px 0}
.ps-bar .cnt{flex:1;font-weight:700;font-size:13.5px;min-width:90px}.ps-bar .btn{padding:9px 12px;font-size:14px}
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
.ps-credit{font-size:11.5px;color:var(--muted);margin:18px 0 0;line-height:1.5}
`;
function css(){if(!document.getElementById('psCss')){const s=document.createElement('style');s.id='psCss';s.textContent=CSS;document.head.appendChild(s)}}
const RD=s=>String(s||'').replace(/([^\s.]+)\.([^\s]+)/g,'$1($2)');
const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const LVINFO={n1:['900','2,000','10,000'],n2:['600','1,000','6,000'],n3:['450','700','3,500'],n4:['300','300','1,500'],n5:['150','100','800']};

function head(){return `<section class="ps-hero"><h1>You want to pass? Try it 🎯</h1><p>तपाईंलाई कति कान्जी, शब्द र व्याकरण आउँछ? आउने जतिमा ✓ लगाउनुहोस् र <b>Check!</b> थिच्नुहोस्। शब्द थिच्दा अर्थ र लेख्ने तरिका देखिन्छ।</p></section>`}
function tabs(){
  return `<div class="ps-row">${LV.map(l=>`<button data-lv="${l}" class="${PS.lv===l?'on':''}">${l.toUpperCase()}</button>`).join('')}</div>
  <div class="ps-row">${Object.keys(KIND).map(k=>`<button data-kind="${k}" class="${PS.kind===k?'on':''}">${KIND[k][0]} · ${KIND[k][1]}</button>`).join('')}<button data-kind="r" class="${PS.kind==='r'?'on':''}">📊 नतिजा</button></div>`;
}
function itemsOf(d,kind){return d[kind]||[]}
function label(kind,x){return kind==='k'?x[0]:kind==='v'?x[0].split(';')[0].trim():x[0]}

window.renderPass=async function(){
  css();
  const parts=(location.hash.slice(1)).split('/');
  if(parts[1]==='g'&&parts[2]&&parts[3]!=null)return grammarPage(parts[2],+parts[3]);
  shell('pass',head()+tabs()+'<div id="psBody"><div class="ps-note">लोड हुँदैछ…</div></div>');
  bindTabs();
  if(PS.kind==='r')return results();
  let d;try{d=await load(PS.lv)}catch(e){$('#psBody').innerHTML='<p class="ps-note">डाटा लोड भएन। इन्टरनेट जाँच्नुहोस्।</p>';return}
  const L=itemsOf(d,PS.kind),S=getSet(PS.lv,PS.kind),pages=Math.ceil(L.length/PER);
  if(PS.page>=pages)PS.page=0;
  const a=PS.page*PER,b=Math.min(L.length,a+PER);
  const pager=pages>1?`<div class="ps-pager"><span class="ps-note" style="margin:0 6px 0 0">पेज:</span>${Array.from({length:pages},(_,i)=>`<button data-pg="${i}" class="${i===PS.page?'on':''}">${i*PER+1}–${Math.min(L.length,(i+1)*PER)}</button>`).join('')}</div>`:'';
  let body;
  if(PS.kind==='g'){
    body=`<p class="ps-note">बुझ्ने व्याकरणमा ✓ लगाउनुहोस्। नाम थिच्दा भित्र अर्थ र उदाहरण खुल्छ।</p><div class="ps-gl">${L.slice(a,b).map((x,j)=>{const i=a+j;return `<div class="ps-gr ${S.has(i)?'on':''}"><label><input type="checkbox" data-i="${i}" ${S.has(i)?'checked':''} aria-label="${E(x[0])}"></label><a href="#pass/g/${PS.lv}/${i}"><b>${i+1}. ${E(x[0])}</b><span>${E(x[1])}</span></a></div>`}).join('')}</div>`;
  }else{
    body=`<p class="ps-note">पढ्न/बुझ्न सक्ने ${PS.kind==='k'?'कान्जी':'शब्द'}मा ✓ लगाउनुहोस्। ⓘ थिच्दा अर्थ ${PS.kind==='k'?'र लेख्ने तरिका':''} देखिन्छ।</p><div class="ps-grid ps-${PS.lv}">${L.slice(a,b).map((x,j)=>{const i=a+j;return `<div class="ps-cell ${S.has(i)?'on':''}" data-c="${i}"><div class="top"><span>${String(i+1).padStart(3,'0')}</span><input type="checkbox" data-i="${i}" ${S.has(i)?'checked':''} aria-label="${E(label(PS.kind,x))}"></div><div class="w ${PS.kind==='k'?'kj':''}">${E(label(PS.kind,x))}</div><span class="i" data-inf="${i}">i</span></div>`}).join('')}</div>`;
  }
  $('#psBody').innerHTML=pager+body+pager+`<div class="ps-bar"><span class="cnt" id="psCnt"></span><button class="btn ghost" id="psAll" title="यो पेज सबै ✓">सबै ✓</button><button class="btn ghost" id="psClr" title="यो पेज खाली">खाली</button><button class="btn ps-check" id="psCheck">Check!</button></div>`+credit();
  const cnt=()=>{$('#psCnt').innerHTML=`✓ ${S.size} / ${L.length} (${KIND[PS.kind][1]})`};cnt();
  const toggle=(i,on)=>{on?S.add(i):S.delete(i);putSet(PS.lv,PS.kind,S);const inp=document.querySelector(`input[data-i="${i}"]`);if(inp){inp.checked=on;(inp.closest('.ps-cell')||inp.closest('.ps-gr')).classList.toggle('on',on)}cnt()};
  document.querySelectorAll('#psBody input[data-i]').forEach(x=>x.onchange=()=>toggle(+x.dataset.i,x.checked));
  document.querySelectorAll('#psBody .ps-cell').forEach(c=>c.onclick=e=>{
    if(e.target.matches('input'))return;
    const i=+c.dataset.c;
    if(e.target.dataset.inf!=null||e.target.closest('.w'))return info(PS.kind,PS.lv,i);
    toggle(i,!S.has(i));
  });
  document.querySelectorAll('[data-pg]').forEach(x=>x.onclick=()=>{PS.page=+x.dataset.pg;saveUI();renderPass();window.scrollTo(0,0)});
  $('#psAll').onclick=()=>{for(let i=a;i<b;i++)toggle(i,true)};
  $('#psClr').onclick=()=>{for(let i=a;i<b;i++)toggle(i,false)};
  $('#psCheck').onclick=()=>{PS.kind='r';saveUI();renderPass();window.scrollTo(0,0)};
};
function bindTabs(){
  document.querySelectorAll('[data-lv]').forEach(x=>x.onclick=()=>{PS.lv=x.dataset.lv;PS.page=0;saveUI();renderPass()});
  document.querySelectorAll('[data-kind]').forEach(x=>x.onclick=()=>{PS.kind=x.dataset.kind;PS.page=0;saveUI();renderPass()});
}
function credit(){return `<p class="ps-credit">स्रोत: कान्जी सूची <a href="https://github.com/davidluzgouveia/kanji-data">kanji-data</a> (MIT), शब्द सूची <a href="https://github.com/jamsinclair/open-anki-jlpt-decks">open-anki-jlpt-decks</a> (MIT), लेख्ने क्रम <a href="https://kanjivg.tagaini.net">KanjiVG</a> © Ulrich Apel (CC BY-SA 3.0)। नेपाली अर्थ र व्याकरण: BP Nihongo Hub।</p>`}

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
  $('#psBody').innerHTML=`<div class="card ps-res"><h2>${cur.lv.toUpperCase()} नतिजा</h2><div class="ps-big">${cur.p}%</div>${line('k')}${line('v')}${line('g')}
  <p class="ps-note">✓ = आउने (मिल्यो), ✗ = नआउने (अझै पढ्नुपर्ने)।</p></div>
  <div class="card ps-res"><h2>तपाईंको अनुमानित स्तर</h2><div class="ps-big" style="color:var(--shu)">${est?est.toUpperCase():'N5 भन्दा तल'}</div>
  <p class="ps-note">कुनै स्तर र त्यसभन्दा सजिला सबै स्तरमा ६०% वा बढी आएमा त्यो स्तर मानिन्छ। अर्को स्तरको सूचीमा पनि ✓ लगाएर हेर्नुहोस्।</p>
  <table class="ps-tbl"><tr><th>JLPT</th><th>कान्जी</th><th>शब्द</th><th>व्याकरण</th><th>%</th></tr>${rows.slice().reverse().map(r=>`<tr class="${r.lv===est?'me':''}"><td>${r.lv.toUpperCase()}</td><td>${r.k[0]}/${r.k[1]}</td><td>${r.v[0]}/${r.v[1]}</td><td>${r.g[0]}/${r.g[1]}</td><td>${r.p}%</td></tr>`).join('')}</table>
  <h3 style="margin:16px 0 4px">JLPT स्तर र आवश्यक पढाइ</h3>
  <table class="ps-tbl"><tr><th>JLPT</th><th>पढाइ समय</th><th>कान्जी</th><th>शब्द</th></tr>${LV.slice().reverse().map(l=>`<tr><td>${l.toUpperCase()}</td><td>${LVINFO[l][0]} घण्टा</td><td>करिब ${LVINFO[l][1]}</td><td>करिब ${LVINFO[l][2]}</td></tr>`).join('')}</table>
  <p class="ps-note">यो वेबसाइटको सूचीमा: N5 कान्जी 103/शब्द 718, N4 144/668, N3 366/2140, N2 367/1906, N1 1232/2699 (हरेक स्तरमा त्यही स्तरका मात्र; अघिल्लो स्तरका दोहोरिँदैनन्। माथिल्लो तहको कान्जी भएको शब्द हिरागानामा देखाइन्छ)।</p></div>
  <button class="btn ghost" id="psWrong">✗ नआउने ${KIND.k[1]}/${KIND.v[1]} मात्र हेर्नुहोस्</button><div id="psWL"></div>`+credit();
  $('#psWrong').onclick=async()=>{
    const d=await load(cur.lv);let h='';
    for(const k of ['k','v']){const S=getSet(cur.lv,k);const L=d[k].map((x,i)=>[x,i]).filter(([x,i])=>!S.has(i));
      h+=`<h3>${KIND[k][1]} ✗ ${L.length}</h3><div class="ps-grid ps-${cur.lv}">${L.slice(0,300).map(([x,i])=>`<div class="ps-cell" data-k="${k}" data-c="${i}"><div class="top"><span>${String(i+1).padStart(3,'0')}</span></div><div class="w ${k==='k'?'kj':''}">${E(label(k,x))}</div><span class="i">i</span></div>`).join('')}</div>${L.length>300?'<p class="ps-note">पहिलो ३०० मात्र देखाइएको।</p>':''}`}
    $('#psWL').innerHTML=h;
    document.querySelectorAll('#psWL .ps-cell').forEach(c=>c.onclick=()=>info(c.dataset.k,cur.lv,+c.dataset.c));
  };
}

function modal(html){
  const m=document.createElement('div');m.className='ps-modal';m.innerHTML=`<div class="ps-sheet" role="dialog" aria-modal="true"><button class="x" aria-label="बन्द">✕</button>${html}</div>`;
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
async function showKanji(ch,lv){
  const b=await kanjiBlock(ch,lv);if(!b){modal(`<p>${E(ch)}: जानकारी छैन।</p>`);return}
  const {x,P}=b;
  const m=modal(`<div class="ps-kj">${svgOf(P)}<div><div style="font:700 64px/1 var(--f-jp)">${E(x[0])}</div><div class="ps-note">${b.lv.toUpperCase()} · ${P.length} रेखा (画数)</div></div></div>
  <div class="ps-ne">${E(x[4])}</div>
  <div class="ps-kv"><div><b>音読み (on)</b> ${E(x[1]||'—')}</div><div><b>訓読み (kun)</b> ${E(RD(x[2])||'—')}</div><div><b>English</b> ${E(x[3])}</div></div>
  <p class="ps-note">लेख्ने तरिका: माथिको बाकसमा रेखा एक-एक गरी क्रमैसँग कोरिन्छ (माथिबाट तल, बायाँबाट दायाँ)। <button class="btn ghost" id="psRe" style="padding:6px 12px">▶ फेरि हेर्नुहोस्</button></p>`);
  const svg=m.querySelector('svg');animate(svg);m.querySelector('#psRe').onclick=()=>animate(svg);
}
async function info(kind,lv,i){
  const d=await load(lv);const x=d[kind][i];if(!x)return;
  if(kind==='k')return showKanji(x[0],lv);
  if(kind==='v'){
    const w=x[0].split(';')[0].trim();const ks=[...new Set([...w].filter(c=>/[一-鿿]/.test(c)))];
    const m=modal(`<div style="font:700 40px/1.2 var(--f-jp)">${E(w)}</div><div class="ps-note" style="font-size:17px">${E(x[1])}</div>
    <div class="ps-ne">${E(x[3])}</div><div class="ps-kv"><div><b>English</b> ${E(x[2])}</div><div><b>स्तर</b> ${lv.toUpperCase()}</div></div>
    ${x[4]?`<p class="ps-note" style="margin-top:10px">${lv.toUpperCase()} मा यो शब्द प्रायः हिरागानामै लेखिन्छ। माथिल्लो तहमा कान्जीमा: <b style="font-family:var(--f-jp);font-size:17px">${E(x[4])}</b></p>`:''}
    ${ks.length?`<p class="ps-note" style="margin-top:12px">यो शब्दका कान्जी (थिच्दा अर्थ र लेख्ने तरिका):</p><div class="ps-kbtns">${ks.map(c=>`<button data-k="${E(c)}">${E(c)}</button>`).join('')}</div>`:''}`);
    m.querySelectorAll('[data-k]').forEach(btn=>btn.onclick=()=>{m.remove();showKanji(btn.dataset.k)});
  }
}
async function grammarPage(lv,i){
  shell('pass','<div id="psBody"><p class="ps-note">लोड हुँदैछ…</p></div>');
  const d=await load(lv).catch(()=>null);const x=d&&d.g[i];
  if(!x){$('#psBody').innerHTML='<p>भेटिएन।</p>';return}
  const S=getSet(lv,'g');
  $('#psBody').innerHTML=`<p><a href="#pass">← ${lv.toUpperCase()} व्याकरण सूची</a></p>
  <section class="ps-hero"><p>${lv.toUpperCase()} · 文法 ${i+1}/${d.g.length}</p><h1 style="font-family:var(--f-jp)">${E(x[0])}</h1></section>
  <div class="card ps-res"><h3 style="margin:0 0 6px">अर्थ</h3><div class="ps-ne">${E(x[1])}</div>
  <h3 style="margin:14px 0 6px">उदाहरण</h3><div class="ps-ex"><div class="jp">${E(x[2])}</div><div class="nep">${E(x[3])}</div></div>
  <label style="display:flex;gap:10px;align-items:center;margin-top:14px;font-weight:700"><input type="checkbox" id="psGk" ${S.has(i)?'checked':''} style="width:22px;height:22px"> मैले यो व्याकरण बुझेँ ✓</label></div>
  <div style="display:flex;gap:8px;justify-content:space-between">${i>0?`<a class="btn ghost" href="#pass/g/${lv}/${i-1}">← अघिल्लो</a>`:'<span></span>'}${i<d.g.length-1?`<a class="btn" href="#pass/g/${lv}/${i+1}">अर्को →</a>`:''}</div>`;
  $('#psGk').onchange=e=>{const s=getSet(lv,'g');e.target.checked?s.add(i):s.delete(i);putSet(lv,'g',s)};
}
})();
