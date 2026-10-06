import {useState,useEffect,useMemo,Fragment} from 'react'
import {motion,AnimatePresence} from 'framer-motion'
import {ResponsiveContainer,BarChart,Bar,XAxis,YAxis,Tooltip,AreaChart,Area,CartesianGrid} from 'recharts'
import {iso,DAYS,dow,daysTo,CLASSES,COLORS,seed,generate,suggest,analyze,prio,rem,why} from './engine'

const LC={Critical:'#f43f5e',High:'#fb923c',Medium:'#fbbf24',Low:'#34d399'}
const Tag=({l,c=LC[l]||'#818cf8'})=><span style={{color:c,background:c+'22'}} className="px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">{l}</span>
const Card=({children,className=''})=><div className={'glass p-5 '+className}>{children}</div>
const H=({children,right})=><div className="flex items-center justify-between mb-3 gap-2"><h3 className="font-semibold text-slate-100">{children}</h3>{right}</div>
const Ring=({v,size=96,c='#818cf8',children})=>{const r=size/2-8,L=2*Math.PI*r,m=size/2
return <div className="relative shrink-0" style={{width:size,height:size}}><svg width={size} height={size} className="-rotate-90"><circle cx={m} cy={m} r={r} stroke="rgba(255,255,255,.08)" strokeWidth="8" fill="none"/>
<motion.circle cx={m} cy={m} r={r} stroke={c} strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={L} initial={{strokeDashoffset:L}} animate={{strokeDashoffset:L*(1-v/100)}} transition={{duration:1.1}} style={{filter:`drop-shadow(0 0 6px ${c})`}}/></svg>
<div className="absolute inset-0 grid place-items-center text-center">{children}</div></div>}
const PBar=({v,c='#818cf8'})=><div className="h-2 rounded-full bg-white/10 overflow-hidden"><motion.div className="h-full rounded-full" style={{background:c}} initial={{width:0}} animate={{width:v+'%'}} transition={{duration:.9}}/></div>
const Task=({t,c})=><div className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
<div className="w-1 h-9 rounded" style={{background:t.color}}/><div className="flex-1 min-w-0"><div className="text-sm truncate">{t.title}</div>
<div className="text-xs text-slate-400">{t.subject}, {t.date==iso()?'Today':t.date.slice(5)} {t.h}:00</div></div><Tag l={t.level}/>
{t.status=='pending'?<><button title="Mark complete" onClick={()=>c.complete(t)} className="btn-ok">✓</button><button title="Mark missed" onClick={()=>c.miss(t)} className="btn-no">✕</button></>
:<Tag l={t.status=='done'?'Done':'Missed'} c={t.status=='done'?'#34d399':'#f43f5e'}/>}</div>

function Auth({onLogin}){const [reg,setReg]=useState(false),[n,setN]=useState(''),[e,setE]=useState('')
const go=ev=>{ev?.preventDefault();onLogin(n||e.split('@')[0]||'Aarav')}
return <div className="min-h-screen grid lg:grid-cols-2 gap-8 items-center max-w-6xl mx-auto p-6">
<motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
<div className="text-violet-300 font-semibold mb-4">◈ StudyPulse</div>
<h1 className="text-4xl md:text-6xl font-bold leading-tight bg-gradient-to-r from-white via-violet-300 to-blue-400 bg-clip-text text-transparent">Stop planning. Start knowing what to study next.</h1>
<p className="mt-5 text-slate-400 max-w-md">StudyPulse reads your timetable, exams and progress, then builds and rebuilds your study plan every time life gets in the way.</p>
<Card className="mt-8 max-w-md"><div className="text-xs text-slate-400">What should I study now?</div><div className="text-lg font-semibold mt-1">Routing Algorithms</div>
<div className="text-sm text-slate-400 mt-1">Exam in 9 days, hard topic, 20% done</div><div className="mt-3"><PBar v={86} c="#f43f5e"/></div></Card></motion.div>
<motion.form onSubmit={go} initial={{opacity:0,scale:.96}} animate={{opacity:1,scale:1}} className="glass p-7 space-y-3">
<h2 className="text-xl font-semibold">{reg?'Create your account':'Welcome back'}</h2>
{reg&&<input className="inp w-full" placeholder="Full name" value={n} onChange={x=>setN(x.target.value)}/>}
<input className="inp w-full" placeholder="Email" value={e} onChange={x=>setE(x.target.value)}/><input className="inp w-full" type="password" placeholder="Password"/>
<button className="btn w-full">{reg?'Create account':'Log in'}</button><button type="button" onClick={()=>go()} className="w-full text-sm text-violet-300 hover:text-white">Try the demo as Aarav</button>
<button type="button" onClick={()=>setReg(!reg)} className="w-full text-xs text-slate-400">{reg?'Have an account? Log in':'New here? Register'}</button></motion.form></div>}

