'use strict';
// Static branching interview: no network calls. Answers live in page memory plus this
// browser's localStorage (the unfinished draft) until the visitor copies the prompt.
// Each node is one short question; `next` on an option (or on the node) picks the branch.
// Tap questions have at most three answers, mostly Yes / No / I don't know.
const yesNo = (next={}) => [{value:'yes',label:'Yes',next:next.yes},{value:'no',label:'No',next:next.no},{value:'unknown',label:'I don’t know',next:next.unknown}];
const nodes = {
 idea:{type:'text',label:'The idea',kicker:'THE IDEA',title:'What’s the idea, in one sentence?',hint:'“An app that…” is a good start.',
  quote:'Every good work of software starts by scratching a developer’s personal itch.',author:'Eric S. Raymond',next:'similar'},
 similar:{type:'choice',label:'Do similar apps exist',kicker:'WHAT’S OUT THERE',title:'Do similar apps already exist?',hint:'Almost every idea has a neighbour.',
  quote:'Competition is for losers.',author:'Peter Thiel',
  options:[{value:'yes',label:'Yes, probably',next:'similarWhich'},{value:'no',label:'No'},{value:'unknown',label:'I don’t know'}],next:'talk'},
 similarWhich:{type:'text',label:'Similar apps that come to mind, and what mine would do better',kicker:'WHAT’S OUT THERE',title:'Which come to mind, and what would yours do better?',hint:'Name any you know. “Not sure yet” is fine too.',
  quote:'Underdo your competition.',author:'Jason Fried & David Heinemeier Hansson',next:'talk'},
 talk:{type:'choice',label:'Would people tell their friends about it',kicker:'WORD OF MOUTH',title:'Would people tell their friends about it?',hint:'Would someone mention it without being asked?',
  quote:'Make something people want.',author:'Paul Graham',options:yesNo({no:'personalJob'}),next:'who'},
 who:{type:'choice',label:'Would lots of people use it',kicker:'THE PEOPLE',title:'Would lots of people use it?',hint:'Not who could. Who would?',
  quote:'It’s better to make a few people really happy than to make a lot of people semi-happy.',author:'Paul Buchheit',options:yesNo({no:'personalOffer'}),next:'often'},
 personalOffer:{type:'choice',label:'Personal tool or app for others',kicker:'A SMALLER PATH',title:'This sounds like a tool just for you. Make it one?',hint:'Smaller, faster, nothing to market. That’s a good outcome.',
  quote:'Less, but better.',author:'Dieter Rams',
  options:[{value:'personal',label:'Yes, make it a personal tool',next:'personalJob'},{value:'product',label:'No, others need it too'}],next:'often'},
 often:{type:'choice',label:'Would people use it every week',kicker:'HOW OFTEN',title:'Would people use it every week?',hint:'Think of an ordinary month.',
  quote:'How we spend our days is, of course, how we spend our lives.',author:'Annie Dillard',options:yesNo(),
  next:()=>answers.similar==='no'&&answers.talk==='yes'&&answers.who==='yes'?'bigWhyNow':'seen'},
 seen:{type:'choice',label:'Have I seen someone struggle with this',kicker:'THE EVIDENCE',title:'Have you seen someone struggle with this?',hint:'With your own eyes, not imagined.',
  quote:'Don’t find customers for your products, find products for your customers.',author:'Seth Godin',options:yesNo(),next:'pay'},
 pay:{type:'choice',label:'Would someone pay for it',kicker:'THE PRICE',title:'Would someone pay for it?',hint:'Guessing is fine. Just be honest about it.',
  quote:'Price is what you pay. Value is what you get.',author:'Warren Buffett',options:yesNo(),next:'core'},
 core:{type:'text',label:'The one thing it must do',kicker:'THE SMALL VERSION',title:'What’s the one thing it must do?',hint:'If it did only this, it would still be worth opening.',
  quote:'Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.',author:'Antoine de Saint-Exupéry',next:'find'},
 find:{type:'choice',label:'Could people find it by searching the App Store',kicker:'THE FIRST PEOPLE',title:'Could people find it by searching the App Store?',hint:'Would they know what to type?',
  quote:'Do things that don’t scale.',author:'Paul Graham',options:yesNo(),next:'time'},
 time:{type:'choice',label:'Can I give it a few months',kicker:'THE COST',title:'Can you give it a few months?',hint:'Count what you’d set aside for it.',
  quote:'Focusing is about saying no.',author:'Steve Jobs',options:yesNo(),next:'review'},
 bigWhyNow:{type:'choice',label:'Is there a technical reason nobody has built it',kicker:'WHY NOW',title:'Is there a technical reason nobody has built it?',hint:'Too hard, not possible yet, or something Apple or Android won’t allow. Your AI will check either way.',
  quote:'The future is already here — it’s just not very evenly distributed.',author:'William Gibson',options:yesNo({yes:'bigHard'}),next:'bigMagic'},
 bigHard:{type:'text',label:'The hard part, as I see it',kicker:'WHY NOW',title:'What’s the hard part?',hint:'Your best guess is enough.',
  quote:'Simple things should be simple, complex things should be possible.',author:'Alan Kay',next:'bigMagic'},
 bigMagic:{type:'text',label:'What will make people tell their friends',kicker:'THE MOMENT',title:'What will make people tell their friends?',hint:'The moment someone says “you have to try this”. That’s what to build first.',
  quote:'You’ve got to start with the customer experience and work backwards to the technology.',author:'Steve Jobs',next:'bigNeed'},
 bigNeed:{type:'choice',label:'Could I build it on my own',kicker:'GOING BIG',title:'Could you build it on your own?',hint:'Skills, time and money. Be honest.',
  quote:'The best way to predict the future is to invent it.',author:'Alan Kay',options:yesNo(),next:'time'},
 personalJob:{type:'text',label:'The one thing it must do for me',kicker:'JUST FOR YOU',title:'What’s the one thing it must do for you?',hint:'The job you’d open it for.',
  quote:'Less, but better.',author:'Dieter Rams',next:'personalToday'},
 personalToday:{type:'choice',label:'Do I use something for this today',kicker:'JUST FOR YOU',title:'Do you use something for this today?',hint:'An app, a note, a spreadsheet. Sometimes the answer is already on your phone.',
  quote:'There is surely nothing quite so useless as doing with great efficiency what should not be done at all.',author:'Peter Drucker',
  options:[{value:'yes',label:'Yes'},{value:'no',label:'No'}],next:'personalWhere'},
 personalWhere:{type:'choice',label:'Where I would use it',kicker:'JUST FOR YOU',title:'Where would you use it?',hint:'The device decides how simple it can be.',
  quote:'The medium is the message.',author:'Marshall McLuhan',
  options:[{value:'iphone',label:'iPhone'},{value:'mac',label:'Mac'},{value:'both',label:'Both'}],next:'personalTime'},
 personalTime:{type:'choice',label:'Could I finish it in a weekend',kicker:'JUST FOR YOU',title:'Could you finish it in a weekend?',hint:'Keep it small.',
  quote:'Real artists ship.',author:'Steve Jobs',options:yesNo(),next:'review'}
};
const START = 'idea', DRAFT_KEY = 'idea-clinic-draft-v3';
const $ = id => document.getElementById(id);
const sections = ['intro','interview','review','handoff'];
let answers = {}, unsure = {}, path = [START], view = 'intro', copied = false, editing = false;

