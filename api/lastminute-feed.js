'use strict';
let cached, fetchedAt=0, pending;
function normalize(item,observedAt){
 const fixture=item.fixture||{}, status=fixture.status||{},teams=item.teams||{}, goals=item.goals||{},score=item.score||{};
 const home=teams.home?.name,away=teams.away?.name;
 if(!fixture.id||!home||!away)throw Error('Invalid fixture');
 const finiteScore=n=>Number.isInteger(n)&&n>=0?n:null;
 const phase=['2H','1H','HT','ET','BT','P'].includes(status.short)?'live':['FT','AET','PEN'].includes(status.short)?'final':['CANC'].includes(status.short)?'cancelled':['SUSP','INT','PST'].includes(status.short)?'suspended':'scheduled';
 const regulation={home:finiteScore(score.fulltime?.home),away:finiteScore(score.fulltime?.away)};
 const events=(item.events||[]).map(e=>({type:e.type,detail:e.detail,minute:e.time?.elapsed,extra:e.time?.extra}));
 // The feed has no guaranteed explicit "VAR clear" field. Incident state remains uncertain.
 return {id:String(fixture.id),name:home+' vs '+away,home,away,kickoff:fixture.date,status:phase,period:status.short,minute:status.elapsed,extra:status.extra??null,score:{home:finiteScore(goals.home),away:finiteScore(goals.away)},regulation,observedAt,events,incidentClear:null,version:JSON.stringify([status.short,goals.home,goals.away,events]),source:'API-Football',coverageNote:'Provider retrieval time; upstream latency and VAR clearance are not verified.'};
}
async function load(){
 const key=process.env.API_FOOTBALL_KEY,id=process.env.LASTMINUTE_FIXTURE_ID;
 if(!key||!/^\d{1,12}$/.test(id||''))return {configured:false,message:'Live trial needs a server-side API-Football key and selected fixture. Replay is available.'};
 const now=Date.now();if(cached&&now-fetchedAt<5000)return cached;
 if(pending)return pending;
 pending=(async()=>{
  try{
   const r=await fetch('https://v3.football.api-sports.io/fixtures?id='+id,{headers:{'x-apisports-key':key},signal:AbortSignal.timeout(8000)});
   if(!r.ok)throw Error('Provider unavailable');
   const data=await r.json();
   if(data.errors&&Object.keys(data.errors).length)throw Error('Provider refused request');
   if(!Array.isArray(data.response)||data.response.length!==1)throw Error('Fixture not available');
   const remaining=r.headers.get('x-ratelimit-requests-remaining');
   cached={configured:true,fixture:normalize(data.response[0],Date.now()),remaining:remaining!==null?Number(remaining):null};fetchedAt=Date.now();return cached;
  }catch{return {configured:true,unavailable:true,message:'Live score feed unavailable, quota exhausted, or fixture not covered. Betting paused.'};}
  finally{pending=undefined;}
 })();return pending;
}
async function handler(req,res){
 res.setHeader('Content-Type','application/json');res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method!=='GET'){res.setHeader('Allow','GET');res.statusCode=405;return res.end(JSON.stringify({error:'Read-only endpoint'}));}
 const value=await load();res.setHeader('Cache-Control',value.fixture?'public, s-maxage=5, max-age=0, must-revalidate':'no-store');
 res.statusCode=value.unavailable?503:200;res.end(JSON.stringify(value));
}
module.exports=handler;module.exports.normalize=normalize;module.exports.load=load;