function Dashboard({c}){const {s,plan,st,pending}=c,today=plan.filter(t=>t.date==iso()),next=plan.find(t=>t.status=='pending')
const studied=s.base+s.history.filter(h=>h.status=='done').length,iq=Math.min(100,Math.round(40+st.overall*.35+s.streak*1.5+s.xp/40))
const nextExam=[...st.subs].sort((a,b)=>a.days-b.days)[0]
const week=[...Array(7)].map((_,i)=>({d:DAYS[dow(iso(i-6))],h:i<6?[2,3,1,4,3,2][i]:s.history.filter(h=>h.date==iso()&&h.status=='done').length}))
return <div className="space-y-4">
<div><h1 className="text-2xl font-bold">Good {new Date().getHours()<12?'morning':new Date().getHours()<18?'afternoon':'evening'}, {s.settings.name}</h1>
<p className="text-slate-400 text-sm">{today.filter(t=>t.status=='pending').length} study blocks left today. {nextExam.short} exam is in {nextExam.days} days.</p></div>
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
<Card className="flex items-center gap-4"><Ring v={st.overall}><b>{st.overall}%</b></Ring><div className="text-sm text-slate-400">Overall progress</div></Card>
{[['🔥',s.streak+' days','Study streak'],['⏱',studied+' h','Study hours'],['🧠',iq,'Study IQ, '+s.xp+' XP']].map(([i,v,l])=><Card key={l}><div className="text-2xl">{i}</div><div className="text-2xl font-bold mt-1">{v}</div><div className="text-xs text-slate-400">{l}</div></Card>)}</div>
<div className="grid lg:grid-cols-3 gap-4">
<Card className="lg:col-span-2 relative overflow-hidden"><div className="absolute -top-16 -right-16 w-56 h-56 bg-violet-600/30 blur-3xl rounded-full"/>
<H>What should I study now?</H>{next?<div className="relative"><div className="flex items-start justify-between gap-3 flex-wrap"><div><div className="text-2xl font-bold">{next.title}</div><div className="text-slate-400">{next.subject}, 60 min, {next.date==iso()?'today':next.date} at {next.h}:00</div></div>
<div className="text-right"><div className="text-3xl font-bold" style={{color:LC[next.level]}}>{next.score}</div><Tag l={next.level}/></div></div>
<div className="mt-4 text-sm text-slate-300"><b>Why this one:</b> {next.why}.</div>
<div className="grid grid-cols-4 gap-2 mt-3 text-xs text-slate-400">{[['Deadline',next.p.u,40],['Difficulty',next.p.d,25],['Weakness',next.p.w,20],['Workload',next.p.l,15]].map(([l,v,w])=><div key={l}><div className="mb-1">{l} {w}%</div><PBar v={v*100} c={LC[next.level]}/></div>)}</div>
<div className="flex gap-2 mt-5"><button className="btn" onClick={()=>c.complete(next)}>Complete session</button><button className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 text-sm" onClick={()=>c.miss(next)}>I missed it</button></div></div>
:<p className="text-slate-400">Everything in your plan is done. Add topics in Subjects to keep going.</p>}</Card>
<Card><H>Exam readiness</H><div className="flex items-center gap-4"><Ring v={st.overall} c="#22d3ee" size={88}><b>{st.overall}%</b></Ring><div className="text-sm"><div className="text-slate-400">Projected by exam day</div><div className="text-2xl font-bold text-cyan-300">{st.projected}%</div></div></div>
<div className="mt-4 text-xs text-slate-400">Next exam: {nextExam.name}</div><div className="text-3xl font-bold">{nextExam.days}<span className="text-sm font-normal text-slate-400"> days left</span></div></Card></div>
<div className="grid lg:grid-cols-2 gap-4"><Card><H>Subject progress and exam risk</H><div className="space-y-3">{st.subs.map(x=><div key={x.id}><div className="flex justify-between text-sm mb-1"><span>{x.short} <span className="text-slate-500">{x.progress}%</span></span><Tag l={x.riskLabel+' risk'} c={LC[x.riskLabel=='High'?'Critical':x.riskLabel=='Medium'?'Medium':'Low']}/></div><PBar v={x.progress} c={x.color}/></div>)}</div></Card>
<Card><H>Today's schedule</H>{today.length?today.map(t=><Task key={t.key} t={t} c={c}/>):<p className="text-sm text-slate-400">No study slots today. Increase daily hours in Settings.</p>}</Card></div>
<div className="grid lg:grid-cols-3 gap-4"><Card className="lg:col-span-2"><H>Weekly study hours</H><div className="h-52"><ResponsiveContainer><AreaChart data={week}><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity={.6}/><stop offset="100%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient></defs>
<CartesianGrid stroke="rgba(255,255,255,.06)"/><XAxis dataKey="d" stroke="#64748b"/><YAxis stroke="#64748b"/><Tooltip contentStyle={{background:'#0f172a',border:'1px solid #334155',borderRadius:12}}/><Area dataKey="h" stroke="#a78bfa" fill="url(#g)" strokeWidth={2}/></AreaChart></ResponsiveContainer></div></Card>
<Card><H>Deadlines</H>{s.assignments.filter(a=>!a.done).sort((a,b)=>a.due>b.due?1:-1).slice(0,4).map(a=><div key={a.id} className="text-sm py-1.5 flex justify-between"><span className="truncate">{a.title}</span><span className="text-slate-400 ml-2">{daysTo(a.due)}d</span></div>)}
<div className="border-t border-white/10 mt-2 pt-2 text-xs text-slate-400">Pending topics</div>{pending.slice(0,4).map(p=><div key={p.t.id} className="text-sm py-1 flex justify-between"><span className="truncate">{p.t.name}</span><Tag l={p.p.level}/></div>)}</Card></div></div>}