const store = {
 get(key){try{return JSON.parse(localStorage.getItem(key));}catch{return null;}},
 set(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{}},
 remove(key){try{localStorage.removeItem(key);}catch{}}
};
const current = () => path[path.length-1];
const hasAnswers = () => Object.keys(answers).some(k => answers[k] || unsure[k]);
function saveDraft(){if(hasAnswers())store.set(DRAFT_KEY,{answers,unsure,path,view});}
function clearDraft(){answers={};unsure={};path=[START];store.remove(DRAFT_KEY);}

const resolve = next => typeof next==='function'?next():next;
function nextOf(id, value=answers[id]){
 const node=nodes[id];const option=node.options?.find(o=>o.value===value);
 return resolve(option?.next||node.next);
}
// The path actually walked, from the start, following today's answers.
function walk(){const out=[];let id=START;while(id&&id!=='review'&&nodes[id]&&!out.includes(id)){out.push(id);if(!(id in answers))break;id=nextOf(id);}return out;}
const isPersonal = ids => ids.includes('personalJob');
const isBig = ids => ids.includes('bigWhyNow');
const route = ids => isPersonal(ids)?'personal':isBig(ids)?'big':'product';
function estimateTotal(){
 let id=START,count=0;const seen=new Set();
 while(id&&id!=='review'&&!seen.has(id)){seen.add(id);count++;const node=nodes[id];id=(id in answers)?nextOf(id):resolve(node.next);}
 return count;
}
const answerText = id => {const node=nodes[id],value=answers[id];if(node.type==='choice')return node.options.find(o=>o.value===value)?.label||'';return value||'';};

