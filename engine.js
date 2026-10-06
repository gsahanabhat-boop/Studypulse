// Pure logic layer: swap seed()/persistence for Supabase/API later.
export const iso=(n=0)=>{const d=new Date();d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)}
export const DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
export const dow=s=>new Date(s+'T12:00').getDay()
export const daysTo=s=>Math.max(1,Math.round((new Date(s+'T12:00')-new Date(iso()+'T12:00'))/864e5))
export const COLORS=['#818cf8','#22d3ee','#c084fc','#34d399','#f472b6','#fbbf24','#60a5fa','#fb923c']
// [weekday, startHour, length, title]
export const CLASSES=[[1,9,1,'SEPM'],[1,10,1,'Networks'],[1,11,1,'TOC'],[1,14,2,'Web Tech Lab'],[2,9,1,'AI'],[2,10,1,'SEPM'],[2,11,1,'Research'],[2,14,1,'EVS'],
[3,9,1,'Networks'],[3,10,1,'TOC'],[3,11,1,'AI'],[4,9,1,'SEPM'],[4,10,2,'Web Tech Lab'],[4,14,2,'Mini Project'],[5,9,1,'TOC'],[5,10,1,'Networks'],[5,11,1,'AI'],[5,14,1,'Research']]
const S=(id,name,short,exam,tp)=>({id,name,short,exam:iso(exam),color:COLORS[id-1],topics:tp.map(([n,d,h,p],i)=>({id:id*100+i,name:n,diff:d,hours:h,progress:p}))})
export const seed=()=>({user:null,settings:{name:'Aarav',hours:3},history:[],streak:4,xp:320,early:0,lastDay:iso(-1),base:38,
subjects:[
S(1,'Software Engineering & Project Management','SEPM',12,[['SDLC Models','Easy',2,100],['Requirements Engineering','Medium',3,60],['Agile & Scrum','Medium',3,30],['Software Testing','Hard',4,10],['Project Estimation (COCOMO)','Hard',3,0]]),
S(2,'Computer Networks','CN',9,[['OSI & TCP/IP','Easy',2,90],['Routing Algorithms','Hard',4,20],['Transport Layer & TCP','Hard',4,0],['Subnetting & IP','Medium',3,40]]),
S(3,'Theory of Computation','TOC',15,[['DFA & NFA','Medium',3,70],['Regular Expressions','Medium',2,40],['Pushdown Automata','Hard',4,10],['Turing Machines','Hard',5,0]]),
S(4,'Web Technology Lab','WTL',7,[['React Components','Medium',3,80],['REST API with Node','Medium',3,50],['Lab Record & Viva','Easy',2,20]]),
S(5,'Artificial Intelligence','AI',18,[['Search Strategies','Medium',3,60],['Knowledge Representation','Hard',4,10],['Machine Learning Basics','Medium',3,30],['Neural Networks','Hard',4,0]]),
S(6,'Mini Project','MP',21,[['Backend Integration','Hard',5,40],['Testing & Demo Prep','Medium',3,0],['Project Report','Easy',3,25]]),
S(7,'Research Methodology & IPR','RM',24,[['Research Design','Easy',2,50],['Patents & Copyright','Medium',3,20],['Report Writing','Easy',2,0]]),
S(8,'Environmental Studies & E-Waste Management','EVS',27,[['Ecosystems','Easy',2,70],['E-Waste Rules','Medium',2,10],['Pollution Control','Easy',2,0]])],
assignments:[{id:1,title:'CN Lab Assignment 3',sid:2,due:iso(2),done:false},{id:2,title:'SEPM Case Study',sid:1,due:iso(4),done:false},{id:3,title:'AI Quiz Prep',sid:5,due:iso(6),done:false},{id:4,title:'Mini Project Review',sid:6,due:iso(10),done:false}]})
export const rem=t=>t.hours*(1-t.progress/100)
export const level=s=>s>=70?'Critical':s>=58?'High':s>=45?'Medium':'Low'
// Priority Engine: 40% deadline urgency, 25% difficulty, 20% weakness, 15% workload
export function prio(s,t,alloc={}){const r=rem(t)-(alloc[t.id]||0);if(r<=.01)return null
const u=Math.max(0,Math.min(1,1.1-daysTo(s.exam)/30)),d={Easy:.35,Medium:.7,Hard:1}[t.diff],w=1-t.progress/100,l=Math.min(1,r/4)
const score=Math.round(100*(.4*u+.25*d+.2*w+.15*l));return{score,u,d,w,l,level:level(score)}}
export const why=(s,t)=>`${s.short} exam in ${daysTo(s.exam)} days, ${t.diff.toLowerCase()} topic, ${t.progress}% done`
export function generate(S,hrs,hist,days=7){const alloc={},plan=[];let last=null
for(let i=0;i<days;i++){const date=iso(i),w=dow(date),busy=new Set()
CLASSES.filter(c=>c[0]==w).forEach(c=>{for(let k=0;k<c[2];k++)busy.add(c[1]+k)})
const pref=w==0||w==6?[10,11,15,16,17,18,19,20]:[18,19,20,17,21,16,13,12]
const hs=pref.filter(h=>!busy.has(h)).slice(0,Math.round(hrs)).sort((a,b)=>a-b)
for(const h of hs){const key=date+'-'+h,rec=hist.find(x=>x.key==key);if(rec){plan.push(rec);continue}
let b=null;for(const s of S)for(const t of s.topics){const p=prio(s,t,alloc);if(!p)continue;const sc=p.score*(last==t.id?.88:1);if(!b||sc>b.sc)b={s,t,p,sc}}
if(!b)continue;alloc[b.t.id]=(alloc[b.t.id]||0)+1;last=b.t.id
plan.push({key,date,h,topicId:b.t.id,sid:b.s.id,title:b.t.name,subject:b.s.short,color:b.s.color,score:b.p.score,level:b.p.level,why:why(b.s,b.t),p:b.p,status:'pending'})}}
return plan}
export function suggest(S,n){const alloc={},out=[];for(let i=0;i<n;i++){let b=null;for(const s of S)for(const t of s.topics){const p=prio(s,t,alloc);if(p&&(!b||p.score>b.p.score))b={s,t,p}}
if(!b)break;alloc[b.t.id]=(alloc[b.t.id]||0)+1;out.push({...b,why:why(b.s,b.t)})}return out}
// Exam risk + readiness (current and projected by exam day)
export function analyze(S,hrs){const subs=S.map(s=>{const total=s.topics.reduce((a,t)=>a+t.hours,0)||1,remaining=s.topics.reduce((a,t)=>a+rem(t),0)
const progress=100*(1-remaining/total),days=daysTo(s.exam),cap=hrs*days*.8/Math.max(1,S.length*.55)
const projected=Math.min(100,progress+100*Math.min(remaining,cap)/total),gap=Math.max(0,remaining-cap)/Math.max(remaining,1)
const risk=Math.round(100*Math.min(1,.4*(1-Math.min(1,days/30))+.35*(1-progress/100)+.25*gap)),riskLabel=risk>=55?'High':risk>=38?'Medium':'Low'
return{...s,total,remaining,progress:Math.round(progress),days,projected:Math.round(projected),risk,riskLabel}})
const T=subs.reduce((a,s)=>a+s.total,0)||1
return{subs,overall:Math.round(subs.reduce((a,s)=>a+s.progress*s.total,0)/T),projected:Math.round(subs.reduce((a,s)=>a+s.projected*s.total,0)/T)}}
