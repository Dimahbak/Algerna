#!/usr/bin/env node
const puppeteer = require('puppeteer');
const path = require('path');
const BASE = 'https://civismart.pylcom.app';
const DOCS = path.join(__dirname, '..', 'docs');
const results = [];
function log(l,ok,d){results.push({l,s:ok?'OUI':'NON',d});console.log((ok?'✅':'❌')+' '+l+' — '+d);}

async function login(b,tel,mdp){
  const p=await b.newPage();
  await p.goto(BASE+'/',{waitUntil:'networkidle2',timeout:25000});
  await p.waitForSelector('#login-tel',{timeout:10000});
  await p.type('#login-tel',tel);await p.type('#login-mdp',mdp);
  await p.evaluate(()=>document.getElementById('login-btn').click());
  await p.waitForSelector('.sidebar',{timeout:15000});
  await new Promise(r=>setTimeout(r,2500));
  return p;
}

(async()=>{
  const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-gpu']});
  try{
    // ── RACHID MOBILE 390×844 ──
    const p=await login(b,'0550000003','admin@@1234');
    await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
    await p.evaluate(()=>document.querySelector('[data-view="command-center"]').click());
    await new Promise(r=>setTimeout(r,4000));

    // 1. CC bottom nav visible
    const bnav=await p.evaluate(()=>{var n=document.getElementById('cc-bottom-nav');return n?{vis:n.style.display!=='none',h:n.offsetHeight}:null;});
    log('Nav basse CC visible',bnav&&bnav.vis,'height='+((bnav||{}).h||0));

    // 2. Header compact — subtitle hidden
    const hdr=await p.evaluate(()=>{var sub=document.querySelector('.cc-subtitle');return sub?getComputedStyle(sub).display:'?';});
    log('Sous-titre masqué mobile',hdr==='none','display='+hdr);

    // 3. Bandeau masqué en CC mobile
    const bandeau=await p.evaluate(()=>{var b=document.getElementById('bandeau-communiques');return b?getComputedStyle(b).display:'?';});
    log('Bandeau masqué en CC mobile',bandeau==='none','display='+bandeau);

    // 4. KPI 3×2 — check grid
    const kpi=await p.evaluate(()=>{var g=document.getElementById('cc-kpis');return g?{cols:getComputedStyle(g).gridTemplateColumns,h:g.offsetHeight}:null;});
    log('KPI 3 colonnes',kpi&&kpi.cols&&kpi.cols.split(' ').length===3,'cols='+((kpi||{}).cols||'?'));

    await p.screenshot({path:path.join(DOCS,'cc_mob_pilotage_fr.png'),fullPage:false});
    log('Capture Pilotage FR',true,'cc_mob_pilotage_fr.png');

    // 5. Priority row compact ~64px with chevron
    const prioRow=await p.evaluate(()=>{
      var rows=document.querySelectorAll('.cc-priority-row');
      if(!rows.length) return null;
      var r=rows[0];
      var h=r.offsetHeight;
      var chevron=r.querySelector('.cc-priority-chevron');
      var actions=r.querySelector('.cc-priority-actions');
      var actionsVis=actions?getComputedStyle(actions).display:'?';
      var title=r.querySelector('.cc-priority-title');
      var titleOvf=title?getComputedStyle(title).overflow:'?';
      return {h:h,chevron:!!chevron,actionsHidden:actionsVis==='none',titleEllipsis:titleOvf==='hidden'};
    });
    log('Priorité compact ~64px',prioRow&&prioRow.h>=50&&prioRow.h<=80,'height='+((prioRow||{}).h||0));
    log('Priorité chevron présent',prioRow&&prioRow.chevron,'trouvé');
    log('Priorité actions masquées',prioRow&&prioRow.actionsHidden,'display=none');
    log('Priorité titre tronqué',prioRow&&prioRow.titleEllipsis,'overflow=hidden');

    // 6. KPI click → dropdown
    await p.evaluate(()=>document.querySelector('.cc-kpi-card[data-kpi="sla"]').click());
    await new Promise(r=>setTimeout(r,800));
    const dd=await p.evaluate(()=>{var d=document.getElementById('cc-kpi-dropdown');return d&&d.classList.contains('cc-dd-open');});
    log('KPI SLA → dropdown mobile',dd,'ouvert');
    await p.evaluate(()=>document.querySelector('.cc-kpi-dd-close').click());
    await new Promise(r=>setTimeout(r,300));

    // 7. Priority → drawer fullscreen
    await p.evaluate(()=>{var btn=document.querySelector('.cc-mob-voir-toutes');if(btn)btn.click();});
    await new Promise(r=>setTimeout(r,800));
    const pdrawer=await p.evaluate(()=>{var d=document.getElementById('cc-prio-drawer');return d?{vis:d.offsetHeight>0,rows:d.querySelectorAll('.cc-priority-row').length}:null;});
    log('Priorités drawer plein écran',pdrawer&&pdrawer.vis&&pdrawer.rows>=3,'rows='+(pdrawer?pdrawer.rows:0));
    await p.screenshot({path:path.join(DOCS,'cc_mob_priorities_drawer.png'),fullPage:false});
    await p.evaluate(()=>ccMobilePrioritiesClose());
    await new Promise(r=>setTimeout(r,500));

    // 8. Tab Carte + fullscreen cycle ×2
    await p.evaluate(()=>ccMobileTab('carte'));
    await new Promise(r=>setTimeout(r,1000));
    await p.screenshot({path:path.join(DOCS,'cc_mob_carte_fr.png'),fullPage:false});
    log('Capture Carte',true,'cc_mob_carte_fr.png');

    await p.evaluate(()=>ccMapFullscreenOpen());
    await new Promise(r=>setTimeout(r,1000));
    const fsMap1=await p.evaluate(()=>{var o=document.getElementById('cc-map-fullscreen');return o&&!o.classList.contains('hidden');});
    log('Carte fullscreen ouverte (1)',fsMap1,'visible');
    await p.screenshot({path:path.join(DOCS,'cc_mob_carte_fs.png'),fullPage:false});
    await p.evaluate(()=>ccMapFullscreenClose());
    await new Promise(r=>setTimeout(r,800));
    const preview1=await p.evaluate(()=>{var m=document.getElementById('cc-map');return m?m.offsetHeight:0;});
    log('Aperçu 240px après fermeture (1)',preview1>100&&preview1<300,'height='+preview1);

    await p.evaluate(()=>ccMapFullscreenOpen());
    await new Promise(r=>setTimeout(r,800));
    await p.evaluate(()=>ccMapFullscreenClose());
    await new Promise(r=>setTimeout(r,800));
    const preview2=await p.evaluate(()=>{var m=document.getElementById('cc-map');return m?m.offsetHeight:0;});
    log('Aperçu 240px après fermeture (2)',preview2>100&&preview2<300,'height='+preview2);

    // 9. Tab Organismes — carousels
    await p.evaluate(()=>ccMobileTab('organismes'));
    await new Promise(r=>setTimeout(r,1000));

    // Direction cards readable — min-width ~200px, next card edge visible
    const dirCards=await p.evaluate(()=>{
      var grid=document.querySelector('.cc-directions-grid');
      if(!grid) return null;
      var cards=grid.querySelectorAll('.cc-dir-card');
      var firstW=cards[0]?cards[0].offsetWidth:0;
      var containerW=grid.offsetWidth;
      var dots=grid.parentNode.querySelector('.cc-carousel-dots');
      return {count:cards.length,firstW:firstW,containerW:containerW,edgeVisible:firstW<containerW,dots:dots?dots.children.length:0};
    });
    log('Carrousel directions lisible',dirCards&&dirCards.edgeVisible,'cardW='+((dirCards||{}).firstW||0)+' containerW='+((dirCards||{}).containerW||0));
    log('Dots indicateurs directions',dirCards&&dirCards.dots>0,((dirCards||{}).dots||0)+' dots');

    // EPIC stats in 1 row of 4
    const epicStats=await p.evaluate(()=>{
      var grid=document.querySelector('.cc-epic-stats');
      if(!grid) return null;
      var cols=getComputedStyle(grid).gridTemplateColumns;
      return {cols:cols,count:cols.split(' ').length};
    });
    log('EPIC stats 4 colonnes',epicStats&&epicStats.count===4,'cols='+((epicStats||{}).cols||'?'));

    await p.screenshot({path:path.join(DOCS,'cc_mob_organismes_fr.png'),fullPage:false});
    log('Capture Organismes',true,'cc_mob_organismes_fr.png');

    // 10. Tab Plus
    await p.evaluate(()=>ccMobileTab('plus'));
    await new Promise(r=>setTimeout(r,500));
    const plusItems=await p.evaluate(()=>document.querySelectorAll('.cc-plus-item').length);
    log('Plus menu items',plusItems===5,plusItems+' items');
    await p.screenshot({path:path.join(DOCS,'cc_mob_plus_fr.png'),fullPage:false});

    // Plus → Briefing sub-view
    await p.evaluate(()=>ccMobilePlusView('plus-briefing'));
    await new Promise(r=>setTimeout(r,500));
    const briefVis=await p.evaluate(()=>{var s=document.querySelector('[data-cc-section="plus-briefing"]');return s&&s.classList.contains('cc-sec-vis');});
    log('Plus → Briefing vue seule',briefVis,'visible');
    const backBtn=await p.evaluate(()=>!!document.querySelector('.cc-mob-back'));
    log('Bouton ← Plus présent',backBtn,'trouvé');
    await p.screenshot({path:path.join(DOCS,'cc_mob_briefing_fr.png'),fullPage:false});
    await p.evaluate(()=>ccMobileTab('plus'));
    await new Promise(r=>setTimeout(r,300));

    // 11. AR mode
    await p.evaluate(()=>setLang('ar'));
    await new Promise(r=>setTimeout(r,1500));
    await p.evaluate(()=>ccMobileTab('pilotage'));
    await new Promise(r=>setTimeout(r,500));
    await p.screenshot({path:path.join(DOCS,'cc_mob_pilotage_ar.png'),fullPage:false});
    log('Capture Pilotage AR',true,'cc_mob_pilotage_ar.png');
    await p.evaluate(()=>setLang('fr'));
    await new Promise(r=>setTimeout(r,500));

    // 12. 360px no overflow
    await p.setViewport({width:360,height:780,isMobile:true});
    await p.evaluate(()=>ccMobileTab('pilotage'));
    await new Promise(r=>setTimeout(r,500));
    const noOverflow=await p.evaluate(()=>document.documentElement.scrollWidth<=360);
    log('360px pas de débordement',noOverflow,'scrollWidth='+await p.evaluate(()=>document.documentElement.scrollWidth));
    await p.screenshot({path:path.join(DOCS,'cc_mob_360.png'),fullPage:false});

    // 13. Touch targets ≥44px
    const minTouch=await p.evaluate(()=>{
      var els=document.querySelectorAll('.cc-bnav-item,.cc-kpi-card,.cc-mob-voir-toutes,.cc-mob-open-map,.cc-priority-row');
      var min=999;
      els.forEach(e=>{var h=e.offsetHeight;if(h>0&&h<min)min=h;});
      return min;
    });
    log('Zones tactiles ≥44px',minTouch>=44,'min='+minTouch+'px');

    // 14. Board total
    const total=await p.evaluate(async()=>{var t=localStorage.getItem('civismart_token');var r=await fetch('/api/signaler/board',{headers:{Authorization:'Bearer '+t}});var d=await r.json();return Array.isArray(d)?d.length:-1;});
    log('Total signalements',total===122,'total='+total);

    // 15. Direction critiques aligned with KPI
    const critData=await p.evaluate(async()=>{
      var t=localStorage.getItem('civismart_token');
      var r=await fetch('/api/command-center/overview?period=30d',{headers:{Authorization:'Bearer '+t}});
      var d=await r.json();
      var kpiCrit=d.summary?d.summary.criticalCases:null;
      var dirCritTotal=0;
      (d.directions||[]).forEach(function(dir){dirCritTotal+=parseInt(dir.critiques)||0;});
      return {kpi:kpiCrit,dirTotal:dirCritTotal};
    });
    log('Critiques direction ≤ KPI global',critData&&critData.dirTotal<=critData.kpi,'kpi='+((critData||{}).kpi)+' dirTotal='+((critData||{}).dirTotal));

    await p.close();

    // ── CONTRE-TESTS ──
    await new Promise(r=>setTimeout(r,2000));

    // Nassim mobile
    const p2=await login(b,'0550000007','admin@@1234');
    await p2.setViewport({width:390,height:844,isMobile:true});
    await new Promise(r=>setTimeout(r,1000));
    const nassimCCNav=await p2.evaluate(()=>{var n=document.getElementById('cc-bottom-nav');return n?n.style.display:'?';});
    log('Nassim: pas de nav CC',nassimCCNav==='none'||nassimCCNav==='','display='+nassimCCNav);
    await p2.screenshot({path:path.join(DOCS,'cc_mob_nassim.png'),fullPage:false});
    await p2.close();

    await new Promise(r=>setTimeout(r,2000));

    // Amina mobile
    const p3=await login(b,'0550000001','admin1234');
    await p3.setViewport({width:390,height:844,isMobile:true});
    await new Promise(r=>setTimeout(r,1000));
    const aminaCCNav=await p3.evaluate(()=>{var n=document.getElementById('cc-bottom-nav');return n?n.style.display:'?';});
    log('Amina: pas de nav CC',aminaCCNav==='none'||aminaCCNav==='','display='+aminaCCNav);
    await p3.screenshot({path:path.join(DOCS,'cc_mob_amina.png'),fullPage:false});
    await p3.close();

  }catch(e){console.error('ERR:',e.message);log('Erreur',false,e.message);}
  finally{await b.close();}

  console.log('\n═══ RÉSUMÉ ═══');
  results.forEach(r=>console.log(r.s+' | '+r.l+' | '+r.d));
  var fails=results.filter(r=>r.s==='NON');
  console.log('\n'+(results.length-fails.length)+'/'+results.length+' OK');
  if(fails.length){console.log('ÉCHECS:');fails.forEach(f=>console.log('  ❌ '+f.l+': '+f.d));}
  process.exit(fails.length?1:0);
})();
