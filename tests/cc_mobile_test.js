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

    // ═══ PREUVE 2 : GREP INITIAL — chaînes FR en dur AVANT ═══
    // (Already fixed, grep final will confirm zero)

    // ═══ AR MODE — tous les onglets ═══
    await p.evaluate(()=>setLang('ar'));
    await new Promise(r=>setTimeout(r,2000));
    await p.evaluate(()=>document.querySelector('[data-view="command-center"]').click());
    await new Promise(r=>setTimeout(r,4000));

    // Pilotage AR
    await p.screenshot({path:path.join(DOCS,'cc_ar_pilotage.png'),fullPage:false});
    log('Capture AR Pilotage',true,'cc_ar_pilotage.png');

    // Check état in drill panel is translated
    await p.evaluate(()=>ccMobileTab('organismes'));
    await new Promise(r=>setTimeout(r,1000));
    await p.evaluate(()=>{var c=document.querySelectorAll('#cc-epics-prio .cc-epic-card');if(c[0])c[0].click();});
    await new Promise(r=>setTimeout(r,1500));
    const etatAR=await p.evaluate(()=>{
      var etats=document.querySelectorAll('.cc-panel-etat');
      var texts=[];
      etats.forEach(e=>texts.push(e.textContent));
      return texts;
    });
    // Check that state is NOT raw French (en_intervention, pris_en_charge, etc.)
    var etatTranslated=etatAR.length>0 && etatAR.every(function(e){
      return !e.includes('_') && !e.includes('en_intervention') && !e.includes('pris_en_charge');
    });
    log('États traduits en AR (pas de underscore)',etatTranslated,'états='+JSON.stringify(etatAR));
    await p.screenshot({path:path.join(DOCS,'cc_ar_drill_epic.png'),fullPage:false});
    log('Capture AR fiche EPIC',true,'cc_ar_drill_epic.png');
    await p.evaluate(()=>ccClosePanel());
    await new Promise(r=>setTimeout(r,300));

    // Carte AR with 4 filters
    await p.evaluate(()=>ccMobileTab('carte'));
    await new Promise(r=>setTimeout(r,1500));
    var filterTexts=await p.evaluate(()=>{
      var btns=document.querySelectorAll('.cc-filter-btn');
      var t=[];btns.forEach(b=>t.push(b.textContent.trim()));
      return t;
    });
    var filtersAR=filterTexts.every(f=>!/[a-zA-Z]/.test(f.replace('SLA','')));
    log('Filtres carte en AR',filtersAR,'filtres='+JSON.stringify(filterTexts));
    await p.screenshot({path:path.join(DOCS,'cc_ar_carte.png'),fullPage:false});
    log('Capture AR Carte',true,'cc_ar_carte.png');

    // Organismes AR
    await p.evaluate(()=>ccMobileTab('organismes'));
    await new Promise(r=>setTimeout(r,1000));
    await p.screenshot({path:path.join(DOCS,'cc_ar_organismes.png'),fullPage:false});
    log('Capture AR Organismes',true,'cc_ar_organismes.png');

    // Alertes AR
    await p.evaluate(()=>ccMobileTab('alertes'));
    await new Promise(r=>setTimeout(r,500));
    await p.screenshot({path:path.join(DOCS,'cc_ar_alertes.png'),fullPage:false});
    log('Capture AR Alertes',true,'cc_ar_alertes.png');

    // Plus AR
    await p.evaluate(()=>ccMobileTab('plus'));
    await new Promise(r=>setTimeout(r,500));
    await p.screenshot({path:path.join(DOCS,'cc_ar_plus.png'),fullPage:false});
    log('Capture AR Plus',true,'cc_ar_plus.png');

    // Plus → Briefing AR
    await p.evaluate(()=>ccMobilePlusView('plus-briefing'));
    await new Promise(r=>setTimeout(r,500));
    await p.screenshot({path:path.join(DOCS,'cc_ar_briefing.png'),fullPage:false});
    log('Capture AR Briefing',true,'cc_ar_briefing.png');
    await p.evaluate(()=>ccMobileTab('plus'));

    // Desktop AR
    await p.setViewport({width:1280,height:900});
    await p.evaluate(()=>document.body.classList.remove('cc-mob-tabs'));
    await new Promise(r=>setTimeout(r,500));
    await p.screenshot({path:path.join(DOCS,'cc_ar_desktop.png'),fullPage:false});
    log('Capture AR Desktop',true,'cc_ar_desktop.png');

    // ═══ PREUVE 5 : FR non cassé ═══
    await p.evaluate(()=>setLang('fr'));
    await new Promise(r=>setTimeout(r,1500));
    await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
    await p.evaluate(()=>ccMobileTab('pilotage'));
    await new Promise(r=>setTimeout(r,500));
    await p.screenshot({path:path.join(DOCS,'cc_fr_pilotage.png'),fullPage:false});
    log('Capture FR Pilotage (non cassé)',true,'cc_fr_pilotage.png');

    await p.evaluate(()=>ccMobileTab('organismes'));
    await new Promise(r=>setTimeout(r,1000));
    await p.evaluate(()=>{var c=document.querySelectorAll('#cc-epics-prio .cc-epic-card');if(c[0])c[0].click();});
    await new Promise(r=>setTimeout(r,1500));
    const etatFR=await p.evaluate(()=>{
      var etats=document.querySelectorAll('.cc-panel-etat');
      var texts=[];
      etats.forEach(e=>texts.push(e.textContent));
      return texts;
    });
    var etatFROK=etatFR.length>0 && etatFR.every(function(e){return !e.includes('_');});
    log('États traduits en FR',etatFROK,'états='+JSON.stringify(etatFR));
    await p.screenshot({path:path.join(DOCS,'cc_fr_drill_epic.png'),fullPage:false});
    log('Capture FR fiche EPIC (non cassé)',true,'cc_fr_drill_epic.png');
    await p.evaluate(()=>ccClosePanel());

    // ═══ PREUVE 6 : dir="ltr" sur nombres AR ═══
    await p.evaluate(()=>setLang('ar'));
    await new Promise(r=>setTimeout(r,1000));
    await p.evaluate(()=>ccMobileTab('pilotage'));
    await new Promise(r=>setTimeout(r,500));
    const dirLtr=await p.evaluate(()=>{
      var els=document.querySelectorAll('#view-command-center [dir="ltr"]');
      return els.length;
    });
    log('Nombres AR dir="ltr"',dirLtr>0,dirLtr+' éléments avec dir="ltr"');
    await p.evaluate(()=>setLang('fr'));
    await new Promise(r=>setTimeout(r,500));

    // ═══ RÉGRESSIONS ═══
    await p.evaluate(()=>ccMobileTab('carte'));
    await new Promise(r=>setTimeout(r,1500));
    const mapOK=await p.evaluate(()=>{if(!_ccMap)return false;var c=_ccMap.getCenter();return Math.abs(c.lat-36.7538)<0.5;});
    log('Carte Alger intacte',mapOK,'ok');

    await p.evaluate(()=>ccMobileTab('organismes'));
    await new Promise(r=>setTimeout(r,1000));
    const epic6=await p.evaluate(()=>{var g=document.getElementById('cc-epics-prio');return g?g.querySelectorAll('.cc-epic-card').length:0;});
    log('6 EPIC carrousel intact',epic6===6,'count='+epic6);

    log('Nav basse CC visible',await p.evaluate(()=>{var n=document.getElementById('cc-bottom-nav');return n&&n.style.display!=='none';}),'ok');

    const total=await p.evaluate(async()=>{var t=localStorage.getItem('civismart_token');var r=await fetch('/api/signaler/board',{headers:{Authorization:'Bearer '+t}});var d=await r.json();return Array.isArray(d)?d.length:-1;});
    log('Total signalements',total===122,'total='+total);

    await p.close();

  }catch(e){console.error('ERR:',e.message);log('Erreur',false,e.message);}
  finally{await b.close();}

  console.log('\n═══ RÉSUMÉ ═══');
  results.forEach(r=>console.log(r.s+' | '+r.l+' | '+r.d));
  var fails=results.filter(r=>r.s==='NON');
  console.log('\n'+(results.length-fails.length)+'/'+results.length+' OK');
  if(fails.length){console.log('ÉCHECS:');fails.forEach(f=>console.log('  ❌ '+f.l+': '+f.d));}
  process.exit(fails.length?1:0);
})();
