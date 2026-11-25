// Smoke test: open the main pages of every course and fail on any JavaScript error.
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:390,height:844}});
  const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  const base='http://localhost:8765/';
  const go=async h=>{await pg.goto(base+h);await pg.waitForTimeout(1500)};
  await go('#home');
  for(const ex of ['n3','n4','n5']){
    await pg.evaluate(ex=>localStorage.setItem('rk_exam',JSON.stringify(ex)),ex);
    for(const h of ['#home','#units','#quiz','#mock','#srs','#review','#words','#books','#pass','#acc','#unlock']){await go(h);
      const n=await pg.evaluate(()=>document.querySelector('main')?document.querySelector('main').innerText.length:0);
      if(n<20)errs.push(ex+' '+h+': page is empty')}
  }
  await pg.evaluate(()=>localStorage.setItem('rk_exam','"n3"'));await go('#home');
  await pg.evaluate(()=>document.querySelector('#splash')&&document.querySelector('#splash').remove());
  await pg.click('[data-go="kanji"]');await pg.waitForTimeout(1200);
  if(!await pg.$('.opt'))errs.push('practice: no questions');
  await b.close();
  if(errs.length){console.error('FAILED\n'+errs.join('\n'));process.exit(1)}console.log('smoke test ok');
})();
