// "Updates" panel (⋮ on Home): exam / application / result dates within 30 days, always-open CBT tests,
// Japan news (rules, immigration) from updates.json, and live earthquake + tsunami info (P2PQuake API, data from JMA).
(function(){
const shell=(a,b)=>window.PSH.shell(a,b);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const DAY=864e5;
// days from today (Japan time) to a YYYY-MM-DD date
const jstToday=()=>{const d=new Date(Date.now()+9*36e5);return Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())};
const dleft=s=>Math.round((Date.parse(s+'T00:00:00Z')-jstToday())/DAY);
const fd=s=>{const d=new Date(s+'T00:00:00Z');return d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',weekday:'short',timeZone:'UTC'})};
const KN={test:['📝','Test day'],apply:['✍️','Application'],result:['📊','Results']};
let UD=null;
async function data(){if(!UD)UD=await fetch('updates.json',{cache:'no-cache'}).then(r=>r.json()).catch(()=>({ev:[],open:[],news:[]}));return UD}
// items to show: test/result day within 30 days, or application period open / opening within 30 days
function soon(ev){return ev.map(e=>{const a=dleft(e.date),b=e.end?dleft(e.end):a;return {...e,a,b}})
  .filter(e=>(e.kind==='apply'?e.b>=-7:e.b>=0)&&e.a<=30).sort((x,y)=>(x.b<0)-(y.b<0)||Math.max(x.a,0)-Math.max(y.a,0))}
/* traffic-light board: one signal per exam (green = form open / book any time, yellow = opens within 30 days, red = closed) */
const BOARD=[['JLPT','JLPT'],['JFT-Basic','JFT-Basic'],['BJT','BJT'],['介護福祉士','介護福祉士 (national exam)'],['介護','介護 SSW test'],['Food SSW','Food SSW test']];
function board(d){const ev=(d.ev||[]).filter(e=>e.kind==='apply').map(e=>({...e,a:dleft(e.date),b:dleft(e.end||e.date)}));
  return BOARD.map(([k,n])=>{const ap=ev.filter(e=>e.cat===k);let st='r',tx='Closed',f=null,u=null;
    const op=ap.find(e=>e.a<=0&&e.b>=0),so=ap.filter(e=>e.a>0&&e.a<=30).sort((x,y)=>x.a-y.a)[0],any=(d.open||[]).find(e=>e.cat===k);
    if(op){st='g';tx='Open · until '+fd(op.end||op.date);f=op.f;u=op.u}else if(any){st='g';tx='Book any time';u=any.u}else if(so){st='y';tx='Opens in '+so.a+' days';u=so.u}
    return {n,st,tx,f,u}})}
function boardHtml(d){return `<section class="card up-bd">${board(d).map(x=>`<a class="up-bi" href="${esc(x.f||x.u||'#updates')}" ${x.f||x.u?'target="_blank" rel="noopener"':''}><span class="up-sig ${x.st}"></span><b>${esc(x.n)}</b><small>${esc(x.tx)}</small></a>`).join('')}
  <p class="muted" style="font-size:11px;margin:8px 0 0">🟢 form open now · 🟡 opens soon · 🔴 closed</p></section>`}
window.updCount=async()=>{const d=await data();return soon(d.ev||[]).filter(e=>e.b>=0).length};

const SC={10:'1',20:'2',30:'3',40:'4',45:'5-',50:'5+',55:'6-',60:'6+',70:'7'};
const scLv=s=>s>=55?['Very strong · danger','#c0001a']:s>=45?['Strong · be careful','#e5193f']:s>=30?['Moderate','#e3a200']:['Weak','#6b7a99'];
const TS={None:'No tsunami',Unknown:'Tsunami: unknown',Checking:'Tsunami: checking',NonEffective:'Small sea change, no damage expected',Watch:'Tsunami advisory',Warning:'Tsunami WARNING'};
const TG={MajorWarning:['Major tsunami warning (大津波警報)','#7a0010'],Warning:['Tsunami warning (津波警報)','#c0001a'],Watch:['Tsunami advisory (津波注意報)','#e3a200'],Unknown:['Tsunami info','#6b7a99']};
const jtime=t=>{const m=String(t||'').match(/(\d+)\/(\d+)\/(\d+) (\d+):(\d+)/);return m?`${+m[2]}/${+m[3]} ${m[4]}:${m[5]} JST`:esc(t)};
let ND=null;
async function news(){if(!ND)ND=await fetch('news.json',{cache:'no-cache'}).then(r=>r.json()).catch(()=>({items:[]}));return ND}
const NC={weather:['🌦','Weather'],safety:['⚠️','Safety'],accident:['🚨','Accident'],foreigners:['🛂','Foreigners & visa'],politics:['🏛','Politics'],economy:['💴','Economy'],society:['👥','Society'],quake:['🌏','Earthquake'],health:['🏥','Health'],transport:['🚆','Transport'],education:['🎓','Education'],sports:['⚽','Sports'],culture:['🎎','Culture'],world:['🌐','World']};
const NL={safety:['Be careful','#e5193f'],important:['Important','#c26a00'],info:['Info','#2443e8']};
function newsHtml(d){const it=(d.items||[]).filter(x=>{const a=-dleft(x.d);return a>=0&&a<7}).sort((a,b)=>b.d.localeCompare(a.d)||((b.lv==='safety')-(a.lv==='safety')));
  if(!it.length)return '<section class="card"><p class="muted" style="margin:0">No news this week.</p></section>';
  return it.map((x,i)=>{const [ic,cn]=NC[x.cat]||['📰','News'],[ln,lc]=NL[x.lv]||NL.info;
    return `<section class="card up-nw"><div class="up-nh"><span class="up-tag">${ic} ${cn}</span><span class="up-tag" style="background:${lc}1a;color:${lc}">${ln}</span><small class="muted">${fd(x.d)}</small></div>
    <p class="up-ja" lang="ja">${esc(x.ja)}</p>
    <details class="up-tr"><summary>Nepali · English</summary><p><b>NE</b> ${esc(x.ne)}</p><p><b>EN</b> ${esc(x.en)}</p></details>
    <p class="up-src">Source: ${esc(x.src||'NHK')} News · <a class="up-lk" href="${esc(x.u)}" target="_blank" rel="noopener">Read the full story ↗</a></p></section>`}).join('')}
async function quakes(){const el=document.querySelector('#upQ');if(!el)return;
  try{const [q,ts]=await Promise.all([
      fetch('https://api.p2pquake.net/v2/history?codes=551&limit=40').then(r=>r.json()),
      fetch('https://api.p2pquake.net/v2/history?codes=552&limit=3').then(r=>r.json()).catch(()=>[])]);
    const now=Date.now();
    const tsu=(ts||[]).filter(x=>!x.cancelled&&x.areas&&x.areas.length&&now-Date.parse(String(x.time).replace(/\//g,'-').replace(' ','T')+'+09:00')<2*DAY);
    const big=(q||[]).filter(x=>x.earthquake&&x.earthquake.maxScale>=45).slice(0,6);
    const tsHtml=tsu.map(x=>{const g={};x.areas.forEach(a=>{(g[a.grade]=g[a.grade]||[]).push(a.name)});
      return Object.keys(g).map(k=>{const [n,c]=TG[k]||TG.Unknown;return `<div class="up-alert" style="border-color:${c}"><b style="color:${c}">🌊 ${n}</b><span>${esc(g[k].slice(0,8).join(', '))}${g[k].length>8?' …':''}</span><small>${jtime(x.time)} · Move to high ground if you are near the sea.</small></div>`}).join('')}).join('');
    el.innerHTML=(tsHtml||'<p class="muted up-ok">🌊 No tsunami warning now.</p>')+
      (big.length?big.map(x=>{const e=x.earthquake,h=e.hypocenter||{},[lv,c]=scLv(e.maxScale);
        return `<div class="up-q"><span class="up-sc" style="background:${c}">震度<br><b>${SC[e.maxScale]||'?'}</b></span><div><b>${esc(h.name||'Japan')}</b> · M${h.magnitude>0?h.magnitude:'?'}${h.depth>0?' · '+h.depth+' km deep':''}<br><small style="color:${c};font-weight:700">${lv}</small> <small>· ${jtime(e.time)} · ${esc(TS[e.domesticTsunami]||'')}</small></div></div>`}).join('')
        :'<p class="muted">No earthquake of 震度 5弱 or stronger recently.</p>');
  }catch(e){el.innerHTML='<p class="muted">Could not load live earthquake data. Open the JMA page below.</p>'}}

const CSS=`.up-h{background:var(--grad,linear-gradient(135deg,#0a1440,#2443e8));color:#fff;border-radius:18px;padding:18px}
.up-h h1{margin:4px 0;font-size:22px}.up-h p{margin:0;opacity:.85;font-size:13px}
.up-sec{margin:18px 0 8px;font-size:17px}
.up-ev{display:flex;gap:12px;align-items:flex-start}.up-dl{min-width:64px;text-align:center;border-radius:14px;padding:8px 4px;background:#fff3d6;color:#7a5200}
.up-dl b{display:block;font-size:24px;line-height:1}.up-dl small{font-size:11px}.up-dl.now{background:#e5193f;color:#fff}
.up-ev h3{margin:0 0 4px;font-size:15px}.up-ev p{margin:0 0 6px;font-size:13px}.up-tag{display:inline-block;font-size:11px;font-weight:700;padding:2px 8px;border-radius:99px;background:#e8edff;color:#2443e8;margin-right:6px}
.up-lk{font-size:13px;font-weight:700}
.up-q{display:flex;gap:10px;align-items:center;padding:8px 0;border-top:1px solid var(--line,#e3e8f2);font-size:13px}.up-q:first-child{border-top:0}
.up-sc{color:#fff;border-radius:10px;min-width:46px;text-align:center;font-size:10px;padding:4px 2px;line-height:1.1}.up-sc b{font-size:18px}
.up-alert{color:#1a1f36;border-left:5px solid;padding:8px 10px;margin:6px 0;background:#fff5f6;border-radius:8px;display:flex;flex-direction:column;gap:2px;font-size:13px}
.up-ok{margin:0 0 6px}
.up-bd{display:grid;grid-template-columns:1fr 1fr;gap:8px}.up-bd p{grid-column:1/-1}
.up-bi{display:grid;grid-template-columns:auto 1fr;column-gap:8px;align-items:center;text-decoration:none;color:inherit;padding:8px;border:1px solid var(--line,#e3e8f2);border-radius:12px}
.up-bi b{font-size:13px}.up-bi small{grid-column:2;font-size:11px;opacity:.8}
.up-sig{grid-row:span 2;width:18px;height:18px;border-radius:50%;box-shadow:0 0 0 3px rgba(0,0,0,.06)}
.up-sig.big{display:block;width:26px;height:26px;margin:2px auto 6px}
.up-sig.g{background:#18b45b;box-shadow:0 0 10px #18b45b99}.up-sig.y{background:#f2b705;box-shadow:0 0 10px #f2b70599}.up-sig.r{background:#e5193f;box-shadow:0 0 8px #e5193f77}
.up-ap{display:inline-block;margin:2px 0 8px;padding:9px 16px;font-size:14px;text-decoration:none}
.up-st{display:inline-block;font-size:12px;font-weight:800;padding:3px 10px;border-radius:99px;margin:0 0 6px}.up-st.op{background:#e6f7ee;color:#0a7a3e}.up-st.cl{background:#fdeaea;color:#c0001a}.up-st.so{background:#fff3d6;color:#7a5200}
.up-nh{display:flex;flex-wrap:wrap;gap:4px;align-items:center;margin-bottom:6px}.up-nh small{margin-left:auto;font-size:11px}
.up-ja{font-size:16px;line-height:1.7;margin:0 0 8px}.up-tr summary{cursor:pointer;font-size:13px;font-weight:700;color:var(--ai,#2443e8)}
.up-tr p{font-size:13px;margin:6px 0}.up-src{font-size:12px;margin:8px 0 0;opacity:.85}`;

window.renderUpdates=async function(){
  if(!document.querySelector('#upCss')){const s=document.createElement('style');s.id='upCss';s.textContent=CSS;document.head.appendChild(s)}
  shell('updates','<section class="up-h"><small>⋮ UPDATES</small><h1>Exams · News · Safety</h1><p>Loading…</p></section>');
  const [d,N]=await Promise.all([data(),news()]),S=soon(d.ev||[]);
  const ev=S.map(e=>{const [ic,kn]=KN[e.kind]||KN.test,open=e.a<=0,closed=e.b<0,ap=e.kind==='apply';
    const st=ap?(closed?'<span class="up-st cl">🔴 Closed</span>':open?`<span class="up-st op">🟢 Open now · until ${fd(e.end||e.date)}</span>`:`<span class="up-st so">🟡 Opens in ${e.a} days</span>`):'';
    return `<section class="card up-ev" ${closed?'style="opacity:.65"':''}><div class="up-dl ${open&&!closed&&!ap?'now':''}" ${ap?`style="background:${closed?'#fdeaea;color:#c0001a':open?'#e6f7ee;color:#0a7a3e':'#fff3d6;color:#7a5200'}"`:''}>${ap?`<span class="up-sig big ${closed?'r':open?'g':'y'}"></span>`:''}${closed?'<small>closed</small>':open?(e.end?`<small>open</small><b>${e.b}</b><small>days left</small>`:'<b>今日</b><small>Today</small>'):`<b>${e.a}</b><small>${ap?'days to open':'days left'}</small>`}</div>
    <div><span class="up-tag">${esc(e.cat)}</span><span class="up-tag" style="background:#fff0f2;color:#e5193f">${ic} ${kn}</span><h3>${esc(e.t)}</h3>${st}<p>${esc(e.s)}</p>
    <p class="muted" style="font-size:12px">📅 ${fd(e.date)}${e.end?' – '+fd(e.end):''}</p>${ap&&e.f&&!closed?`<a class="btn grad up-ap" href="${esc(e.f)}" target="_blank" rel="noopener">📝 ${open?'Apply now':'Application form'} ↗</a><br>`:''}<a class="up-lk" href="${esc(e.u)}" target="_blank" rel="noopener">Official page (${esc(e.src||'')}) ↗</a></div></section>`}).join('');
  const op=(d.open||[]).map(e=>`<section class="card up-ev"><div class="up-dl" style="background:#e6f7ee;color:#0a7a3e"><span class="up-sig g big"></span><small>Open<br>any time</small></div><div><span class="up-tag">${esc(e.cat)}</span><h3>${esc(e.t)}</h3><p>${esc(e.s)}</p><a class="up-lk" href="${esc(e.u)}" target="_blank" rel="noopener">Official page ↗</a></div></section>`).join('');
  const nw=(d.news||[]).map(e=>`<section class="card up-ev"><div class="up-dl" style="background:#e8edff;color:#2443e8"><small>${dleft(e.date)>0?'starts in':'since'}</small><b>${Math.abs(dleft(e.date))}</b><small>days</small></div><div><span class="up-tag" style="background:#fff0f2;color:#e5193f">${esc(e.lv)}</span><h3>${esc(e.t)}</h3><p>${esc(e.s)}</p><p class="muted" style="font-size:12px">📅 ${fd(e.date)}</p><a class="up-lk" href="${esc(e.u)}" target="_blank" rel="noopener">Full information (official) ↗</a></div></section>`).join('');
  shell('updates',`<section class="up-h"><small>⋮ UPDATES</small><h1>Exams · News · Safety</h1><p>Exam days, applications and results in the next 30 days, Japan news, and live earthquake / tsunami info. Always check the official page.</p></section>
  <h2 class="up-sec">🚦 Application forms</h2>${boardHtml(d)}
  <h2 class="up-sec">📅 Next 30 days</h2>${ev||'<section class="card"><p class="muted" style="margin:0">No exam, application or result in the next 30 days.</p></section>'}
  <h2 class="up-sec">🌏 Earthquake & tsunami (live)</h2><section class="card"><div id="upQ"><p class="muted">Loading…</p></div>
   <p style="font-size:12px;margin:10px 0 0" class="muted">震度 (shindo) = how strong the shaking is, 1 (weak) to 7 (strongest). Data: JMA via P2P地震情報.</p>
   <p style="margin:6px 0 0"><a class="up-lk" href="https://www.jma.go.jp/bosai/map.html?contents=earthquake_map" target="_blank" rel="noopener">JMA earthquake map ↗</a> · <a class="up-lk" href="https://www.jma.go.jp/bosai/map.html?contents=tsunami" target="_blank" rel="noopener">JMA tsunami ↗</a> · <a class="up-lk" href="https://www.jnto.go.jp/safety-tips/eng/" target="_blank" rel="noopener">Safety tips app ↗</a></p></section>
  <h2 class="up-sec">🗞 This week in Japan</h2><p class="muted" style="font-size:12px;margin:-4px 0 8px">Easy Japanese summaries of national news from Japanese TV and newspapers. Updated at 9 AM and 9 PM. Tap "Nepali · English" for the translation. Each news goes away after 7 days.</p>${newsHtml(N)}
  <h2 class="up-sec">📰 Rules & immigration</h2>${nw||'<section class="card"><p class="muted" style="margin:0">No news now.</p></section>'}
  <p style="margin:4px 0 0"><a class="up-lk" href="https://www.moj.go.jp/isa/publications/newslist/" target="_blank" rel="noopener">Immigration Services Agency news ↗</a></p>
  <h2 class="up-sec">🗓 Tests you can book any time</h2>${op}
  <p class="muted" style="font-size:12px;margin:14px 0">Last checked: ${esc(d.checked||'')}. Dates can change, so please confirm on the official page.</p>`);
  quakes()};
})();