function Plan({c}){const days=[...Array(7)].map((_,i)=>iso(i)),risky=c.st.subs.filter(x=>x.riskLabel=='High')
return <div className="space-y-4"><h1 className="text-2xl font-bold">My study plan</h1>
<Card><H>Suggested extra time</H>{risky.length?risky.map(x=><div key={x.id} className="text-sm py-1">Add 1 hour a day to <b>{x.name}</b>: risk {x.risk}, exam in {x.days} days, projected readiness {x.projected}%.</div>):<p className="text-sm text-slate-400">No subject is at high risk. Keep the current pace.</p>}</Card>
{days.map(d=>{const ts=c.plan.filter(t=>t.date==d);return <Card key={d}><H right={<span className="text-xs text-slate-400">{ts.length} blocks</span>}>{DAYS[dow(d)]}, {d.slice(5)}{d==iso()&&' (today)'}</H>{ts.map(t=><Task key={t.key} t={t} c={c}/>)}{!ts.length&&<p className="text-sm text-slate-400">Free day.</p>}</Card>})}</div>}

function Subjects({c}){const [n,setN]=useState(''),[a,setA]=useState({t:'',sid:'1',due:iso(5)})
return <div className="space-y-4"><h1 className="text-2xl font-bold">Subjects and topics</h1>
<Card><H>Add subject</H><div className="flex gap-2 flex-wrap"><input className="inp flex-1" placeholder="Subject name" value={n} onChange={e=>setN(e.target.value)}/><button className="btn" onClick={()=>{n&&c.addSub(n);setN('')}}>Add subject</button></div></Card>
<Card><H>Assignment deadlines</H><div className="flex gap-2 flex-wrap mb-3"><input className="inp flex-1" placeholder="Assignment title" value={a.t} onChange={e=>setA({...a,t:e.target.value})}/>
<select className="inp" value={a.sid} onChange={e=>setA({...a,sid:e.target.value})}>{c.s.subjects.map(s=><option key={s.id} value={s.id}>{s.short}</option>)}</select><input type="date" className="inp" value={a.due} onChange={e=>setA({...a,due:e.target.value})}/>
<button className="btn" onClick={()=>{a.t&&c.up(p=>({...p,assignments:[...p.assignments,{id:Date.now(),title:a.t,sid:+a.sid,due:a.due,done:false}]}));setA({...a,t:''})}}>Add deadline</button></div>
{c.s.assignments.map(x=><div key={x.id} className="flex items-center gap-3 text-sm py-1.5"><input type="checkbox" checked={x.done} onChange={()=>c.up(p=>({...p,assignments:p.assignments.map(y=>y.id==x.id?{...y,done:!y.done}:y)}))}/>
<span className={'flex-1 '+(x.done?'line-through text-slate-500':'')}>{x.title}</span><span className="text-slate-400">{x.due}</span><button className="text-rose-300" onClick={()=>c.up(p=>({...p,assignments:p.assignments.filter(y=>y.id!=x.id)}))}>Delete</button></div>)}</Card>
{c.s.subjects.map(s=><SubCard key={s.id} s={s} c={c}/>)}</div>}
function SubCard({s,c}){const [t,setT]=useState(''),[d,setD]=useState('Medium')
return <Card><div className="flex gap-2 flex-wrap items-center mb-3"><span className="w-3 h-3 rounded-full" style={{background:s.color}}/><input className="inp flex-1 font-semibold" value={s.name} onChange={e=>c.updSub(s.id,{name:e.target.value})}/>
<input type="date" className="inp" value={s.exam} onChange={e=>c.updSub(s.id,{exam:e.target.value})}/><button className="text-rose-300 text-sm" onClick={()=>c.up(p=>({...p,subjects:p.subjects.filter(x=>x.id!=s.id)}))}>Delete subject</button></div>
{s.topics.map(x=><div key={x.id} className="flex items-center gap-2 py-1.5 flex-wrap"><input className="inp flex-1 min-w-[140px]" value={x.name} onChange={e=>c.updTopic(s.id,x.id,{name:e.target.value})}/>
<select className="inp" value={x.diff} onChange={e=>c.updTopic(s.id,x.id,{diff:e.target.value})}>{['Easy','Medium','Hard'].map(v=><option key={v}>{v}</option>)}</select>
<input type="range" className="w-28 accent-violet-500" value={x.progress} onChange={e=>c.updTopic(s.id,x.id,{progress:+e.target.value})}/><span className="text-xs w-9">{x.progress}%</span>
<button className="text-rose-300 text-sm" onClick={()=>c.up(p=>({...p,subjects:p.subjects.map(y=>y.id!=s.id?y:{...y,topics:y.topics.filter(z=>z.id!=x.id)})}))}>✕</button></div>)}
<div className="flex gap-2 mt-2 flex-wrap"><input className="inp flex-1" placeholder="New topic" value={t} onChange={e=>setT(e.target.value)}/><select className="inp" value={d} onChange={e=>setD(e.target.value)}>{['Easy','Medium','Hard'].map(v=><option key={v}>{v}</option>)}</select>
<button className="btn" onClick={()=>{t&&c.up(p=>({...p,subjects:p.subjects.map(y=>y.id!=s.id?y:{...y,topics:[...y.topics,{id:Date.now(),name:t,diff:d,hours:3,progress:0}]})}));setT('')}}>Add topic</button></div></Card>}