function show(id){
 view=id;sections.forEach(s => $(s).hidden = s!==id);$('status').textContent='';window.scrollTo(0,0);
 const heading=$(id).querySelector('h1');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}
 if(id!=='intro')saveDraft();
}

function intro(){
 const draft=store.get(DRAFT_KEY);
 $('resume').hidden=!draft;$('hero-actions').hidden=!!draft;
 if(draft){const first=(draft.answers?.idea||'').split('\n')[0];$('resume-idea').textContent=first?`“${first.length>140?first.slice(0,140)+'…':first}”`:'An unfinished idea.';}
 show('intro');
}

const routeLine={
 product:'WHERE WE’RE GOING · A prompt that makes your AI do the research and ask the hard follow-ups.',
 personal:'WHERE WE’RE GOING · A small tool, made just for you.',
 big:'WHERE WE’RE GOING · This could be big. Let’s give it the plan it deserves.'
};
const reviewLine={
 product:'You’re making an app for other people. The prompt will ask your AI to check what’s out there and push on your weak spots.',
 personal:'You’re making a tool just for you. The prompt will help you keep it small, or find something that already does the job.',
 big:'This could be big: new, worth talking about, and for lots of people. The prompt asks your AI to confirm the opening is real, then help you go all in.'
};
function question(){
 const id=current(),node=nodes[id],step=path.length,total=Math.max(estimateTotal(),step);
 $('step').textContent=`QUESTION ${step} OF ${total}`;$('progress').max=total;$('progress').value=step-1;
 $('route').textContent=routeLine[route(path)];$('route').classList.toggle('big',route(path)==='big');
 $('question-kicker').textContent=node.kicker;$('question').textContent=node.title;$('hint').textContent=node.hint;
 $('thought').textContent=`“${node.quote}”`;$('author').textContent=`— ${node.author}`;
 const isText=node.type==='text';
 $('text-entry').hidden=!isText;$('next').hidden=!isText;$('unknown').hidden=!isText;$('choices').hidden=isText;
 if(isText){$('answer').value=answers[id]||'';$('answer').setCustomValidity('');}
 else{
  $('choices').replaceChildren(...node.options.map((o,n)=>{const b=document.createElement('button');b.type='button';b.className='choice';const key=document.createElement('span');key.className='key';key.setAttribute('aria-hidden','true');key.textContent=n+1;b.append(key,o.label);b.setAttribute('aria-pressed',String(answers[id]===o.value));b.onclick=()=>choose(o.value);return b;}));
 }
 const card=$('thought-card');card.classList.remove('enter');void card.offsetWidth;card.classList.add('enter');
 $('back').disabled=path.length===1;
 show('interview');
}

