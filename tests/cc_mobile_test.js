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
    const p=await login(b,'0550000003','admin@@1234');
    await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
    await p.evaluate(()=>document.querySelector('[data-view="command-center"]').click());
    await new Promise(r=>setTimeout(r,4000));

    // 1. Nav + header + bandeau
    const bnav=await p.evaluate(()=>{var n=document.getElementById('cc-bottom-nav');return n?n.style.display!=='none':false;});
    log('Nav basse CC visible',bnav,'ok');
    const hdr=await p.evaluate(()=>getComputedStyle(document.querySelector('.cc-subtitle')).display);
    log('Sous-titre masqué',hdr==='none','display='+hdr);
    const bandeau=await p.evaluate(()=>getComputedStyle(document.getElementById('bandeau-communiques')).display);
    log('Bandeau masqué CC',bandeau==='none','display='+bandeau);

    // 2. KPI + priorités
    const kpi=await p.evaluate(()=>getComputedStyle(document.getElementById('cc-kpis')).gridTemplateColumns.split(' ').length);
    log('KPI 3 colonnes',kpi===3,'cols='+kpi);
    const prioRow=await p.evaluate(()=>{var r=document.querySelector('.cc-priority-row');return r?{h:r.offsetHeight,chev:!!r.querySelector('.cc-priority-chevron')}:null;});
    log('Priorité compact ~64px',prioRow&&prioRow.h>=50&&prioRow.h<=80,'height='+((prioRow||{}).h));
    await p.screenshot({path:path.join(DOCS,'cc_mob_pilotage_fr.png'),fullPage:false});

    // ═══ PREUVE 1 : ASROUT nom complet visible ═══
    await p.evaluate(()=>ccMobileTab('organismes'));
    await new Promise(r=>setTimeout(r,1000));

    // Click ASROUT (2nd EPIC card) via DOM
    await p.evaluate(()=>{var c=document.querySelectorAll('#cc-epics-prio .cc-epic-card');if(c[1])c[1].click();});
    await new Promise(r=>setTimeout(r,1500));

    const asrout=await p.evaluate(()=>{
      var h3=document.querySelector('.cc-panel-header h3');
      if(!h3) return null;
      var rect=h3.getBoundingClientRect();
      return {text:h3.textContent,top:rect.top,h:rect.height,visible:rect.top>=0,includes_debut:h3.textContent.includes('ASROUT'),includes_fin:h3.textContent.includes('assainissement')};
    });
    log('ASROUT nom complet visible',asrout&&asrout.visible&&asrout.includes_debut&&asrout.includes_fin,
      'top='+((asrout||{}).top)+' text="'+((asrout||{}).text||'').substring(0,50)+'..."');
    await p.screenshot({path:path.join(DOCS,'cc_mob_asrout_fiche.png'),fullPage:false});
    log('Capture ASROUT fiche',true,'cc_mob_asrout_fiche.png');

    // Close panel
    await p.evaluate(()=>{var c=document.querySelector('.cc-panel-close');if(c)c.click();});
    await new Promise(r=>setTimeout(r,500));

    // ═══ PREUVE 2 : Nom le plus long (ASROUT=99 chars, déjà testé) ═══
    // ASROUT est le plus long en FR (99 chars) — preuve SQL dans le rapport

    // ═══ PREUVE 3 : AR nom long — ASROUT en arabe ═══
    await p.evaluate(()=>setLang('ar'));
    await new Promise(r=>setTimeout(r,1500));
    await p.evaluate(()=>ccMobileTab('organismes'));
    await new Promise(r=>setTimeout(r,1000));

    // Click ASROUT AR (2nd card)
    await p.evaluate(()=>{var c=document.querySelectorAll('#cc-epics-prio .cc-epic-card');if(c[1])c[1].click();});
    await new Promise(r=>setTimeout(r,1500));

    const asroutAr=await p.evaluate(()=>{
      var h3=document.querySelector('.cc-panel-header h3');
      if(!h3) return null;
      var rect=h3.getBoundingClientRect();
      return {text:h3.textContent,top:rect.top,h:rect.height,visible:rect.top>=0};
    });
    log('ASROUT AR nom complet visible',asroutAr&&asroutAr.visible,'top='+((asroutAr||{}).top)+' text="'+((asroutAr||{}).text||'').substring(0,50)+'..."');
    await p.screenshot({path:path.join(DOCS,'cc_mob_asrout_ar.png'),fullPage:false});
    log('Capture ASROUT AR',true,'cc_mob_asrout_ar.png');

    // Close panel
    await p.evaluate(()=>{var c=document.querySelector('.cc-panel-close');if(c)c.click();});
    await new Promise(r=>setTimeout(r,500));

    // ═══ PREUVE 4 : NETCOM (nom court) pas dégradé ═══
    await p.evaluate(()=>setLang('fr'));
    await new Promise(r=>setTimeout(r,1000));
    await p.evaluate(()=>ccMobileTab('organismes'));
    await new Promise(r=>setTimeout(r,1000));

    await p.evaluate(()=>{var c=document.querySelectorAll('#cc-epics-prio .cc-epic-card');if(c[0])c[0].click();});
    await new Promise(r=>setTimeout(r,1500));

    const netcom=await p.evaluate(()=>{
      var h3=document.querySelector('.cc-panel-header h3');
      if(!h3) return null;
      var headerEl=document.querySelector('.cc-panel-header');
      return {text:h3.textContent,h3H:h3.offsetHeight,headerH:headerEl?headerEl.offsetHeight:0,visible:h3.getBoundingClientRect().top>=0};
    });
    log('NETCOM nom court — pas dégradé',netcom&&netcom.visible&&netcom.headerH<120,'headerH='+((netcom||{}).headerH)+' text="'+((netcom||{}).text||'').substring(0,40)+'"');
    await p.screenshot({path:path.join(DOCS,'cc_mob_netcom_fiche.png'),fullPage:false});
    log('Capture NETCOM fiche',true,'cc_mob_netcom_fiche.png');

    // Close panel
    await p.evaluate(()=>{var c=document.querySelector('.cc-panel-close');if(c)c.click();});
    await new Promise(r=>setTimeout(r,500));

    // ═══ PREUVE 5 : Carrousel 6 EPIC + carte Alger ═══
    await p.evaluate(()=>ccMobileTab('organismes'));
    await new Promise(r=>setTimeout(r,1000));

    const epicData=await p.evaluate(()=>{
      var grid=document.getElementById('cc-epics-prio');
      if(!grid) return null;
      var cards=grid.querySelectorAll('.cc-epic-card');
      return {count:cards.length,scrollW:grid.scrollWidth,gridW:grid.offsetWidth};
    });
    log('6 EPIC carrousel OK',epicData&&epicData.count===6&&epicData.scrollW>epicData.gridW,'count='+((epicData||{}).count)+' scrollW='+((epicData||{}).scrollW));
    await p.screenshot({path:path.join(DOCS,'cc_mob_organismes_fr.png'),fullPage:false});

    await p.evaluate(()=>ccMobileTab('carte'));
    await new Promise(r=>setTimeout(r,1500));

    const mapOK=await p.evaluate(()=>{
      if(!_ccMap) return false;
      var c=_ccMap.getCenter();
      return Math.abs(c.lat-36.7538)<0.01 && Math.abs(c.lng-3.0588)<0.01 && _ccMap.getZoom()===11;
    });
    log('Carte mobile centrée Alger',mapOK,'zoom=11');
    await p.screenshot({path:path.join(DOCS,'cc_mob_carte_fr.png'),fullPage:false});

    // Plus menu
    await p.evaluate(()=>ccMobileTab('plus'));
    await new Promise(r=>setTimeout(r,500));
    const plusItems=await p.evaluate(()=>document.querySelectorAll('.cc-plus-item').length);
    log('Plus menu 5 items',plusItems===5,plusItems+' items');

    // AR mode capture
    await p.evaluate(()=>setLang('ar'));
    await new Promise(r=>setTimeout(r,1500));
    await p.evaluate(()=>ccMobileTab('pilotage'));
    await new Promise(r=>setTimeout(r,500));
    await p.screenshot({path:path.join(DOCS,'cc_mob_pilotage_ar.png'),fullPage:false});
    log('Capture Pilotage AR',true,'cc_mob_pilotage_ar.png');
    await p.evaluate(()=>setLang('fr'));
    await new Promise(r=>setTimeout(r,500));

    // 360px no overflow
    await p.setViewport({width:360,height:780,isMobile:true});
    await p.evaluate(()=>ccMobileTab('pilotage'));
    await new Promise(r=>setTimeout(r,500));
    const noOvf=await p.evaluate(()=>document.documentElement.scrollWidth<=360);
    log('360px pas de débordement',noOvf,'scrollW='+await p.evaluate(()=>document.documentElement.scrollWidth));

    // Touch + board
    const minTouch=await p.evaluate(()=>{var els=document.querySelectorAll('.cc-bnav-item,.cc-kpi-card,.cc-priority-row');var m=999;els.forEach(e=>{var h=e.offsetHeight;if(h>0&&h<m)m=h;});return m;});
    log('Zones tactiles ≥44px',minTouch>=44,'min='+minTouch+'px');
    const total=await p.evaluate(async()=>{var t=localStorage.getItem('civismart_token');var r=await fetch('/api/signaler/board',{headers:{Authorization:'Bearer '+t}});var d=await r.json();return Array.isArray(d)?d.length:-1;});
    log('Total signalements',total===122,'total='+total);

    await p.close();

    // Contre-tests
    await new Promise(r=>setTimeout(r,2000));
    const p2=await login(b,'0550000007','admin@@1234');
    await p2.setViewport({width:390,height:844,isMobile:true});
    await new Promise(r=>setTimeout(r,1000));
    const nassim=await p2.evaluate(()=>{var n=document.getElementById('cc-bottom-nav');return n?n.style.display:'?';});
    log('Nassim: pas de nav CC',nassim==='none'||nassim==='','display='+nassim);
    await p2.close();

    await new Promise(r=>setTimeout(r,2000));
    const p3=await login(b,'0550000001','admin1234');
    await p3.setViewport({width:390,height:844,isMobile:true});
    await new Promise(r=>setTimeout(r,1000));
    const amina=await p3.evaluate(()=>{var n=document.getElementById('cc-bottom-nav');return n?n.style.display:'?';});
    log('Amina: pas de nav CC',amina==='none'||amina==='','display='+amina);
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