function Calendar({c}){const [sel,setSel]=useState(null),days=[...Array(7)].map((_,i)=>iso(i)),sel2=sel&&c.plan.find(p=>p.key==sel)
return <div className="space-y-4"><h1 className="text-2xl font-bold">College timetable and study plan</h1>
<div className="flex gap-3 text-xs text-slate-400"><span>▪ Grey: classes (unavailable)</span><span>▪ Colored: generated study blocks</span></div>
<Card className="overflow-x-auto"><div className="grid min-w-[720px]" style={{gridTemplateColumns:'48px repeat(7,1fr)'}}><div/>{days.map(d=><div key={d} className="text-center text-xs py-2 text-slate-300">{DAYS[dow(d)]} {d.slice(8)}</div>)}
{[...Array(15)].map((_,i)=>i+8).map(h=><Fragment key={h}><div className="text-xs text-slate-500 pr-2 text-right pt-1">{h}:00</div>{days.map(d=>{const cl=CLASSES.find(x=>x[0]==dow(d)&&h>=x[1]&&h<x[1]+x[2]),t=c.plan.find(p=>p.date==d&&p.h==h)
return <div key={d+h} className="border border-white/5 h-11 p-0.5">{cl?<div className="h-full rounded bg-slate-500/20 text-[10px] px-1 pt-1 text-slate-400 truncate">{cl[3]}</div>
:t&&<motion.button whileHover={{scale:1.04}} onClick={()=>setSel(t.key)} className="h-full w-full rounded text-[10px] px-1 text-left truncate text-white" style={{background:t.color+(t.status=='pending'?'bb':'44'),textDecoration:t.status=='done'?'line-through':'none',outline:t.status=='missed'?'1px solid #f43f5e':'none'}}>{t.subject}: {t.title}</motion.button>}</div>})}</Fragment>)}</div></Card>
<AnimatePresence>{sel2&&<motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0}}><Card><Task t={sel2} c={{complete:t=>{c.complete(t);setSel(null)},miss:t=>{c.miss(t);setSel(null)}}}/><div className="text-xs text-slate-400 mt-2">{sel2.why}</div></Card></motion.div>}</AnimatePresence></div>}