// After a change from the read-back, return there as soon as the route is fully answered again.
function complete(){const w=walk(),last=w[w.length-1];return last in answers&&nextOf(last)==='review';}
function go(next){if(next==='review'||(editing&&complete())){review();return;}path.push(next);question();}
function choose(value){const id=current();answers[id]=value;unsure[id]=false;go(nextOf(id));}
$('answer-form').addEventListener('submit',e=>{
 e.preventDefault();const id=current(),value=$('answer').value.trim();
 if(!value){$('answer').setCustomValidity('Write a sentence, or choose “Not sure yet”.');$('answer').reportValidity();return;}
 answers[id]=value;unsure[id]=false;go(nextOf(id));
});
$('unknown').onclick=()=>{const id=current();answers[id]=$('answer').value.trim();unsure[id]=true;go(nextOf(id));};
$('answer').addEventListener('input',()=>{$('answer').setCustomValidity('');answers[current()]=$('answer').value;});
$('answer').addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.metaKey||e.ctrlKey)){e.preventDefault();$('answer-form').requestSubmit();}});
document.addEventListener('keydown',e=>{
 if(view!=='interview'||e.metaKey||e.ctrlKey||e.altKey||e.target.closest?.('textarea,input'))return;
 const node=nodes[current()],n=Number(e.key);
 if(node.type==='choice'&&n>=1&&n<=node.options.length){e.preventDefault();choose(node.options[n-1].value);}
});
$('back').onclick=()=>{if(path.length>1){path.pop();question();}};
$('exit').onclick=()=>{saveDraft();intro();};

function review(){
 editing=false;path=walk();
 const list=$('answers');list.replaceChildren();
 path.forEach((id,i)=>{
  const row=document.createElement('div');row.className='summary-row';
  const q=document.createElement('p');q.className='summary-q';q.textContent=nodes[id].title;
  const a=document.createElement('p');a.className='summary-a';
  a.textContent=unsure[id]?(answers[id]?`Not sure yet: ${answers[id]}`:'Not sure yet'):answerText(id);
  const change=document.createElement('button');change.type='button';change.className='text change';change.textContent='Change';
  change.setAttribute('aria-label',`Change: ${nodes[id].title}`);
  change.onclick=()=>{path=path.slice(0,i+1);editing=true;question();};
  const text=document.createElement('div');text.append(q,a);row.append(text,change);list.append(row);
 });
 $('review-route').textContent=reviewLine[route(path)];$('review-route').className=route(path)==='big'?'route-note big':'route-note';
 show('review');
}
$('review-back').onclick=()=>question();
$('review-form').addEventListener('submit',e=>{e.preventDefault();handoff();});

