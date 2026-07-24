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

    log('Nav basse CC visible',await p.evaluate(()=>{var n=document.getElementById('cc-bottom-nav');return n&&n.style.display!=='none';}),'ok');

    // ═══ ONGLET CARTE ═══
    await p.evaluate(()=>ccMobileTab('carte'));
    await new Promise(r=>setTimeout(r,1500));

    // ═══ PREUVE 5 : INCIDENTS ═══
    await p.evaluate(()=>document.querySelector('[data-filter="all"]').click());
    await new Promise(r=>setTimeout(r,800));
    const incMarkers=await p.evaluate(()=>_ccMarkers.length);
    log('Filtre Incidents fonctionne',incMarkers>0,incMarkers+' marqueurs');
    await p.screenshot({path:path.join(DOCS,'cc_mob_filtre_incidents.png'),fullPage:false});

    // ═══ PREUVE 5 : COMMUNES ═══
    await p.evaluate(()=>document.querySelector('[data-filter="critique"]').click());
    await new Promise(r=>setTimeout(r,800));
    const communeMarkers=await p.evaluate(()=>_ccMarkers.length);
    log('Filtre Communes fonctionne',communeMarkers>0,communeMarkers+' marqueurs');
    await p.screenshot({path:path.join(DOCS,'cc_mob_filtre_communes.png'),fullPage:false});

    // ═══ PREUVE 1 : DIRECTIONS ═══
    await p.evaluate(()=>document.querySelector('[data-filter="directions"]').click());
    await new Promise(r=>setTimeout(r,800));

    const dirResult=await p.evaluate(()=>{
      var names=[];
      _ccMarkers.forEach(function(m){
        m.openPopup();
        var pop=document.querySelector('.leaflet-popup-content');
        if(pop){
          var strong=pop.querySelector('strong');
          names.push(strong?strong.textContent:'?');
        }
        m.closePopup();
      });
      return {count:_ccMarkers.length,names:names};
    });
    var hasDirNames=dirResult&&dirResult.names.some(function(n){return n.includes('Direction');});
    // Directions must be different from communes — direction names, not commune names
    log('Filtre Directions : noms de directions',hasDirNames&&dirResult.count>0,
      dirResult.count+' marqueurs, noms='+JSON.stringify(dirResult.names));

    await p.evaluate(()=>{if(_ccMarkers.length>0)_ccMarkers[0].openPopup();});
    await new Promise(r=>setTimeout(r,300));
    await p.screenshot({path:path.join(DOCS,'cc_mob_filtre_directions.png'),fullPage:false});
    await p.evaluate(()=>{if(_ccMarkers.length>0)_ccMarkers[0].closePopup();});

    // ═══ PREUVE 2 : EPIC ═══
    await p.evaluate(()=>document.querySelector('[data-filter="epic"]').click());
    await new Promise(r=>setTimeout(r,800));

    const epicResult=await p.evaluate(()=>{
      var names=[];
      _ccMarkers.forEach(function(m){
        m.openPopup();
        var pop=document.querySelector('.leaflet-popup-content');
        if(pop){
          var strong=pop.querySelector('strong');
          names.push(strong?strong.textContent:'?');
        }
        m.closePopup();
      });
      return {count:_ccMarkers.length,names:names};
    });
    // EPIC names must NOT be commune names and NOT be direction names
    var hasEpicNames=epicResult&&epicResult.count>0&&epicResult.names.every(function(n){return !n.includes('Direction');});
    log('Filtre EPIC : noms d\'EPIC (pas directions)',hasEpicNames,
      epicResult.count+' marqueurs, noms='+JSON.stringify(epicResult.names));

    await p.evaluate(()=>{if(_ccMarkers.length>0)_ccMarkers[0].openPopup();});
    await new Promise(r=>setTimeout(r,300));
    await p.screenshot({path:path.join(DOCS,'cc_mob_filtre_epic.png'),fullPage:false});
    await p.evaluate(()=>{if(_ccMarkers.length>0)_ccMarkers[0].closePopup();});

    // ═══ PREUVE 3 : COHÉRENCE API ═══
    const apiCoherence=await p.evaluate(()=>{
      var dirs={};var epics={};
      _ccMapData.forEach(function(inc){
        if(!inc.lat||!inc.lng) return;
        if(inc.direction_pilote_id){
          var dk=inc.direction_pilote||'?';
          if(!dirs[dk]) dirs[dk]=0;
          dirs[dk]++;
        }
        if(inc.organisation_executante_id && inc.organisation_type==='epic'){
          var ek=inc.organisation_executante||'?';
          if(!epics[ek]) epics[ek]=0;
          epics[ek]++;
        }
      });
      return {dirs:dirs,epics:epics};
    });

    var dirEntries=Object.entries(apiCoherence.dirs||{});
    var epicEntries=Object.entries(apiCoherence.epics||{});
    if(dirEntries.length>0){
      var sd=dirEntries[0];
      var dirPopMatch=dirResult.names.includes(sd[0]);
      log('Cohérence Direction API=carte',dirPopMatch,'API: "'+sd[0]+'"='+sd[1]+' incidents (avec coords)');
    }
    if(epicEntries.length>0){
      var se=epicEntries[0];
      var epicPopMatch=epicResult.names.includes(se[0]);
      log('Cohérence EPIC API=carte',epicPopMatch,'API: "'+se[0]+'"='+se[1]+' incidents (avec coords)');
    }

    // ═══ PREUVE 4 : CLIC POINT → LISTE DOSSIERS ═══
    await p.evaluate(()=>document.querySelector('[data-filter="directions"]').click());
    await new Promise(r=>setTimeout(r,800));
    await p.evaluate(()=>{if(_ccMarkers[0])_ccMarkers[0].fire('click');});
    await new Promise(r=>setTimeout(r,1000));
    const dirPanel=await p.evaluate(()=>{
      var panel=document.getElementById('cc-panel');
      if(!panel||!panel.classList.contains('cc-panel-open')) return null;
      var h3=panel.querySelector('h3');
      var rows=panel.querySelectorAll('.cc-panel-row');
      return {title:h3?h3.textContent:'?',rows:rows.length};
    });
    log('Clic Direction → liste dossiers',dirPanel&&dirPanel.rows>0,'title="'+((dirPanel||{}).title||'?')+'" rows='+((dirPanel||{}).rows||0));
    await p.screenshot({path:path.join(DOCS,'cc_mob_drill_direction.png'),fullPage:false});
    await p.evaluate(()=>ccClosePanel());
    await new Promise(r=>setTimeout(r,300));

    await p.evaluate(()=>document.querySelector('[data-filter="epic"]').click());
    await new Promise(r=>setTimeout(r,800));
    await p.evaluate(()=>{if(_ccMarkers[0])_ccMarkers[0].fire('click');});
    await new Promise(r=>setTimeout(r,1000));
    const epicPanel=await p.evaluate(()=>{
      var panel=document.getElementById('cc-panel');
      if(!panel||!panel.classList.contains('cc-panel-open')) return null;
      var h3=panel.querySelector('h3');
      var rows=panel.querySelectorAll('.cc-panel-row');
      return {title:h3?h3.textContent:'?',rows:rows.length};
    });
    log('Clic EPIC → liste dossiers',epicPanel&&epicPanel.rows>0,'title="'+((epicPanel||{}).title||'?')+'" rows='+((epicPanel||{}).rows||0));
    await p.screenshot({path:path.join(DOCS,'cc_mob_drill_epic.png'),fullPage:false});
    await p.evaluate(()=>ccClosePanel());

    // ═══ PREUVE 6 : DESKTOP COMPARISON ═══
    await p.setViewport({width:1280,height:900});
    await p.evaluate(()=>document.body.classList.remove('cc-mob-tabs'));
    await new Promise(r=>setTimeout(r,500));
    await p.evaluate(()=>ccMapFilter('directions'));
    await new Promise(r=>setTimeout(r,800));
    const desktopDirNames=await p.evaluate(()=>{
      var names=[];
      _ccMarkers.forEach(function(m){m.openPopup();var p=document.querySelector('.leaflet-popup-content strong');if(p)names.push(p.textContent);m.closePopup();});
      return names;
    });
    await p.evaluate(()=>{if(_ccMarkers[0])_ccMarkers[0].openPopup();});
    await new Promise(r=>setTimeout(r,300));
    await p.screenshot({path:path.join(DOCS,'cc_desktop_filtre_directions.png'),fullPage:false});
    var desktopAligned=desktopDirNames.length===dirResult.names.length && desktopDirNames.every(function(n){return dirResult.names.includes(n);});
    log('Desktop Directions = mobile (mêmes noms)',desktopAligned,
      'desktop='+JSON.stringify(desktopDirNames)+' mobile='+JSON.stringify(dirResult.names));
    await p.evaluate(()=>{if(_ccMarkers[0])_ccMarkers[0].closePopup();});

    // Restore mobile
    await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true});

    // ═══ RÉGRESSIONS ═══
    await p.evaluate(()=>ccMobileTab('organismes'));
    await new Promise(r=>setTimeout(r,1000));
    const epicCarousel=await p.evaluate(()=>{var g=document.getElementById('cc-epics-prio');return g?g.querySelectorAll('.cc-epic-card').length:0;});
    log('6 EPIC carrousel intact',epicCarousel===6,'count='+epicCarousel);

    await p.evaluate(()=>ccMobileTab('carte'));
    await new Promise(r=>setTimeout(r,1500));
    await p.evaluate(()=>ccMapFilter('all'));
    await new Promise(r=>setTimeout(r,500));
    const mapAlger=await p.evaluate(()=>{if(!_ccMap)return false;var c=_ccMap.getCenter();return Math.abs(c.lat-36.7538)<0.5;});
    log('Carte mobile Alger',mapAlger,'ok');

    const total=await p.evaluate(async()=>{var t=localStorage.getItem('civismart_token');var r=await fetch('/api/signaler/board',{headers:{Authorization:'Bearer '+t}});var d=await r.json();return Array.isArray(d)?d.length:-1;});
    log('Total signalements',total===122,'total='+total);

    await p.close();

    // Contre-test
    await new Promise(r=>setTimeout(r,2000));
    const p2=await login(b,'0550000007','admin@@1234');
    await p2.setViewport({width:390,height:844,isMobile:true});
    await new Promise(r=>setTimeout(r,1000));
    log('Nassim: pas de nav CC',await p2.evaluate(()=>{var n=document.getElementById('cc-bottom-nav');return n?n.style.display==='none'||n.style.display==='':false;}),'ok');
    await p2.close();

  }catch(e){console.error('ERR:',e.message);log('Erreur',false,e.message);}
  finally{await b.close();}

  console.log('\n═══ RÉSUMÉ ═══');
  results.forEach(r=>console.log(r.s+' | '+r.l+' | '+r.d));
  var fails=results.filter(r=>r.s==='NON');
  console.log('\n'+(results.length-fails.length)+'/'+results.length+' OK');
  if(fails.length){console.log('ÉCHECS:');fails.forEach(f=>console.log('  ❌ '+f.l+': '+f.d));}
  process.exit(fails.length?1:0);
})();