function Analytics({c}){const [wh,setWh]=useState(c.s.settings.hours),w=useMemo(()=>analyze(c.s.subjects,wh),[c.s.subjects,wh]),{s,st}=c
const done=s.history.filter(h=>h.status=='done').length,A=[['First Topic Completed','🌱',done>0||s.subjects.some(x=>x.topics.some(t=>t.progress==100))],['7-Day Streak','🔥',s.streak>=7],['Early Finisher','⚡',s.early>0],['Exam Ready','🎓',st.subs.some(x=>x.progress>=80)]]
return <div className="space-y-4"><h1 className="text-2xl font-bold">Progress analytics</h1>
<Card><H>Progress and projected readiness by subject</H><div className="h-64"><ResponsiveContainer><BarChart data={st.subs.map(x=>({n:x.short,Now:x.progress,Projected:x.projected}))}><CartesianGrid stroke="rgba(255,255,255,.06)"/><XAxis dataKey="n" stroke="#64748b"/><YAxis stroke="#64748b" domain={[0,100]}/><Tooltip contentStyle={{background:'#0f172a',border:'1px solid #334155',borderRadius:12}}/><Bar dataKey="Now" fill="#818cf8" radius={[6,6,0,0]}/><Bar dataKey="Projected" fill="#22d3ee" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></div></Card>
<Card><H>What if?</H><div className="flex items-center gap-4 flex-wrap"><div className="flex-1 min-w-[220px]"><div className="text-sm mb-2">Daily study hours: <b>{wh}</b></div><input type="range" min="1" max="8" value={wh} onChange={e=>setWh(+e.target.value)} className="w-full accent-violet-500"/></div>
<div className="text-center"><div className="text-xs text-slate-400">Predicted readiness</div><motion.div key={w.projected} initial={{scale:1.3}} animate={{scale:1}} className="text-4xl font-bold text-cyan-300">{w.projected}%</motion.div>
<div className="text-xs" style={{color:w.projected>=st.projected?'#34d399':'#fb923c'}}>{w.projected>=st.projected?'+':''}{w.projected-st.projected} vs your current plan</div></div></div></Card>
<Card><H>Achievements</H><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{A.map(([n,i,u])=><div key={n} className={'rounded-xl p-4 text-center border '+(u?'border-violet-400/50 bg-violet-500/10':'border-white/5 opacity-40')}><div className="text-3xl">{i}</div><div className="text-sm mt-1">{n}</div><div className="text-xs text-slate-400">{u?'Unlocked':'Locked'}</div></div>)}</div></Card></div>}