const quote = text => text.split('\n').map(line=>`> ${line}`.trimEnd()).join('\n');
function answerLines(ids){
 const lines=[];
 ids.forEach(id=>{
  const text=answerText(id);lines.push(`**${nodes[id].label}:**`);
  if(unsure[id])lines.push(text?`Not sure yet. My partial thinking:\n${quote(text)}`:'_Not sure yet._');
  else lines.push(nodes[id].type==='text'?quote(text):text);
  lines.push('');
 });
 return lines;
}
function similarLines(personal){
 if(answers.similar==='yes'){
  return ['## Similar apps','',personal
   ?'I think similar apps probably exist; any I can name are in my answers. Find the closest ones and tell me honestly whether one would do the job for me, so I don’t need to build anything. If you can browse, include links.'
   :'I think similar apps probably exist; any I can name are in my answers. Search the App Store and the web for the closest ones, including any I’ve missed, list them with links and the date you checked, and compare mine with the strongest. If you can’t browse, say so and give me the exact searches to run myself. Never invent downloads, revenue, prices or market sizes.',''];
 }
 const claim=answers.similar==='no'?'I believe nothing like this exists. Treat that as a claim to check, not a fact.':'I haven’t looked for similar apps.';
 return personal
  ?['## Check what already exists','',`${claim} Before anything else, check whether an existing app, an Apple Shortcut, or a notes or spreadsheet template would already do this well enough. If you can browse, include links.`,'']
  :['## Research similar apps first','',`${claim} Before questioning me, search the App Store and the web for existing apps and close alternatives. List the closest ones with links and the date you checked, and say how close each one is. If you find nothing close, look at why: it may be technically hard, not possible with today’s hardware or software, or blocked by Apple or Android rules. If you can’t browse, say so and give me the exact searches to run myself. Never invent downloads, revenue, prices or market sizes.`,''];
}
function weakSpots(){
 const spots=[];
 const flag={
  talk:{unknown:'I’m not sure people would talk about it.'},
  who:{unknown:'I’m not sure how many people would use it.'},
  personalOffer:{product:'It sounded like a small-group tool, but I chose to treat it as an app for others. Check that choice.'},
  often:{no:'People wouldn’t use it every week. Consider whether a website, a template or a feature in an existing app would serve them better than an app.',unknown:'I don’t know how often people would use it.'},
  seen:{no:'I haven’t seen anyone struggle with this.',unknown:'I’m not sure I’ve seen anyone struggle with this.'},
  pay:{no:'I don’t think anyone would pay for it. How would it sustain itself?',unknown:'I don’t know whether anyone would pay for it.',yes:'I think people would pay, but nobody has actually paid yet.'},
  find:{no:'I don’t think people would find it by searching the App Store.',unknown:'I don’t know how people would find it.'},
  time:{no:'I can’t give it months, so the first version must be small.',unknown:'I don’t know how much time I can give it.'}
 };
 path.forEach(id=>{const text=flag[id]?.[answers[id]];if(text)spots.push(text);if(unsure[id])spots.push(`Not sure yet: ${nodes[id].label.toLowerCase()}.`);});
 return spots;
}

function productPrompt(){
 const spots=weakSpots();
 return [
  '# Challenge my app idea before I build it','',
  'I answered a few quick questions about an app idea. Help me decide whether it deserves building. Don’t cheer me on and don’t talk me out of it: be a candid, curious counterpart.','',
  ...similarLines(false),
  '## How to work with me','',
  '- Reflect the idea back in two or three sentences, so I can correct you.',
  '- Then write a short look-back from one year after launch, as if it already happened. Two short stories, specific to this idea: “It worked, because…” first, then “It stalled, because…”. Every reason it stalled comes with what would have prevented it. This is a look-back, not a verdict: warm, candid, no doom and no hype.',
  '- End that first reply with one question about whatever decides which of the two stories comes true.',
  '- After that, question me about my weakest answers, one question per message, and wait for my reply. Don’t re-ask what I’ve answered clearly.',
  '- A confident answer isn’t evidence. Keep apart what I’ve seen, what people told me, what they actually do or pay for, and what I’m guessing.',
  '- Many ideas feel urgent on the day they arrive. If the case is weak, say so plainly. Pausing, or making it a tool just for me, are good outcomes.',
  '- Don’t offer to write code during this conversation.',
  '- Stop once the important gaps are covered, or when I say “finish”. Summarise briefly and let me correct it before you write the brief.','',
  '## My answers','',...answerLines(path),
  ...(spots.length?['## Weak spots I already know about','',...spots.map(s=>`- ${s}`),'']:[]),
  '## The brief I want at the end','',
  '1. **The idea and who it’s for**, in one paragraph.',
  '2. **What I know and what I’m guessing**, as two separate lists.',
  '3. **Similar apps**: the closest ones and whether mine is different enough to matter.',
  '4. **One year later**: the look-back, updated with what you learned from my answers. What made it work, three things that made it stall (each with its early warning sign and what would have prevented it), and a cheap test that shows which story we’re in.',
  '5. **Your recommendation**: build it, make it smaller, make it a personal tool, test first, or pause. Give reasons and say what’s still uncertain. I make the final call.',
  '6. **One small test to run next**: what to do, with whom, and which result means continue, change or stop.',
  '7. **A draft intent**, only if the evidence supports building: the problem, who it’s for, the one core task, what’s in and out of the first version, what “solved” looks like from outside the app, and how it should feel to use. Mark it as a draft.','',
  'Begin now: research similar apps, reflect my idea back, write the one-year look-back, then ask your first question.'
 ].join('\n');
}
function personalPrompt(){
 return [
  '# Help me make a small tool, just for me','',
  'I want a personal tool, not a product. No market research and no business case. Help me get to the smallest version that’s actually useful to me, or tell me I don’t need to build it at all.','',
  ...similarLines(true),
  '## My answers','',...answerLines(path),
  '## How to help','',
  '- First, tell me whether I need to build anything. If an existing app, a Shortcut or a template would do, say so and show me how to set it up.',
  '- If building is worth it, write a short look-back from one month later, as if it already happened: the version where I open it without thinking, and the version where I stopped after a week. Say what makes the difference, and design for the first.',
  '- Then ask me up to three short questions, one at a time.',
  '- Then give me: the one job it does, what to leave out, the simplest way to build it in the time I have, and what to do in my first sitting.',
  '- Keep it small enough to finish. If it starts growing into a product, point that out and ask whether I want that.',
  '- Don’t write the code until I ask.','',
  'Begin now with your first check.'
 ].join('\n');
}

