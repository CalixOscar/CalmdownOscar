import{TrialWallet,gate}from'./engine.mjs';
const $=id=>document.getElementById(id),node=(tag,text)=>{const n=document.createElement(tag);n.textContent=text;return n;};
let mode='replay',wallet,fixture,playing=false,stage=0,run=crypto.randomUUID(),reviewedVersion=null,storageOK=true,liveMessage='',remaining=null,busy=false,liveUntil=0,replayScore={home:2,away:1};
function storageKey(){return 'lastminute-trial-v1-'+mode;}
function load(){try{const data=localStorage.getItem(storageKey());wallet=new TrialWallet(data?JSON.parse(data):undefined);storageOK=true;}catch{storageOK=false;wallet=new TrialWallet();message('Wallet storage unavailable or invalid. Betting is disabled to protect existing records.');}}
function save(){try{if(mode==='replay')wallet.state.replay={run,stage,playing,score:replayScore};if(!storageOK)throw Error();localStorage.setItem(storageKey(),JSON.stringify(wallet.state));}catch{storageOK=false;message('Wallet could not be saved. Further entries are disabled.');}}
function message(s){$('message').textContent=s;}
function input(){return{home:Number($('home').value),away:Number($('away').value),minute:Number($('minute').value),odds:Number($('odds').value),stake:Number($('stake').value),p:Number($('probability').value)/100,commission:.05,minEV:.02,reviewedVersion:$('reviewed').checked?reviewedVersion:null};}
function replay(){const score={...replayScore};return{id:'example-'+run,name:'Norway vs Denmark · fictional example',home:'Norway',away:'Denmark',status:stage===3?'final':'live',period:stage===3?'FT':'2H',minute:playing?89:84,score,regulation:stage===3?score:null,observedAt:Date.now(),incidentClear:true,version:stage===2?'equalizer':stage===3?'fulltime':'stable',source:'Fictional replay'};}
let shownProposal=null;
function render(){
 const w=wallet.summary();$('wallet').replaceChildren(...[['Available',w.available],['Reserved',w.reserved],['Realized P/L',w.pnl]].map(([label,value])=>{const n=node('div','');n.append(node('small',label+' · paper units'),node('strong',value.toFixed(2)));return n;}));
 $('source').textContent=mode==='replay'?'FICTIONAL REPLAY · Separate example wallet':liveMessage||'LIVE SCORE · User-entered practice price';
 $('match').textContent=fixture?.name||'Waiting for a configured live fixture';$('score').textContent=fixture?`${fixture.score.home??'—'} – ${fixture.score.away??'—'}`:'—';$('clock').textContent=fixture?`${fixture.minute??'—'}′ · ${fixture.period} · ${fixture.status}`:'';
 $('health').textContent=mode==='replay'?(stage===3?'Example finished. Click “New example” to run another test.':playing?'Replay is at minute 89. Review a paper bet, wait eight seconds for acceptance, then finish the match or simulate an equalizer.':'Click “Start replay” to jump from minute 84 to minute 89 and test your plan.'):(fixture?`Last received ${new Date(fixture.observedAt).toLocaleTimeString()}. ${fixture.coverageNote||''}`:'Live proposals are paused.')+(remaining!==null?` Remaining provider requests: ${remaining}.`:'');
 $('replay-controls').hidden=mode!=='replay';$('live-watch').hidden=mode!=='live';$('live-watch').textContent=liveUntil>Date.now()?'Watching · '+Math.ceil((liveUntil-Date.now())/1000)+' seconds remaining':'Start a 5-minute live watch';if($('reviewed').checked&&fixture?.version!==reviewedVersion){$('reviewed').checked=false;reviewedVersion=null;}
 $('play').disabled=playing||stage===3;$('goal').disabled=!playing||stage>=2;$('finish').disabled=!playing||stage===3;
 const existing=wallet.state.bets.find(b=>b.fixture===fixture?.id);
 const reason=existing?(['PENDING','OPEN'].includes(existing.status)?'This example already has an active paper bet. Wait for acceptance, then finish the match.':'This example already has a paper record. Click “New example” to test again.'):gate(fixture,input(),Date.now());$('gate').textContent=wallet.state.halted?'Paper stop is active.':reason||'Your conditions hold. EV uses your assumed probability and price.';$('propose').disabled=!!reason||!storageOK||wallet.state.halted;$('propose').textContent=$('approval').checked?'Review paper bet':'Create paper bet';
 const p=wallet.state.proposal;
 if(p?.id!==shownProposal){
  shownProposal=p?.id;$('proposal').replaceChildren();
  if(p){
   $('proposal').append(node('p',`${p.home}–${p.away} · ${(p.stake/100).toFixed(2)} units @ ${p.odds}`));
   const countdown=node('p','');countdown.id='proposal-countdown';$('proposal').append(countdown);
   const b=node('button','Confirm paper bet');b.type='button';b.onclick=()=>action(()=>wallet.confirm(fixture,Date.now()));
   const d=node('button','Dismiss');d.type='button';d.className='secondary';d.onclick=()=>action(()=>{wallet.state.proposal=null;$('auto').checked=false;});$('proposal').append(b,d);
  }else $('proposal').append(node('p','No proposal awaiting approval.'));
 }
 if(p)$('proposal-countdown').textContent='Expires in '+Math.max(0,Math.ceil((p.expires-Date.now())/1000))+' seconds.';
 $('history').replaceChildren(...[...wallet.state.bets].reverse().map(b=>{const n=node('div','');n.className='record';n.append(node('strong',`${b.name} · ${b.home}–${b.away} · ${b.status}`),node('p',`${(b.stake/100).toFixed(2)} units @ ${b.odds} · P/L ${(b.result/100).toFixed(2)}`),node('p',b.note));return n;}));if(!wallet.state.bets.length)$('history').append(node('p','Confirmed paper entries appear here.'));
 $('stop').hidden=wallet.state.halted;$('resume').hidden=!wallet.state.halted;
}
function action(fn){if(!storageOK)return;try{fn();save();message('Paper wallet updated.');}catch(e){message(e.message);}render();}
function propose(){action(()=>{wallet.propose(fixture,input(),Date.now());if(!$('approval').checked)wallet.confirm(fixture,Date.now());});}
$('strategy').onsubmit=e=>{e.preventDefault();propose();};$('reviewed').onchange=()=>{reviewedVersion=$('reviewed').checked?fixture?.version:null;render();};$('stop').onclick=()=>action(()=>{wallet.stop();$('auto').checked=false;});$('resume').onclick=()=>action(()=>wallet.resume());
$('mode').onchange=()=>{mode=$('mode').value;liveUntil=0;$('auto').checked=false;$('reviewed').checked=false;reviewedVersion=null;fixture=null;load();if(mode==='replay')fixture=replay();render();if(mode==='live')poll();};
$('strategy').addEventListener('input',e=>{if(e.target.type!=='checkbox')render();});
$('play').onclick=()=>{if(playing||stage===3)return;playing=true;stage=1;fixture=replay();save();render();};$('goal').onclick=()=>{if(!playing||stage>=2)return;replayScore={home:2,away:2};stage=2;playing=true;fixture=replay();wallet.advance(fixture,Date.now());save();render();};$('finish').onclick=()=>{if(!playing||stage===3)return;stage=3;fixture=replay();wallet.advance(fixture,Date.now());save();render();};$('new').onclick=()=>{if(wallet.state.bets.some(b=>['PENDING','OPEN'].includes(b.status))){message('Finish the active example before starting another.');return;}replayScore={home:2,away:1};run=crypto.randomUUID();stage=0;playing=false;wallet.state.proposal=null;fixture=replay();$('auto').checked=false;save();message('New fictional fixture. Existing records are retained.');render();};
async function poll(){if(mode!=='live'||busy)return;busy=true;try{const r=await fetch('../api/lastminute-feed',{cache:'no-cache'});const d=await r.json();if(mode!=='live')return;remaining=d.remaining??null;if(d.configured===false||d.unavailable||remaining!==null&&remaining<=10)liveUntil=0;if(!r.ok||!d.fixture){liveMessage=d.message||'Live feed unavailable; entries paused.';fixture=null;}else{fixture=d.fixture;liveMessage='LIVE SCORE · Practice odds · '+fixture.source;}}catch{if(mode==='live'){liveMessage='Offline. Live entries paused.';fixture=null;}}finally{busy=false;if(mode==='live')render();}}
load();if(wallet.state.replay){({run,stage,playing}=wallet.state.replay);replayScore=wallet.state.replay.score||{home:2,away:1};}fixture=replay();render();
setInterval(()=>{if(mode==='replay')fixture=replay();const before=JSON.stringify(wallet.state);wallet.advance(fixture,Date.now());if($('auto').checked&&storageOK&&!wallet.state.halted&&!wallet.state.proposal&&!gate(fixture,input(),Date.now())&&!wallet.state.bets.some(b=>b.fixture===fixture.id))propose();if(JSON.stringify(wallet.state)!==before)save();render();},1000);
$('live-watch').onclick=()=>{liveUntil=Date.now()+300000;poll();render();};
setInterval(()=>{if(mode==='live'&&liveUntil>Date.now())poll();},5000);
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>message('Offline installation unavailable in this browser.'));
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();$('install').hidden=false;$('install').onclick=async()=>{await e.prompt();$('install').hidden=true;};});
