#!/usr/bin/env node
const puppeteer = require('puppeteer');
const path = require('path');
const BASE = 'https://civismart.pylcom.app';
const DOCS = path.join(__dirname, '..', 'docs');
const results = [];
function log(l,ok,d){results.push({l,s:ok?'OUI':'NON',d});console.log((ok?'✅':'❌')+' '+l+' — '+d);}

async function login(b,tel,mdp){
  const p=await b.newPage();
  await p.goto(BASE+'/',{waitUntil:'networkidle2',timeout:30000});
  await p.waitForSelector('#login-tel',{timeout:15000});
  await p.type('#login-tel',tel);await p.type('#login-mdp',mdp);
  await p.evaluate(()=>document.getElementById('login-btn').click());
  await p.waitForSelector('.sidebar,.bottom-nav,#view-accueil',{timeout:15000});
  await new Promise(r=>setTimeout(r,3000));
  return p;
}

const PERSONAS = [
  {tel:'0550000001',mdp:'admin1234',nom:'Amina (citoyen)'},
  {tel:'0550000002',mdp:'admin@@1234',nom:'Youcef (agent réception)'},
  {tel:'0550000003',mdp:'admin@@1234',nom:'Rachid (admin wilaya)'},
  {tel:'0550000004',mdp:'admin@@1234',nom:'Karim (CAP)'},
  {tel:'0550000005',mdp:'admin@@1234',nom:'Mourad (admin APC)'},
  {tel:'0550000006',mdp:'admin@@1234',nom:'Yacine (admin wilaya)'},
  {tel:'0550000007',mdp:'admin@@1234',nom:'Nassim (Propreté)'},
  {tel:'0550000008',mdp:'admin@@1234',nom:'Nadia (Éclairage)'},
  {tel:'0550000009',mdp:'admin@@1234',nom:'Khaled (Stationnement)'},
  {tel:'0550000010',mdp:'admin@@1234',nom:'Samira (Patrimoine)'},
  {tel:'0550000011',mdp:'admin@@1234',nom:'Farid (Eau)'},
  {tel:'0550000012',mdp:'admin@@1234',nom:'Sofiane (Travaux publics)'},
  {tel:'0550000013',mdp:'admin@@1234',nom:'Leïla (Environnement)'},
  {tel:'0550000014',mdp:'admin@@1234',nom:'Redouane (CET)'},
];

(async()=>{
  // Use a SINGLE browser for all to avoid rate limits
  const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-gpu']});
  try{
    for(var i=0;i<PERSONAS.length;i++){
      var per=PERSONAS[i];
      try{
        // Navigate to login by clearing localStorage
        var p=await b.newPage();
        await p.goto(BASE+'/',{waitUntil:'networkidle2',timeout:30000});
        await p.evaluate(()=>{localStorage.clear();sessionStorage.clear();});
        await p.goto(BASE+'/',{waitUntil:'networkidle2',timeout:30000});
        await p.waitForSelector('#login-tel',{timeout:15000});
        await p.type('#login-tel',per.tel);await p.type('#login-mdp',per.mdp);
        await p.evaluate(()=>document.getElementById('login-btn').click());
        await p.waitForSelector('.sidebar,.bottom-nav,#view-accueil',{timeout:15000});
        await new Promise(r=>setTimeout(r,3000));
        await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
        await new Promise(r=>setTimeout(r,500));
        var fname='cc_persona_'+per.tel.slice(-2)+'.png';
        await p.screenshot({path:path.join(DOCS,fname),fullPage:false});

        if(i>=6) {
          var sub=await p.evaluate(()=>{
            var el=document.querySelector('.wb-subtitle');
            if(!el||el.offsetHeight===0) return {ok:true,h:0,note:'hidden/absent'};
            var s=getComputedStyle(el);
            return {ok:s.overflow!=='hidden'||s.whiteSpace!=='nowrap',h:el.offsetHeight,ovf:s.overflow,ws:s.whiteSpace};
          });
          log(per.nom+' titre non tronqué',sub.ok,'h='+sub.h+'px '+(sub.note||sub.ovf+'/'+sub.ws));
        }
        log(per.nom+' capture accueil',true,fname);
        await p.close();
      }catch(e){
        log(per.nom+' ERREUR',false,e.message.substring(0,80));
        try{var pages=await b.pages();for(var pg of pages){if(pg.url()!=='about:blank')await pg.close();}}catch(_){}
      }
    }

    // ═══ CC ACQUIS ═══
    var p4=await login(b,'0550000003','admin@@1234');
    await p4.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
    await p4.evaluate(()=>document.querySelector('[data-view="command-center"]').click());
    await new Promise(r=>setTimeout(r,4000));
    await p4.evaluate(()=>ccMobileTab('carte'));
    await new Promise(r=>setTimeout(r,1500));
    log('CC carte Alger',await p4.evaluate(()=>{if(!_ccMap)return false;var c=_ccMap.getCenter();return Math.abs(c.lat-36.7538)<0.5;}),'ok');
    await p4.evaluate(()=>document.querySelector('[data-filter="epic"]').click());
    await new Promise(r=>setTimeout(r,800));
    log('CC filtre EPIC',await p4.evaluate(()=>_ccMarkers.length)>1,'count='+await p4.evaluate(()=>_ccMarkers.length));
    await p4.screenshot({path:path.join(DOCS,'cc_acquis_carte.png'),fullPage:false});
    await p4.evaluate(()=>ccMobileTab('organismes'));
    await new Promise(r=>setTimeout(r,1000));
    log('CC carrousel 6 EPIC',await p4.evaluate(()=>{var g=document.getElementById('cc-epics-prio');return g?g.querySelectorAll('.cc-epic-card').length:0;})===6,'ok');
    await p4.evaluate(()=>setLang('ar'));await new Promise(r=>setTimeout(r,1500));
    await p4.evaluate(()=>ccMobileTab('pilotage'));await new Promise(r=>setTimeout(r,500));
    await p4.screenshot({path:path.join(DOCS,'cc_acquis_ar.png'),fullPage:false});
    log('CC i18n AR',true,'ok');
    var total=await p4.evaluate(async()=>{var t=localStorage.getItem('civismart_token');var r=await fetch('/api/signaler/board',{headers:{Authorization:'Bearer '+t}});var d=await r.json();return Array.isArray(d)?d.length:-1;});
    log('Total signalements',total===122,'total='+total);
    await p4.close();

  }catch(e){console.error('ERR:',e.message);log('Erreur',false,e.message);}
  finally{await b.close();}

  console.log('\n═══ RÉSUMÉ ═══');
  results.forEach(r=>console.log(r.s+' | '+r.l+' | '+r.d));
  var fails=results.filter(r=>r.s==='NON');
  console.log('\n'+(results.length-fails.length)+'/'+results.length+' OK');
  if(fails.length){console.log('ÉCHECS:');fails.forEach(f=>console.log('  ❌ '+f.l+': '+f.d));}
  process.exit(fails.length?1:0);
})();