const whyNowNote=()=>({
 yes:'My guess is there’s a technical reason (see my answers). Check that first: it decides everything else.',
 no:'I don’t think there’s a technical barrier. Still check before agreeing.'
})[answers.bigWhyNow];
function bigPrompt(){
 return [
  '# Help me build something big','',
  'I think this idea is new, that people would talk about it, and that lots of people would use it. If that’s true, I want to go all in. Be an ambitious, practical partner: help me make it as big as it deserves to be.','',
  '## First, make sure the opening is real','',
  'I believe nothing like this exists. Before anything else, search the App Store and the web for existing apps and close alternatives, and list the closest with links and the date you checked. If something close exists, tell me straight away. It doesn’t kill the idea, but it changes the plan: Netflix and Spotify weren’t first, they were better. If you can’t browse, say so and give me the exact searches to run myself. Never invent downloads, revenue or market sizes.','',
  '## Then check it can actually be built','',
  'If nobody has built this, there may be a reason. Check honestly whether it’s possible today: what current phones, software and AI models can and can’t do; Apple and Android limits such as app sandboxing, running in the background, access to other apps or system data, and App Store or Google Play review rules; and how hard the hardest part would be for a solo builder. If something blocks it, say what, and whether a workaround, a narrower version or waiting for the technology would get around it.',
  ...(whyNowNote()?['',whyNowNote()]:[]),'',
  '## How to help','',
  '- Reflect the idea back in two or three sentences, so I can correct you.',
  '- Then write a short look-back from two years after launch, as if it already happened. Lead with the story where people are talking about it: what made it spread, step by step. Then, briefly, the version where it never took off, and what would have prevented it. Keep the spirit of the first story.',
  '- If the opening is real and it can be built, ask me up to three short questions, one at a time, about what would make this spread.',
  '- Be ambitious and honest. Name the one or two things that could stop it and how to get ahead of them, without talking the idea down.',
  '- Don’t write the code until I ask.','',
  '## My answers','',...answerLines(path),
  '## The plan I want','',
  '1. **The idea in one paragraph**, and why people would talk about it.',
  '2. **Is the opening real?** The closest alternatives you found, or what to search.',
  '3. **Can it be built, and why now**: the hardest technical part, any Apple or Android limit that could block it, and what has changed that makes it possible today.',
  '4. **The first version**: the one moment that makes someone tell a friend, and what to leave out until later.',
  '5. **How it spreads**: from the first 100 people to the first 10,000.',
  '6. **What it would take**: time, money and people.',
  '7. **Two years later**: the look-back, updated. The story of how it spread, the two things most likely to have stalled it, the early sign of each, and how to get ahead of them.',
  '8. **This week**: three concrete steps to start.',
  '9. **A draft intent**: the problem, who it’s for, the one core task, what’s in and out of the first version, what “solved” looks like from outside the app, and how it should feel to use.','',
  'Begin now: check that the opening is real and that it can be built, reflect my idea back, write the two-year look-back, then ask your first question.'
 ].join('\n');
}
function handoff(){
 path=walk();
 copied=false;
 const kind=route(path);
 $('prompt').value=kind==='personal'?personalPrompt():kind==='big'?bigPrompt():productPrompt();
 ['product','personal','big'].forEach(k=>{$(`next-${k}`).hidden=k!==kind;});
 show('handoff');
}

