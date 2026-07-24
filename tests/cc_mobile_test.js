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

    // 1. Nav basse CC visible
    const bnav=await p.evaluate(()=>{var n=document.getElementById('cc-bottom-nav');return n?{vis:n.style.display!=='none',h:n.offsetHeight}:null;});
    log('Nav basse CC visible',bnav&&bnav.vis,'height='+((bnav||{}).h||0));

    // 2. Header compact
    const hdr=await p.evaluate(()=>{var sub=document.querySelector('.cc-subtitle');return sub?getComputedStyle(sub).display:'?';});
    log('Sous-titre masqué mobile',hdr==='none','display='+hdr);

    // 3. Bandeau masqué
    const bandeau=await p.evaluate(()=>{var b=document.getElementById('bandeau-communiques');return b?getComputedStyle(b).display:'?';});
    log('Bandeau masqué en CC mobile',bandeau==='none','display='+bandeau);

    // 4. KPI 3 colonnes
    const kpi=await p.evaluate(()=>{var g=document.getElementById('cc-kpis');return g?getComputedStyle(g).gridTemplateColumns.split(' ').length:0;});
    log('KPI 3 colonnes',kpi===3,'cols='+kpi);

    await p.screenshot({path:path.join(DOCS,'cc_mob_pilotage_fr.png'),fullPage:false});
    log('Capture Pilotage FR',true,'cc_mob_pilotage_fr.png');

    // 5. Priorité compact ~64px
    const prioRow=await p.evaluate(()=>{
      var rows=document.querySelectorAll('.cc-priority-row');
      if(!rows.length) return null;
      var r=rows[0];
      return {h:r.offsetHeight,chevron:!!r.querySelector('.cc-priority-chevron'),actionsHidden:getComputedStyle(r.querySelector('.cc-priority-actions')).display==='none'};
    });
    log('Priorité compact ~64px',prioRow&&prioRow.h>=50&&prioRow.h<=80,'height='+((prioRow||{}).h||0));
    log('Priorité chevron + actions masquées',prioRow&&prioRow.chevron&&prioRow.actionsHidden,'ok');

    // 6. Drawer priorités
    await p.evaluate(()=>{var btn=document.querySelector('.cc-mob-voir-toutes');if(btn)btn.click();});
    await new Promise(r=>setTimeout(r,800));
    const pdrawer=await p.evaluate(()=>{var d=document.getElementById('cc-prio-drawer');return d?{vis:d.offsetHeight>0,rows:d.querySelectorAll('.cc-priority-row').length}:null;});
    log('Priorités drawer plein écran',pdrawer&&pdrawer.vis&&pdrawer.rows>=3,'rows='+(pdrawer?pdrawer.rows:0));
    await p.evaluate(()=>ccMobilePrioritiesClose());
    await new Promise(r=>setTimeout(r,500));

    // ═══ ANOMALIE 1 : CARTE CENTRÉE SUR ALGER ═══
    // Clic DOM réel sur l'onglet Carte via le bouton
    await p.evaluate(()=>document.querySelector('[data-cc-tab="carte"]').click());
    await new Promise(r=>setTimeout(r,1500));

    const mapCenter=await p.evaluate(()=>{
      if(!_ccMap) return null;
      var c=_ccMap.getCenter();
      return {lat:c.lat,lng:c.lng,zoom:_ccMap.getZoom()};
    });
    var latOK=mapCenter&&Math.abs(mapCenter.lat-36.7538)<0.01;
    var lngOK=mapCenter&&Math.abs(mapCenter.lng-3.0588)<0.01;
    log('Carte centrée sur Alger',latOK&&lngOK&&mapCenter.zoom===11,
      'lat='+((mapCenter||{}).lat||0).toFixed(4)+' lng='+((mapCenter||{}).lng||0).toFixed(4)+' zoom='+((mapCenter||{}).zoom));
    await p.screenshot({path:path.join(DOCS,'cc_mob_carte_fr.png'),fullPage:false});
    log('Capture Carte centrée Alger',true,'cc_mob_carte_fr.png');

    // ═══ CYCLE COMPLET : aperçu → plein écran → retour ═══
    await p.evaluate(()=>document.querySelector('.cc-mob-open-map').click());
    await new Promise(r=>setTimeout(r,1500));
    const fsMap1=await p.evaluate(()=>{var o=document.getElementById('cc-map-fullscreen');return o&&!o.classList.contains('hidden');});
    log('Carte fullscreen ouverte',fsMap1,'visible');
    await p.screenshot({path:path.join(DOCS,'cc_mob_carte_fs.png'),fullPage:false});

    // Fermeture
    await p.evaluate(()=>document.querySelector('.cc-map-fs-close').click());
    await new Promise(r=>setTimeout(r,1500));
    const preview1=await p.evaluate(()=>{var m=document.getElementById('cc-map');return m?m.offsetHeight:0;});
    const previewCenter=await p.evaluate(()=>{if(!_ccMap)return null;var c=_ccMap.getCenter();return {lat:c.lat,lng:c.lng};});
    var pLatOK=previewCenter&&Math.abs(previewCenter.lat-36.7538)<0.01;
    log('Retour aperçu 240px + centrée',preview1>100&&preview1<300&&pLatOK,'height='+preview1+' lat='+((previewCenter||{}).lat||0).toFixed(4));
    await p.screenshot({path:path.join(DOCS,'cc_mob_carte_after_close.png'),fullPage:false});
    log('Capture aperçu après fermeture',true,'cc_mob_carte_after_close.png');

    // ═══ ANOMALIE 2 : 6 EPIC PRIORITAIRES ═══
    await p.evaluate(()=>ccMobileTab('organismes'));
    await new Promise(r=>setTimeout(r,1000));

    const epicData=await p.evaluate(()=>{
      var grid=document.getElementById('cc-epics-prio');
      if(!grid) return null;
      var cards=grid.querySelectorAll('.cc-epic-card');
      var names=[];
      cards.forEach(function(c){
        var n=c.querySelector('.cc-epic-name');
        names.push(n?n.textContent.substring(0,30):'?');
      });
      var dots=grid.parentNode.querySelector('.cc-carousel-dots');
      return {count:cards.length,names:names,gridW:grid.offsetWidth,scrollW:grid.scrollWidth,dots:dots?dots.children.length:0};
    });
    log('6 EPIC prioritaires affichés',epicData&&epicData.count===6,'count='+((epicData||{}).count)+' noms='+JSON.stringify((epicData||{}).names));
    log('EPIC bord suivant visible',epicData&&epicData.scrollW>epicData.gridW,'gridW='+((epicData||{}).gridW)+' scrollW='+((epicData||{}).scrollW));
    log('Dots pagination EPIC',epicData&&epicData.dots===6,((epicData||{}).dots)+' dots');

    await p.screenshot({path:path.join(DOCS,'cc_mob_organismes_fr.png'),fullPage:false});
    log('Capture Organismes (1ère carte)',true,'cc_mob_organismes_fr.png');

    // Scroll jusqu'à CET (6ème carte)
    await p.evaluate(()=>{
      var grid=document.getElementById('cc-epics-prio');
      if(grid) grid.scrollLeft=grid.scrollWidth;
    });
    await new Promise(r=>setTimeout(r,500));
    const lastCard=await p.evaluate(()=>{
      var grid=document.getElementById('cc-epics-prio');
      var cards=grid.querySelectorAll('.cc-epic-card');
      var last=cards[cards.length-1];
      return last?{name:last.querySelector('.cc-epic-name').textContent,visible:last.offsetWidth>0}:null;
    });
    log('CET visible après scroll',lastCard&&lastCard.visible&&(lastCard.name.includes('enfouissement')||lastCard.name.includes('CET')),'nom='+((lastCard||{}).name||'').substring(0,50));
    await p.screenshot({path:path.join(DOCS,'cc_mob_epic_cet.png'),fullPage:false});
    log('Capture EPIC CET (dernière)',true,'cc_mob_epic_cet.png');

    // EPIC stats 4 colonnes
    const epicStats=await p.evaluate(()=>{
      var grid=document.querySelector('.cc-epic-stats');
      if(!grid) return null;
      return getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    });
    log('EPIC stats 4 colonnes',epicStats===4,'cols='+epicStats);

    // Direction carousel
    const dirCards=await p.evaluate(()=>{
      var grid=document.getElementById('cc-directions');
      if(!grid) return null;
      var dots=grid.parentNode.querySelector('.cc-carousel-dots');
      return {count:grid.querySelectorAll('.cc-dir-card').length,scrollW:grid.scrollWidth,gridW:grid.offsetWidth,dots:dots?dots.children.length:0};
    });
    log('Carrousel directions lisible',dirCards&&dirCards.scrollW>dirCards.gridW,'gridW='+((dirCards||{}).gridW)+' scrollW='+((dirCards||{}).scrollW)+' dots='+((dirCards||{}).dots));

    // Plus menu
    await p.evaluate(()=>ccMobileTab('plus'));
    await new Promise(r=>setTimeout(r,500));
    const plusItems=await p.evaluate(()=>document.querySelectorAll('.cc-plus-item').length);
    log('Plus menu 5 items',plusItems===5,plusItems+' items');

    // AR mode
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
    const noOverflow=await p.evaluate(()=>document.documentElement.scrollWidth<=360);
    log('360px pas de débordement',noOverflow,'scrollWidth='+await p.evaluate(()=>document.documentElement.scrollWidth));

    // Touch targets ≥44px
    const minTouch=await p.evaluate(()=>{
      var els=document.querySelectorAll('.cc-bnav-item,.cc-kpi-card,.cc-mob-voir-toutes,.cc-mob-open-map,.cc-priority-row');
      var min=999;
      els.forEach(e=>{var h=e.offsetHeight;if(h>0&&h<min)min=h;});
      return min;
    });
    log('Zones tactiles ≥44px',minTouch>=44,'min='+minTouch+'px');

    // Board total
    const total=await p.evaluate(async()=>{var t=localStorage.getItem('civismart_token');var r=await fetch('/api/signaler/board',{headers:{Authorization:'Bearer '+t}});var d=await r.json();return Array.isArray(d)?d.length:-1;});
    log('Total signalements',total===122,'total='+total);

    await p.close();

    // ── CONTRE-TESTS ──
    await new Promise(r=>setTimeout(r,2000));
    const p2=await login(b,'0550000007','admin@@1234');
    await p2.setViewport({width:390,height:844,isMobile:true});
    await new Promise(r=>setTimeout(r,1000));
    const nassimCCNav=await p2.evaluate(()=>{var n=document.getElementById('cc-bottom-nav');return n?n.style.display:'?';});
    log('Nassim: pas de nav CC',nassimCCNav==='none'||nassimCCNav==='','display='+nassimCCNav);
    await p2.close();

    await new Promise(r=>setTimeout(r,2000));
    const p3=await login(b,'0550000001','admin1234');
    await p3.setViewport({width:390,height:844,isMobile:true});
    await new Promise(r=>setTimeout(r,1000));
    const aminaCCNav=await p3.evaluate(()=>{var n=document.getElementById('cc-bottom-nav');return n?n.style.display:'?';});
    log('Amina: pas de nav CC',aminaCCNav==='none'||aminaCCNav==='','display='+aminaCCNav);
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
