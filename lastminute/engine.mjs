export function fresh(f,now){return f&&Number.isFinite(f.observedAt)&&now-f.observedAt>=0&&now-f.observedAt<=15000;}
export function gate(f,input,now){
 if(!fresh(f,now))return 'Score feed is stale or unavailable.';
 if(f.status!=='live'||f.period!=='2H')return 'Wait for regulation second-half play.';
 if(!Number.isFinite(f.minute)||f.minute<input.minute)return 'Outside your late-game window.';
 if(f.score.home!==input.home||f.score.away!==input.away)return 'Selected score differs from the current score.';
 if(f.incidentClear!==true&&input.reviewedVersion!==f.version)return 'Review the current match for unresolved incidents.';
 if(!Number.isFinite(input.odds)||input.odds<1.01||input.odds>1000)return 'Enter valid practice odds.';
 if(!Number.isFinite(input.p)||input.p<=0||input.p>=1)return 'Enter a probability between 0% and 100%.';
 const ev=input.p*(input.odds-1)*(1-input.commission)-(1-input.p);
 if(ev<input.minEV)return 'Expected value is below your threshold.';
 return null;
}
export class TrialWallet{
 constructor(state){this.state=state||{version:1,bets:[],proposal:null,halted:false};if(this.state.version!==1||!Array.isArray(this.state.bets))throw Error('Unsupported wallet data.');}
 summary(){const pnl=this.state.bets.reduce((n,b)=>n+b.result,0);const reserved=this.state.bets.filter(b=>['PENDING','OPEN'].includes(b.status)).reduce((n,b)=>n+b.stake,0);return {balance:1000+pnl/100,reserved:reserved/100,available:(100000+pnl-reserved)/100,pnl:pnl/100};}
 propose(f,input,now){
  const reason=gate(f,input,now);if(reason)throw Error(reason);
  if(this.state.halted)throw Error('Paper loss stop is active.');
  if(this.state.bets.some(b=>b.fixture===f.id))throw Error('One paper bet per fixture is allowed.');
  const stake=Math.floor(input.stake*100),w=this.summary();
  if(!Number.isFinite(stake)||stake<1||stake>2500||stake/100>w.available||w.reserved+stake/100>100||w.available-stake/100<900)throw Error('Stake exceeds the paper limits.');
  this.state.proposal={id:crypto.randomUUID(),fixture:f.id,name:f.name,home:input.home,away:input.away,stake,odds:input.odds,commission:input.commission,version:f.version,created:now,expires:now+30000,input:{...input}};
  return this.state.proposal;
 }
 confirm(f,now){const p=this.state.proposal;if(!p||now>=p.expires)throw Error('Proposal expired. Review a new bet.');if(f.id!==p.fixture||f.version!==p.version)throw Error('Match state changed. Review a new bet.');const input=p.input;this.propose(f,input,now);this.state.bets.push({...p,status:'PENDING',due:now+8000,result:0,note:'Waiting for the eight-second paper delay.'});this.state.proposal=null;}
 advance(f,now){
  if(this.state.proposal&&(now>=this.state.proposal.expires||(f&&f.id===this.state.proposal.fixture&&f.version!==this.state.proposal.version)))this.state.proposal=null;
  for(const b of this.state.bets){
   if(b.status==='PENDING'){
    if(now>b.due+15000){b.status='CANCELLED';b.note='No fresh post-delay observation.';continue;}
    if(f?.id!==b.fixture)continue;
    if(!fresh(f,now))continue;
    if(f.version!==b.version||f.status!=='live'||f.period!=='2H'){b.status='CANCELLED';b.note='Match changed before acceptance.';continue;}
    if(now>=b.due&&f.observedAt>=b.due){b.status='OPEN';b.note='Simulated acceptance at your practice price; no market liquidity model.';}
   }
   if(f?.id!==b.fixture||!fresh(f,now)||!['OPEN','WON','LOST','VOID'].includes(b.status))continue;
   if(f.status==='cancelled'){b.status='VOID';b.result=0;b.note='Event cancelled; paper stake returned.';}
   else if(f.status==='final'){
    const score=f.regulation;
    if(!score||!Number.isInteger(score.home)||!Number.isInteger(score.away)){b.status='OPEN';b.result=0;b.note='Waiting for confirmed regulation-time result.';continue;}
    const win=score.home===b.home&&score.away===b.away;b.status=win?'WON':'LOST';b.result=win?Math.floor(b.stake*(b.odds-1)*(1-b.commission)):-b.stake;b.note='Settled from regulation result. Later corrections reconcile automatically.';
   }
  }
  if(this.summary().balance<=900)this.stop();
 }
 stop(){this.state.halted=true;this.state.proposal=null;for(const b of this.state.bets)if(b.status==='PENDING'){b.status='CANCELLED';b.note='Cancelled by paper stop.';}}
 resume(){if(this.summary().available<900||this.summary().balance<=900)throw Error('Loss budget remains exceeded.');this.state.halted=false;}
}
