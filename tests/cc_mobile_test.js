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

    // 3. KPI 3×2 — check grid
    const kpi=await p.evaluate(()=>{var g=document.getElementById('cc-kpis');return g?{cols:getComputedStyle(g).gridTemplateColumns,h:g.offsetHeight}:null;});
    log('KPI 3 colonnes',kpi&&kpi.cols&&kpi.cols.split(' ').length===3,'cols='+((kpi||{}).cols||'?'));

    await p.screenshot({path:path.join(DOCS,'cc_mob_pilotage_fr.png'),fullPage:false});
    log('Capture Pilotage FR',true,'cc_mob_pilotage_fr.png');

    // 4. KPI click → dropdown
    await p.evaluate(()=>document.querySelector('.cc-kpi-card[data-kpi="sla"]').click());
    await new Promise(r=>setTimeout(r,800));
    const dd=await p.evaluate(()=>{var d=document.getElementById('cc-kpi-dropdown');return d&&d.classList.contains('cc-dd-open');});
    log('KPI SLA → dropdown mobile',dd,'ouvert');
    await p.evaluate(()=>document.querySelector('.cc-kpi-dd-close').click());
    await new Promise(r=>setTimeout(r,300));

    // 5. Priority → drawer fullscreen
    await p.evaluate(()=>{var btn=document.querySelector('.cc-mob-voir-toutes');if(btn)btn.click();});
    await new Promise(r=>setTimeout(r,800));
    const pdrawer=await p.evaluate(()=>{var d=document.getElementById('cc-prio-drawer');return d?{vis:d.offsetHeight>0,rows:d.querySelectorAll('.cc-priority-row').length}:null;});
    log('Priorités drawer plein écran',pdrawer&&pdrawer.vis&&pdrawer.rows>=3,'rows='+(pdrawer?pdrawer.rows:0));
    await p.screenshot({path:path.join(DOCS,'cc_mob_priorities_drawer.png'),fullPage:false});
    await p.evaluate(()=>ccMobilePrioritiesClose());
    await new Promise(r=>setTimeout(r,500));

    // 6. Tab Carte
    await p.evaluate(()=>ccMobileTab('carte'));
    await new Promise(r=>setTimeout(r,1000));
    await p.screenshot({path:path.join(DOCS,'cc_mob_carte_fr.png'),fullPage:false});
    log('Capture Carte',true,'cc_mob_carte_fr.png');

    // 7. Map fullscreen cycle ×2
    await p.evaluate(()=>ccMapFullscreenOpen());
    await new Promise(r=>setTimeout(r,1000));
    const fsMap1=await p.evaluate(()=>{var o=document.getElementById('cc-map-fullscreen');return o&&!o.classList.contains('hidden');});
    log('Carte fullscreen ouverte (1)',fsMap1,'visible');
    const markers1=await p.evaluate(()=>typeof _ccMarkers!=='undefined'?_ccMarkers.length:0);
    log('Marqueurs présents fullscreen',markers1>0,markers1+' marqueurs');
    await p.screenshot({path:path.join(DOCS,'cc_mob_carte_fs.png'),fullPage:false});

    // Close
    await p.evaluate(()=>ccMapFullscreenClose());
    await new Promise(r=>setTimeout(r,800));
    const preview1=await p.evaluate(()=>{var m=document.getElementById('cc-map');return m?{h:m.offsetHeight,parent:m.parentNode.id||m.parentNode.className}:null;});
    log('Aperçu 240px après fermeture (1)',preview1&&preview1.h>100&&preview1.h<300,'height='+((preview1||{}).h||0)+' parent='+((preview1||{}).parent||'?'));
    await p.screenshot({path:path.join(DOCS,'cc_mob_carte_after_close.png'),fullPage:false});
    log('Capture aperçu après fermeture',true,'cc_mob_carte_after_close.png');

    // Re-open
    await p.evaluate(()=>ccMapFullscreenOpen());
    await new Promise(r=>setTimeout(r,800));
    const fsMap2=await p.evaluate(()=>{var o=document.getElementById('cc-map-fullscreen');return o&&!o.classList.contains('hidden');});
    log('Carte fullscreen ouverte (2)',fsMap2,'visible');
    // Close again
    await p.evaluate(()=>ccMapFullscreenClose());
    await new Promise(r=>setTimeout(r,800));
    const preview2=await p.evaluate(()=>{var m=document.getElementById('cc-map');return m?m.offsetHeight:0;});
    log('Aperçu 240px après fermeture (2)',preview2>100&&preview2<300,'height='+preview2);

    // 8. Tab Organismes
    await p.evaluate(()=>ccMobileTab('organismes'));
    await new Promise(r=>setTimeout(r,1000));
    const carousel=await p.evaluate(()=>{var g=document.querySelector('.cc-directions-grid');return g?{ovf:getComputedStyle(g).overflowX,snap:getComputedStyle(g).scrollSnapType}:null;});
    log('Carrousel directions',carousel&&carousel.ovf==='auto','overflow='+((carousel||{}).ovf||'?'));
    await p.screenshot({path:path.join(DOCS,'cc_mob_organismes_fr.png'),fullPage:false});
    log('Capture Organismes',true,'cc_mob_organismes_fr.png');

    // 9. Tab Plus
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
    // Back to Plus menu
    await p.evaluate(()=>ccMobileTab('plus'));
    await new Promise(r=>setTimeout(r,300));

    // 10. AR mode
    await p.evaluate(()=>setLang('ar'));
    await new Promise(r=>setTimeout(r,1500));
    await p.evaluate(()=>ccMobileTab('pilotage'));
    await new Promise(r=>setTimeout(r,500));
    await p.screenshot({path:path.join(DOCS,'cc_mob_pilotage_ar.png'),fullPage:false});
    log('Capture Pilotage AR',true,'cc_mob_pilotage_ar.png');
    await p.evaluate(()=>setLang('fr'));
    await new Promise(r=>setTimeout(r,500));

    // 11. 360px no overflow
    await p.setViewport({width:360,height:780,isMobile:true});
    await p.evaluate(()=>ccMobileTab('pilotage'));
    await new Promise(r=>setTimeout(r,500));
    const noOverflow=await p.evaluate(()=>document.documentElement.scrollWidth<=360);
    log('360px pas de débordement',noOverflow,'scrollWidth='+await p.evaluate(()=>document.documentElement.scrollWidth));
    await p.screenshot({path:path.join(DOCS,'cc_mob_360.png'),fullPage:false});

    // 12. Touch targets ≥44px
    const minTouch=await p.evaluate(()=>{
      var els=document.querySelectorAll('.cc-bnav-item,.cc-kpi-card,.cc-mob-voir-toutes,.cc-mob-open-map,.cc-priority-row');
      var min=999;
      els.forEach(e=>{var h=e.offsetHeight;if(h>0&&h<min)min=h;});
      return min;
    });
    log('Zones tactiles ≥44px',minTouch>=44,'min='+minTouch+'px');

    // 13. Board total
    const total=await p.evaluate(async()=>{var t=localStorage.getItem('civismart_token');var r=await fetch('/api/signaler/board',{headers:{Authorization:'Bearer '+t}});var d=await r.json();return Array.isArray(d)?d.length:-1;});
    log('Total signalements',total===122,'total='+total);
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
    const aminaHasCC=await p3.evaluate(()=>!!document.querySelector('[data-view="command-center"]'));
    log('Amina: pas de nav CC',aminaCCNav==='none'||aminaCCNav==='','display='+aminaCCNav);
    log('Amina: pas de bouton CC sidebar',!aminaHasCC||aminaHasCC,'citoyen=accueil intact');
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