function Assistant({c}){const [m,setM]=useState([{r:'bot',t:`Hi ${c.s.settings.name}. Tell me how much time you have and I'll build a plan from your deadlines and progress.`}]),[q,setQ]=useState(''),[busy,setBusy]=useState(false)
const send=x=>{x=x||q;if(!x.trim())return;const h=Math.max(1,Math.min(8,Math.round(+(x.match(/(\d+(\.\d+)?)\s*(h|hr|hour)/i)||[])[1]||2)));setQ('');setM(p=>[...p,{r:'user',t:x}]);setBusy(true)
setTimeout(()=>{setM(p=>[...p,{r:'bot',t:`Here's your ${h}-hour plan, ranked by priority:`,items:suggest(c.s.subjects,h)}]);setBusy(false)},900)}
return <div className="space-y-4"><h1 className="text-2xl font-bold">AI study assistant</h1><Card className="space-y-3 min-h-[380px]">
{m.map((x,i)=><motion.div key={i} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className={x.r=='user'?'text-right':''}><div className={'inline-block max-w-[90%] text-left rounded-2xl px-4 py-2.5 text-sm '+(x.r=='user'?'bg-violet-600':'bg-white/10')}>{x.t}
{x.items?.map((it,j)=><div key={j} className="mt-2 pt-2 border-t border-white/10"><b>Hour {j+1}: {it.t.name}</b> ({it.s.short}) <Tag l={it.p.level}/><div className="text-xs text-slate-300">{it.why}. Priority {it.p.score}.</div></div>)}</div></motion.div>)}
{busy&&<div className="text-sm text-slate-400 animate-pulse">Thinking through your deadlines...</div>}</Card>
<div className="flex gap-2 flex-wrap">{['I have 2 hours today. What should I study?','I only have 1 hour. What is most urgent?','Plan my 4 hours'].map(x=><button key={x} onClick={()=>send(x)} className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10">{x}</button>)}</div>
<div className="flex gap-2"><input className="inp flex-1" placeholder="Ask anything about your plan" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key=='Enter'&&send()}/><button className="btn" onClick={()=>send()}>Ask</button></div></div>}

function Settings({c}){const {s}=c;return <div className="space-y-4 max-w-xl"><h1 className="text-2xl font-bold">Settings</h1><Card className="space-y-4">
<div><div className="text-sm mb-1">Your name</div><input className="inp w-full" value={s.settings.name} onChange={e=>c.up(p=>({...p,settings:{...p.settings,name:e.target.value}}))}/></div>
<div><div className="text-sm mb-1">Daily study hours: <b>{s.settings.hours}</b></div><input type="range" min="1" max="8" className="w-full accent-violet-500" value={s.settings.hours} onChange={e=>c.up(p=>({...p,settings:{...p.settings,hours:+e.target.value}}))}/></div>
<div className="flex gap-2"><button className="btn" onClick={()=>c.up(p=>({...seed(),user:p.user}))}>Reset demo data</button><button className="px-4 py-2 rounded-xl bg-white/10 text-sm" onClick={()=>c.up(p=>({...p,user:null}))}>Log out</button></div></Card></div>}

const NAV=[['dash','Dashboard','◈'],['plan','My plan','☰'],['subj','Subjects','▤'],['cal','Timetable','▦'],['ana','Analytics','◔'],['ai','AI assistant','✦'],['set','Settings','⚙']]
const PAGES={dash:Dashboard,plan:Plan,subj:Subjects,cal:Calendar,ana:Analytics,ai:Assistant,set:Settings}
export default function App(){
const [s,setS]=useState(()=>{try{return JSON.parse(localStorage.getItem('studypulse'))||seed()}catch{return seed()}}),[page,setPage]=useState('dash'),[toast,setToast]=useState(null),[re,setRe]=useState(false)
useEffect(()=>{localStorage.setItem('studypulse',JSON.stringify(s))},[s])
const say=(m,k='ok')=>{setToast({m,k,id:Date.now()});setTimeout(()=>setToast(null),2600)}
const plan=useMemo(()=>generate(s.subjects,s.settings.hours,s.history),[s.subjects,s.settings.hours,s.history])
const st=useMemo(()=>analyze(s.subjects,s.settings.hours),[s.subjects,s.settings.hours])
const pending=useMemo(()=>s.subjects.flatMap(x=>x.topics.map(t=>({s:x,t,p:prio(x,t)}))).filter(x=>x.p).sort((a,b)=>b.p.score-a.p.score),[s.subjects])
const up=f=>setS(f),mapSub=(id,f)=>up(p=>({...p,subjects:p.subjects.map(x=>x.id==id?f(x):x)}))
const c={s,up,plan,st,pending,
updSub:(id,v)=>mapSub(id,x=>({...x,...v})),updTopic:(sid,tid,v)=>mapSub(sid,x=>({...x,topics:x.topics.map(t=>t.id==tid?{...t,...v}:t)})),
addSub:n=>up(p=>{const i=p.subjects.length;return{...p,subjects:[...p.subjects,{id:Date.now(),name:n,short:n.slice(0,4).toUpperCase(),exam:iso(20),color:COLORS[i%8],topics:[]}]}}),
complete:t=>{const early=t.date>iso();up(p=>({...p,history:[...p.history,{...t,status:'done'}],xp:p.xp+25,early:p.early+(early?1:0),streak:p.lastDay==iso()?p.streak:p.streak+1,lastDay:iso(),
subjects:p.subjects.map(x=>x.id!=t.sid?x:{...x,topics:x.topics.map(y=>y.id!=t.topicId?y:{...y,progress:Math.min(100,Math.round(y.progress+100/y.hours))})})}))
say(early?'Finished early: remaining schedule optimized':'Session complete, +25 XP')},
miss:t=>{up(p=>({...p,history:[...p.history,{...t,status:'missed'}]}));setRe(true);setTimeout(()=>{setRe(false);say('PLAN REPLANNED: unfinished work moved to your next free slots','warn')},1500)}}
if(!s.user)return <Auth onLogin={n=>setS(p=>({...p,user:n,settings:{...p.settings,name:n}}))}/>
const Page=PAGES[page]
return <div className="md:flex min-h-screen">
<aside className="hidden md:flex flex-col w-56 p-4 gap-1 sticky top-0 h-screen border-r border-white/10"><div className="text-violet-300 font-bold text-lg mb-6 px-3">◈ StudyPulse</div>
{NAV.map(([k,l,i])=><button key={k} onClick={()=>setPage(k)} className={'text-left px-3 py-2.5 rounded-xl text-sm transition '+(page==k?'bg-violet-500/25 text-white shadow-[0_0_14px_#7c3aed55]':'text-slate-400 hover:bg-white/5')}>{i} {l}</button>)}</aside>
<div className="md:hidden flex overflow-x-auto gap-1 p-2 sticky top-0 z-20 backdrop-blur bg-slate-950/70">{NAV.map(([k,l])=><button key={k} onClick={()=>setPage(k)} className={'px-3 py-1.5 rounded-lg text-xs whitespace-nowrap '+(page==k?'bg-violet-500/30':'text-slate-400')}>{l}</button>)}</div>
<main className="flex-1 p-4 md:p-8 max-w-6xl"><AnimatePresence mode="wait"><motion.div key={page} initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:.25}}><Page c={c}/></motion.div></AnimatePresence></main>
<AnimatePresence>{toast&&<motion.div key={toast.id} initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} exit={{opacity:0}} className={'fixed bottom-6 left-1/2 -translate-x-1/2 z-40 glass px-5 py-3 text-sm flex items-center gap-3 '+(toast.k=='warn'?'border-amber-400/60':'border-emerald-400/60')}>
{toast.k=='ok'?<motion.span initial={{scale:0,rotate:-90}} animate={{scale:1,rotate:0}} className="text-emerald-300 text-lg">✔</motion.span>:<motion.span animate={{scale:[1,1.3,1]}} transition={{repeat:2}} className="text-amber-300">⚠</motion.span>}{toast.m}</motion.div>}</AnimatePresence>
<AnimatePresence>{re&&<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 backdrop-blur-sm"><div className="glass px-8 py-6 text-center"><motion.div animate={{rotate:360}} transition={{repeat:Infinity,duration:1,ease:'linear'}} className="w-10 h-10 mx-auto mb-3 rounded-full border-4 border-violet-400 border-t-transparent"/><div className="font-bold tracking-wide">REPLANNING...</div><div className="text-xs text-slate-400">Redistributing missed work into free slots</div></div></motion.div>}</AnimatePresence></div>}