$('copy').onclick=async()=>{
 const text=$('prompt').value;let ok=false;
 try{await navigator.clipboard.writeText(text);ok=true;}catch{$('prompt').select();try{ok=document.execCommand('copy');}catch{}}
 $('status').textContent=ok?'Copied. Paste it into a new chat in your assistant.':'Couldn’t copy automatically. The prompt is selected: press ⌘C or Ctrl+C.';
 if(ok){copied=true;$('copy').textContent='Copied ✓';setTimeout(()=>{$('copy').textContent='Copy prompt';},2500);}
};
$('download').onclick=()=>{const url=URL.createObjectURL(new Blob([$('prompt').value],{type:'text/markdown;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='idea-clinic-prompt.md';link.click();copied=true;setTimeout(()=>URL.revokeObjectURL(url),1000);$('status').textContent='Download started.';};
$('edit').onclick=()=>review();

// In-page confirmation: browser confirm() dialogs can be suppressed in embedded browsers.
function confirmInline(anchor,message,yesLabel,onYes){
 document.querySelectorAll('.inline-confirm').forEach(el=>el.remove());
 const bar=document.createElement('div');bar.className='inline-confirm';bar.setAttribute('role','alert');
 const text=document.createElement('span');text.textContent=message;
 const yes=document.createElement('button');yes.type='button';yes.textContent=yesLabel;yes.onclick=()=>{bar.remove();onYes();};
 const no=document.createElement('button');no.type='button';no.className='secondary';no.textContent='Keep it';no.onclick=()=>bar.remove();
 bar.append(text,yes,no);anchor.insertAdjacentElement('afterend',bar);yes.focus();
}
function startNew(){clearDraft();editing=false;question();}
$('start').onclick=()=>startNew();
$('resume-new').onclick=()=>confirmInline($('resume-new').parentElement,'Discard your unfinished idea?','Discard and start new',startNew);
$('resume-go').onclick=()=>{
 const draft=store.get(DRAFT_KEY)||{};answers=draft.answers||{};unsure=draft.unsure||{};
 path=Array.isArray(draft.path)&&draft.path.length&&draft.path.every(id=>nodes[id])?draft.path:[START];
 if(draft.view==='review')review();else if(draft.view==='handoff')handoff();else question();
};
$('restart').onclick=()=>{
 if(copied){startNew();return;}
 confirmInline($('restart').parentElement,'You haven’t copied this prompt yet. Discard it?','Discard and start new',startNew);
};
window.addEventListener('pagehide',saveDraft);
// The front page saves the first answer as a draft and links here with #continue.
if(location.hash==='#continue'&&store.get(DRAFT_KEY)){history.replaceState(null,'',location.pathname);$('resume-go').click();}
else intro();
