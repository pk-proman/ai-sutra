import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import htm from 'htm';
import './styles.css';
const html = htm.bind(React.createElement);

/* ---------- Content (site copy; the catalogue itself lives in the content store) ---------- */
const BRAND = 'AI Sutra';
const TAGLINE = 'The Neural Fabric for Industrial Excellence.';
const SEGMENTS = [
 { id:'sales', n:'01', name:'Sales', line:'From first lead to a confirmed, funded order', outcome:'Quotes in hours, higher win rate, protected margin', rows:[
  ['Lead','Leads scattered across calls, WhatsApp, expos and diaries','AI captures, de-duplicates and scores every lead in one CRM','No lead lost; sales time on best-fit buyers'],
  ['Enquiry','Specs arrive as emails and drawings; clarifications drag on','AI agent reads enquiries, extracts specs and flags gaps instantly','Faster response; fewer back-and-forth rounds'],
  ['Quotation','Excel costing on old rates; quotes take days','Quote engine prices from live BOM, material and labour costs','Quotes out in hours, margin protected'],
  ['Negotiation','Discounts given on instinct; revisions lost in email','Version-controlled quotes showing margin impact of every discount','Pricing decided on margin, not pressure'],
  ['Approval','Approvals chase the MD by phone; deals stall','Rule-based approvals on mobile, with full deal context','Faster sign-off, clear accountability'],
  ['Sales order & advance','SO re-keyed into ERP; advance checked by hand','Approved quote converts to SO; advance matched automatically','Zero re-entry; production starts on confirmed cash'] ]},
 { id:'execution', n:'02', name:'Execution', line:'From plan to shipped product, on time', outcome:'On-time delivery, higher utilization, less rework', rows:[
  ['Production plan','Plans built in Excel, reshuffled daily','AI-assisted plan from order book, capacity and due dates','Realistic delivery dates; fewer firefights'],
  ['Manpower','Shifts allocated from memory and phone calls','Skill-mapped manpower plan linked to the production plan','Right people on the right jobs; less overtime'],
  ['Resources','Machine load unknown until a job is late','Live machine-load view with bottleneck alerts','Higher utilization; bottlenecks caught early'],
  ['Work orders','Paper job cards; status by walking the floor','Digital work orders with real-time status','Instant WIP visibility for every order'],
  ['Materials','Shortages found at the machine; urgent buying','MRP agent nets BOM against stock and raises requisitions','Fewer stock-outs; no urgent-purchase premium'],
  ['Quality plan','Inspection criteria live in people\'s heads','Quality plan auto-attached to every work order','Consistent quality, first time right'],
  ['Procurement','RFQs by email; PO follow-ups and GRN matching by hand','Procurement agent runs RFQs, comparison, POs, follow-ups, GRN match','Lower buying cost; materials on time'],
  ['Manufacturing','Output, scrap and downtime logged late, if at all','Shop-floor capture of output, scrap and downtime per job','Higher throughput; true cost per job'],
  ['Quality','Inspection on paper; NCRs rarely closed','Digital inspection, NCR and CAPA with photo evidence','Less rework; audit-ready records'],
  ['Dispatch','Packing list, invoice and e-way bill prepared separately','One-click dispatch documents; customer notified','On-time, error-free dispatch'] ]},
 { id:'finance', n:'03', name:'Finance', line:'Cash, costs and profit, visible every day', outcome:'Healthier cash, lower DSO, live P&L', rows:[
  ['Invoicing','Invoices typed after dispatch; GST errors cause disputes','Dispatch triggers a GST-compliant e-invoice','Invoiced the same day; fewer disputes'],
  ['Payments','Supplier bills matched to PO and GRN by hand','Invoice agent reads bills, 3-way matches, schedules payment','Accurate payables; supplier trust'],
  ['Receivables','Collections chased from an Excel ageing','AI collections agent: reminders, promises, escalations','Lower DSO; stronger cash flow'],
  ['Accounting','Month-end close takes weeks','Every transaction auto-posts; AI reconciles bank statements','Books closed in days, not weeks'],
  ['Stock management','Book stock rarely matches the store','Live stock by location, batch and age with reorder alerts','Less working capital locked in inventory'],
  ['P&L','Profit known only after the audit','Live P&L by order, product and customer','Decisions on margin, every week'] ]},
 { id:'support', n:'04', name:'Support', line:'After the sale, service becomes a revenue engine', outcome:'Faster resolution, higher uptime, service revenue', rows:[
  ['Installation & commissioning','Site visits planned by phone; reports on paper','Scheduled visits with digital checklists and sign-off','Faster handover; clean start to warranty'],
  ['Service requests','Complaints by phone and WhatsApp; no ticket, no SLA','AI support agent logs, triages and routes every request','Faster resolution; SLAs met'],
  ['AMC & warranty','Warranty and AMC renewals tracked in Excel','Automatic warranty check; renewal reminders and quotes','Recurring service revenue protected'],
  ['Preventive maintenance & spares','Breakdowns drive visits; spares are guesswork','PM schedules from machine history; AI spares forecast','Higher customer uptime; spares revenue'] ]},
 { id:'closure', n:'05', name:'Closure', line:'Close every order cleanly, and win the next one', outcome:'Repeat orders, cash released at closure', rows:[
  ['Customer feedback','Feedback is informal and rarely recorded','Automated feedback at delivery and after service, AI-summarized','Voice of the customer drives improvement'],
  ['Order closure','Orders close with loose ends: retention, documents, dues','Closure checklist: dues, documents, retention, sign-off','Cash released; no loose ends'],
  ['Lessons & repeat business','Learnings lost; repeat opportunities missed','Closure insights feed quoting, design and CRM follow-ups','Sharper next quote; more repeat orders'] ]}
];
const PLATFORM = 'AISutra';
/* AISutra is a trademark: always rendered in exactly this case, never uppercased by styles. */
const SA = html`<span className="tm">AISutra</span>`;
const AS = html`<span className="tm">AI Sutra<sup>™</sup></span>`;
const SATM = html`<span className="tm">AISutra<sup>™</sup></span>`;
const T = s => typeof s!=='string' ? s : s.split(/(AISutra|AI Sutra)/).map((p,i)=>p==='AISutra' ? html`<span key=${i} className="tm">AISutra</span>` : p==='AI Sutra' ? html`<span key=${i} className="tm">AI Sutra<sup>™</sup></span>` : p);
const METHOD = 'WEAVE';
/* WEAVE method: [letter, name, timing, what happens, deliverable, outcome] */
/* Sanskrit pair for each WEAVE stage, read in order they spell सूत्र (Sutra): [initial, word, transliteration, meaning] */
const SANS = [
 ['S','समीक्षा','Samiksha','thorough review'],
 ['U','उपाय','Upaya','the right means'],
 ['T','तन्त्र','Tantra','the loom, the framework'],
 ['R','रचना','Rachana','creation, construction'],
 ['A','अभ्युदय','Abhyudaya','rising prosperity']
];
const WEAVE = [
 ['W','Witness','Weeks 1–6 · Discovery','We review your as-is processes, operating procedures, software, IT infrastructure and how data moves between them.','As-is review and a value baseline for every department','The truth, quantified'],
 ['E','Envision','End of Discovery','We consolidate the findings into a three-phase roadmap on AISutra: Stabilise, Build and Scale, with priorities, costs and KPIs.','Roadmap: Stabilise, Build and Scale','A plan worth funding'],
 ['A','Assemble','Months 2–9','Improved processes and SOPs, consolidated software and IT infrastructure, and integrated data and process flow on AISutra.','One connected business on AISutra','Everything typed once'],
 ['V','Vitalise','Months 4–15','Automation and AI agents switched on where the roadmap prioritizes them, with live dashboards and trained teams.','Prioritized automation, live dashboards','Automation where it pays most'],
 ['E','Evolve','Months 12–24','We run, measure and extend AISutra: managed IT ownership, new automations and quarterly value reviews against the baseline.','Quarterly value reviews','Compounding toward 3x–5x']
];
/* Departments: [name, colour, promise, what changes, KPIs we move] */
const DEPTS = [
 ['Marketing','var(--gold)','Every lead captured, scored and followed up',['Leads from expos, web, calls and WhatsApp land in one CRM','AI scores and routes each lead within minutes','Campaign return visible by product and region'],['Qualified leads','Cost per lead','Response time']],
 ['Sales','var(--pink)','Quotes in hours, margins protected',['Enquiry agent reads specs and drawings','Quote engine prices from live costs','Approvals on mobile, with full deal context'],['Quote turnaround','Win rate','Margin per order']],
 ['Operations','var(--violet)','Plans the factory can keep',['AI-assisted production plan and MRP','Procurement agent runs RFQ to goods receipt','Shop-floor capture of output, scrap and downtime'],['On-time delivery','Utilization','Rework and scrap']],
 ['Finance','var(--teal)','Cash and profit, visible every day',['E-invoice on dispatch; bills read and 3-way matched','Collections agent follows up on every due','Live P&L by order, product and customer'],['Days sales outstanding','Days to close books','Margin visibility']],
 ['Service','var(--gold)','After-sales becomes a revenue line',['WhatsApp service desk with AI triage','Warranty, AMC and spares tracked automatically','Preventive maintenance from machine history'],['Customer uptime','SLAs met','Service revenue']],
 ['People','var(--pink)','The right skills, growing with the business',['Skill matrix linked to the production plan','Onboarding, attendance and payroll inputs automated','AI literacy programme so every team uses the tools'],['Time to productivity','Skill coverage','Hours freed from admin']],
 ['Innovation & R&D','var(--violet)','New products and custom designs, faster',['Drawings, BOMs and past jobs searchable as one databank','AI finds reusable designs and estimates cost early','Field and customer feedback flows back into design'],['Design reuse','New-design cycle time','Early cost accuracy']],
 ['Leadership','var(--teal)','Vision turned into a plan everyone works to',['Annual plan cascaded into department targets','One live cockpit: plan versus actual, every week','Agents flag risks before they become surprises'],['Plan-vs-actual visibility','Review cycle time','Decision lead time']]
];
const GAPS = [
 ['Vision stays in the boardroom','Targets are set once a year and rarely reach daily work on the floor.'],
 ['Systems that do not talk','Tally, Excel, WhatsApp and a half-used ERP. Every hand-off is typed again.'],
 ['Knowledge lives in people','Costing, process know-how and customer history walk out when people do.'],
 ['Numbers arrive too late','Profit, stock and delivery truth surface at month-end, after the damage.'],
 ['Skilled people doing clerical work','Engineers and managers lose hours to chasing, copying and reconciling.'],
 ['Decisions on instinct','Without one version of the truth, every review becomes a debate.']
];
const LAYERS = [
 ['Vision & plans','Management\'s vision becomes an annual plan, department targets and weekly measures.','Everyone knows the number they move.'],
 ['People','Roles, skills and approvals designed around the new way of working, with training built in.','Teams that use the system, not work around it.'],
 ['Processes','Every process from lead to closure standardized once and run the same way every time.','Fewer hand-offs, nothing lost between teams.'],
 ['Systems','The ERPNext core, AISutra apps and integrations: one connected flow where data is typed once.','One version of the truth.'],
 ['Data & AI','An enriched databank, and AI agents that act on it while people approve what matters.','Work done faster, decisions made sharper.']
];
const OFFER = [
 ['Discovery & roadmap','We review your as-is processes, operating procedures, software and IT systems, and consolidate it all into a three-phase roadmap on AISutra: Stabilise, Build and Scale.','₹2.5 lakh · indicative'],
 ['Ready-made AI & automation','AI chatbots and support agents, custom agents, analytics and insights, and document and knowledge portals, deployed where your roadmap prioritizes them.','Priced after Discovery'],
 ['Department solutions','Finance agents, operations automation, and people and R&D tools, built on AISutra around each department\'s targets.','Priced after Discovery'],
 ['End-to-end IT ownership','Consolidated software, hardware, licences and AI agents on AISutra, run by one accountable partner.','Priced after Discovery']
];
const ENGAGE = [
 ['Discovery','₹2.5 lakh','indicative, fixed scope, about 6 weeks',['Review of as-is processes and operating procedures','Review of software, IT infrastructure and data flow','Value baseline for every department','Roadmap on AISutra: Stabilise, Build and Scale, with cost and expected impact'],true],
 ['Build & roll-out','Scoped to you','priced after Discovery',['Improved processes and SOPs','Consolidated software and IT infrastructure on AISutra','Integrated data and process flow','Automation and AI agents, as prioritized'],false],
 ['Run & grow','Scoped to you','priced after Discovery',['Managed AISutra subscription','End-to-end IT ownership: software, hardware, licences','New agents as the business grows','Quarterly value reviews against the baseline'],false]
];
const REVIEW = ['As-is processes','Operating procedures (SOPs)','Software in use','IT infrastructure and devices','Data, reports and how they flow','Roles, skills and approvals'];
const HORIZONS = [
 ['Stabilise','0–6 months','Fix the foundations',['Improved processes and SOPs','Quick wins on the most painful steps','Clean masters: customers, items, BOMs'],'var(--gold)'],
 ['Build','6–12 months','Connect the business',['Consolidated software and IT infrastructure on AISutra','Integrated data and process flow, end to end','Role-based homepages and live dashboards'],'var(--pink)'],
 ['Scale','12–24 months','Automate and compound',['Automation and AI agents, as prioritized','Management cockpit and predictive insight','Continuous improvement toward 3x–5x'],'var(--violet)']
];
const LEVERS = ['Improved processes & SOPs','Consolidated software & IT infrastructure','Integrated data & process flow','Automation, as prioritized'];
const PROMAN = ['ERPNext running across divisions, trimmed to how each one works','Leads synced automatically into the ERP','AI-drafted proposals and quotations','Purchase-invoice automation','Custom approval workflows, such as transport cost control','Knowledge portals for each division','A 90-day AI literacy programme for staff'];
const TRUST = [
 ['Your data, your ownership','A dedicated instance hosted in India. Export everything, any time.'],
 ['No lock-in','An open-source ERPNext core and standard data formats.'],
 ['Agents act, people approve','Prices, payments and dispatch always pass a human approval. Every action is logged.'],
 ['Right-sized AI','The lightest model that does the job; private or zero-retention models for sensitive steps.'],
 ['Secure by default','Role-based access, backups and monitored infrastructure.'],
 ['One accountable partner','From Discovery to day-to-day running, one team owns the result.']
];
const WHY = [
 ['Operator DNA','35 years of industrial operating leadership, paired with 20+ years of IT delivery and enterprise-AI leadership.'],
 ['Proven on the shop floor','AI-led transformation already running in a multi-division manufacturing group.'],
 ['Reusable IP','Agent templates and playbooks, so your deployment starts from proven patterns.'],
 ['Outcome-accountable','Phased delivery with milestone-based ROI tracking against an agreed baseline.']
];
const FAQ = [
 ['Where do we start?','With Discovery. We review your as-is processes, operating procedures, software and IT systems, and consolidate the findings into a three-phase roadmap on AISutra: Stabilise, Build and Scale. You decide what to take forward.'],
 ['Do we have to replace our current ERP or Tally?','Not by default. Discovery reviews the software you already use, and we consolidate only where it pays. AISutra runs on an ERPNext core, trimmed to what you need, with a bridge from Tally or other systems so there is no big-bang switch.'],
 ['What does it cost to start?','Discovery is indicatively ₹2.5 lakh for a fixed scope. It ends with a costed roadmap. Everything after it is priced on your specific needs, so you only commit to what the roadmap justifies.'],
 ['How soon will we see results?','Improved processes and SOPs bring the first gains, typically within about 90 days. The overall target is a 3x to 5x productivity improvement over 12 to 24 months, measured against the baseline set in Discovery.'],
 ['Is this only for operations?','No. AISutra covers every department: marketing, sales, operations, finance, service, people, innovation and R&D, and leadership, because the gains come from all of them working as one.'],
 ['Is our data safe with AI?','Your data stays on a dedicated site hosted in India with role-based access. Agents act through approvals, every action is logged, and sensitive steps use private or zero-retention models.'],
 ['Who is this built for?','Manufacturing MSMEs that want to grow output without growing headcount at the same pace, especially equipment and engineered-product manufacturers.']
];
const CATS = ['All','Platform','AI agent','App','Dashboard','Service'];
const SEGS = ['Sales','Execution','Finance','Support','Closure','Cross-cycle'];
const STATUSES = ['In pilot','In build','Planned'];

/* ---------- Small pieces ---------- */
const Arrow = () => html`<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>`;
const Check = () => html`<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="8" stroke="var(--teal)" strokeWidth="1.5"/><path d="M5.5 9.2l2.3 2.3 4.7-5" stroke="var(--teal)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>`;
const Logo = () => html`<a href="/" className="flex items-center gap-3" aria-label="Home">
  <${Mark} size=${38}/>
  <span className="font-display font-extrabold text-[1.05rem] tracking-tight">${AS}</span></a>`;
/* AI Sutra mark (concept A, Neural Gear): a gear framing a small neural network, with a rising arrow breaking out */
let markN=0;
function Mark({size}){
  const id=useMemo(()=>'mk'+(++markN),[]);
  const g='url(#'+id+')';
  return html`<svg width=${size} height=${size} viewBox="0 0 120 120" aria-hidden="true" className="shrink-0">
    <defs><linearGradient id=${id} x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="var(--gold)"/><stop offset=".5" stopColor="var(--pink)"/><stop offset="1" stopColor="var(--violet)"/></linearGradient></defs>
    <g fill=${g}>${[0,90,135,180,225,270,315].map(r=>html`<rect key=${r} x="55.5" y="13" width="9" height="11" rx="2" transform=${'rotate('+r+' 60 60)'}/>`)}</g>
    <circle cx="60" cy="60" r="34" fill="none" stroke=${g} strokeWidth="8" strokeDasharray="183.9 29.7" transform="rotate(-20 60 60)"/>
    <path d="M44 72 L56 58 L68 64 L92 30 M81 30 L92 30 L92 41" fill="none" stroke=${g} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    <g fill="var(--ink)"><circle cx="44" cy="72" r="5"/><circle cx="56" cy="58" r="5"/><circle cx="68" cy="64" r="5"/></g>
  </svg>`;
}
const Eyebrow = ({children}) => html`<p className="mono text-teal">${Array.isArray(children)?children.map(T):T(children)}</p>`;
const Head = ({eyebrow, title, sub}) => html`<div className="max-w-3xl">
  <${Eyebrow}>${eyebrow}<//>
  <h2 className="display font-bold text-ink mt-4 text-[clamp(1.55rem,3.3vw,2.5rem)]">${T(title)}</h2>
  ${sub && html`<p className="text-mute mt-4 text-lg max-w-2xl">${T(sub)}</p>`}</div>`;

/* ---------- Nav ---------- */
const LINKS = [['Solutions','/solutions'],['AISutra platform','/platform'],['How we work','/how'],['Company','/company']];
function Nav({route}){
  const [open,setOpen] = useState(false);
  const links = LINKS;
  return html`<header className="sticky z-50" style=${{top:'env(safe-area-inset-top, 0px)'}}>
    <div className="wrap pt-4">
      <nav className="glass flex items-center justify-between px-5 py-3" style=${{borderRadius:999}}>
        <${Logo}/>
        <div className="hidden lg:flex items-center gap-7 text-sm">${links.map(l=>html`<a key=${l[1]} className=${'navlink'+(route===l[1].slice(1)?' on':'')} aria-current=${route===l[1].slice(1)?'page':undefined} href=${l[1]}>${T(l[0])}</a>`)}</div>
        <div className="flex items-center gap-2">
          <a href="#contact" className="btn btn-primary text-sm nav-cta" style=${{padding:'.6rem 1.1rem'}}>Book a Discovery</a>
          <button id="nav-toggle" className="lg:hidden pill" aria-expanded=${open} onClick=${()=>setOpen(!open)}>${open?'Close':'Menu'}</button>
        </div>
      </nav>
      ${open && html`<div className="glass mt-2 p-4 flex flex-col gap-3 lg:hidden">${links.map(l=>html`<a key=${l[1]} href=${l[1]} className="text-ink py-1" onClick=${()=>setOpen(false)}>${T(l[0])}</a>`)}<a href="#contact" className="btn btn-primary justify-center" onClick=${()=>setOpen(false)}>Book a Discovery</a></div>`}
    </div></header>`;
}

/* ---------- Hero: outcome-led, with the department lift board ---------- */
const DRIVERS = [
 ['Optimised & relevant operating procedures','var(--gold)'],
 ['Integrated systems & process flow','var(--violet)'],
 ['AISutra platform','var(--pink)',true],
 ['Digital Transformation','var(--violet)'],
 ['Enriched databank','var(--teal)']
];
const LIFT = [
 ['Marketing','More qualified leads, less chasing',34,78],
 ['Sales','Faster quotes, higher win rate',40,88],
 ['Operations','On-time delivery, less rework',38,92],
 ['Finance','Shorter cash cycle, live P&L',42,84],
 ['Service','Higher uptime, repeat revenue',30,80],
 ['People','Skills that grow with the plan',36,76],
 ['Innovation & R&D','New designs out faster',28,72]
];
function Hero(){
  return html`<section id="top" className="wrap pt-14 pb-16 lg:pt-20">
    <div className="grid lg:grid-cols-[1.1fr_.9fr] gap-10 items-center">
      <div className="min-w-0">
        <p className="text-[1.02rem] text-ink font-semibold">${AS}<span className="text-mute font-medium">: ${TAGLINE}</span></p>
        <h1 className="display font-extrabold text-ink mt-5 text-[clamp(2.1rem,5.2vw,4.2rem)]">Your whole business, woven into <span className="grad-text">one growth engine.</span></h1>
        <p className="text-mute text-lg mt-6 max-w-xl">We start by understanding how your business runs today: processes, operating procedures, software and IT systems. Then we build a three-phase roadmap on the ${SA} platform: Stabilise, Build and Scale, and lift performance step by step through sharper SOPs, consolidated systems, integrated data and process flow, and automation where it pays most.</p>
        <div className="flex flex-wrap gap-3 mt-8">
          <a href="#contact" className="btn btn-primary">Book a Discovery <${Arrow}/></a>
          <a href="#roadmap" className="btn btn-ghost">See how we start</a>
        </div>
        <dl className="grid grid-cols-3 gap-3 mt-10 max-w-xl">
          ${[['3x–5x','productivity target'],['~90 days','to first results'],['12–24','months to full impact']].map(k=>html`<div key=${k[1]} className="glass p-4"><dt className="display font-bold text-xl sm:text-2xl grad-text">${k[0]}</dt><dd className="text-mute text-sm mt-1">${k[1]}</dd></div>`)}
        </dl>
      </div>
      <div className="glass glow-card p-6 sm:p-7 min-w-0">
        <div className="flex items-center justify-between gap-3"><p className="mono text-teal">Performance lift by department</p><span className="text-xs rounded-full border border-line px-2.5 py-0.5 text-mute">Illustrative</span></div>
        <div className="mt-3">${LIFT.map((d,i)=>html`<div key=${d[0]} className="py-2.5 border-b border-line last:border-0">
          <div className="flex items-baseline justify-between gap-3"><p className="text-ink font-bold">${d[0]}</p><p className="text-mute text-sm text-right">${d[1]}</p></div>
          <div className="liftbar mt-2"><i className="up" style=${{width:d[3]+'%',animationDelay:(i*.15)+'s'}}></i><i className="base" style=${{width:d[2]+'%'}}></i></div></div>`)}</div>
        <p className="text-mute text-xs mt-3">Grey: where most businesses run today. Colour: with ${SA} in place.</p>
        <div className="mt-4 rounded-2xl border border-line p-4" style=${{background:'var(--panel)'}}>
          <p className="mono text-mute">Driven by</p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
          ${DRIVERS.map((c,i)=>html`<span key=${c[0]} className=${'text-sm rounded-full border px-3 py-1 text-ink flex items-center gap-2'+(c[2]?' font-bold':'')} style=${{borderColor:c[2]?'var(--pink)':'var(--line)',boxShadow:c[2]?'0 0 22px -6px var(--pink)':'none'}}><i className="pulse inline-block w-2 h-2 rounded-full" style=${{background:c[1],animationDelay:(i*.3)+'s'}}></i><span>${T(c[0])}</span></span>`)}
          </div>
        </div>
      </div>
    </div>
  </section>`;
}
function Strip(){
  const items=['AISutra platform','Optimised SOPs','Consolidated software & IT','Integrated process flow','Enriched databank','Automation where it pays','Sales growth','Operational excellence','Financial control','Live management cockpit'];
  const row = items.concat(items);
  return html`<div className="relative z-[1] border-y border-line overflow-hidden py-4" aria-hidden="true"><div className="marquee">${row.map((t,i)=>html`<span key=${i} className="mono text-mute flex items-center gap-10">${T(t)}<span className="grad-text">◆</span></span>`)}</div></div>`;
}

/* ---------- Inner-page hero ---------- */
function PageHero({eyebrow,title,sub,children}){
  return html`<section className="wrap pt-14 pb-6 lg:pt-20">
    <${Eyebrow}>${eyebrow}<//>
    <h1 className="display font-extrabold text-ink mt-5 text-[clamp(2rem,4.6vw,3.6rem)] max-w-4xl">${title}</h1>
    ${sub && html`<p className="text-mute text-lg mt-6 max-w-2xl">${T(sub)}</p>`}
    ${children}
  </section>`;
}

/* ---------- Why growth stalls: disconnected today, woven together with AISutra ---------- */
const NODES = ['Vision','Plans','People','Processes','Systems','Data'];
const APART = [[86,44],[300,168],[430,58],[84,262],[248,322],[438,290]];
const WOVEN = [[260,52],[396,116],[396,244],[260,308],[124,244],[124,116]];
function Gaps(){
  const still = useMemo(()=>window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches,[]);
  const [woven,setWoven]=useState(false); const held=useRef(false);
  useEffect(()=>{ if(still) return; const t=setInterval(()=>{ if(!held.current) setWoven(w=>!w); },3600); return ()=>clearInterval(t); },[]);
  const pick=v=>{ held.current=true; setWoven(v); };
  const pos=woven?WOVEN:APART;
  return html`<section id="gaps" className="wrap py-20">
    <${Head} eyebrow="Why growth stalls" title="Most businesses don't lack effort. They lose it in the gaps." sub="Between the boardroom and the shop floor, between one system and the next, between what people know and what the business can see."/>
    <div className="grid lg:grid-cols-[1fr_1.05fr] gap-4 mt-10 items-stretch">
      <div className="glass glow-card p-5 sm:p-6 min-w-0 flex flex-col">
        <div className="flex gap-2" role="group" aria-label="Compare today with AISutra">
          <button className=${'pill '+(!woven?'on':'')} aria-pressed=${!woven} onClick=${()=>pick(false)}>Today</button>
          <button className=${'pill '+(woven?'on':'')} aria-pressed=${woven} onClick=${()=>pick(true)}>Woven with ${SA}</button>
        </div>
        <svg viewBox="0 0 520 360" className="w-full mt-4" role="img" aria-label=${woven?'Vision, plans, people, processes, systems and data connected through AISutra':'Vision, plans, people, processes, systems and data scattered and disconnected'}>
          <defs><linearGradient id="gg" x1="0" x2="1"><stop offset="0" stopColor="var(--gold)"/><stop offset=".5" stopColor="var(--pink)"/><stop offset="1" stopColor="var(--violet)"/></linearGradient></defs>
          <g className="fade" style=${{opacity:woven?1:0}}>
            ${WOVEN.map((p,i)=>html`<path key=${'r'+i} d=${'M260 180 L'+p[0]+' '+p[1]} stroke="var(--violet)" strokeWidth="2" className="flow" strokeOpacity=".75" fill="none"/>`)}
            <path d=${'M'+WOVEN.map(p=>p.join(' ')).join(' L')+' Z'} stroke="url(#gg)" strokeWidth="2" fill="none" strokeOpacity=".55"/>
            <circle cx="260" cy="180" r="44" fill="var(--bg2)" stroke="var(--pink)" strokeWidth="2"/>
            <text x="260" y="186" textAnchor="middle" fill="var(--pink)" style=${{font:'800 16px var(--body)'}}>AISutra</text>
          </g>
          ${NODES.map((n,i)=>html`<g key=${n} className="node" style=${{transform:'translate('+pos[i][0]+'px,'+pos[i][1]+'px)'}}>
            <rect x="-56" y="-20" width="112" height="40" rx="12" fill="var(--bg2)" stroke=${woven?'var(--teal)':'var(--line)'} strokeDasharray=${woven?'0':'5 5'}/>
            <text y="5" textAnchor="middle" fill=${woven?'var(--ink)':'var(--mute)'} style=${{font:'700 14px var(--body)'}}>${n}</text></g>`)}
        </svg>
        <p className="text-mute text-sm mt-auto pt-3">${woven?'One ecosystem: every part pulls toward the same vision.':'Disconnected: every part works hard, in a different direction.'}</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3 min-w-0">${GAPS.map((g,i)=>html`<div key=${g[0]} className="glass lift p-5 min-w-0">
        <p className="mono" style=${{color:i%2?'var(--pink)':'var(--gold)'}}>Gap ${String(i+1).padStart(2,'0')}</p>
        <h3 className="text-ink font-bold mt-2">${g[0]}</h3><p className="text-mute text-[.95rem] mt-1">${g[1]}</p></div>`)}</div>
    </div>
  </section>`;
}

/* ---------- Discovery first, then a three-horizon roadmap on AISutra ---------- */
function Roadmap(){
  return html`<section id="roadmap" className="wrap py-20">
    <${Head} eyebrow="How we start" title="First we understand how your business runs today." sub="Discovery reviews your as-is processes, operating procedures, software and IT systems, and consolidates it all into one roadmap on AISutra, in three phases: Stabilise, Build and Scale. Performance then rises gradually, one proven step at a time."/>
    <div className="grid lg:grid-cols-[.8fr_2.2fr] gap-4 mt-10">
      <div className="glass glow-card p-6 min-w-0" style=${{borderColor:'var(--teal)'}}>
        <p className="mono text-teal">Discovery reviews</p>
        <ul className="mt-4 flex flex-col gap-2.5 text-ink">${REVIEW.map(r=>html`<li key=${r} className="flex gap-2"><span className="shrink-0 mt-0.5"><${Check}/></span>${r}</li>`)}</ul>
        <div className="mt-6 pt-4 border-t border-line"><p className="price font-extrabold text-2xl grad-text">₹2.5 lakh</p><p className="text-mute text-sm">indicative, fixed scope</p></div>
      </div>
      <div className="grid md:grid-cols-3 gap-4 min-w-0">${HORIZONS.map((h,i)=>html`<article key=${h[0]} className="glass lift p-6 flex flex-col gap-3 min-w-0">
        <div className="flex items-center justify-between gap-2"><p className="mono text-mute">Phase ${i+1}</p><span className="text-xs rounded-full border border-line px-2.5 py-0.5 text-mute">${h[1]}</span></div>
        <h3 className="display font-extrabold text-3xl" style=${{color:h[4]}}>${h[0]}</h3>
        <p className="text-ink font-semibold -mt-1">${h[2]}</p>
        <ul className="flex flex-col gap-2 text-[.95rem] text-ink">${h[3].map(t=>html`<li key=${t} className="flex gap-2"><i className="inline-block w-1.5 h-1.5 rounded-full mt-2.5 shrink-0" style=${{background:h[4]}}></i><span>${T(t)}</span></li>`)}</ul>
      </article>`)}</div>
    </div>
    <div className="glass p-6 sm:p-7 mt-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2"><p className="display font-bold text-lg text-ink">Performance rises step by step</p><p className="text-mute text-sm">Each step builds on the one before, all on ${SA}.</p></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 items-end">${LEVERS.map((l,i)=>html`<div key=${l} className="flex flex-col gap-2 min-w-0">
        <div className="rounded-2xl" style=${{height:(48+i*30)+'px',background:'var(--grad)',opacity:.35+i*.2}}></div>
        <p className="text-ink font-semibold text-sm"><span className="mono text-mute block">Step ${i+1}</span>${l}</p></div>`)}</div>
    </div>
  </section>`;
}

/* ---------- The AISutra model: five layers on one thread ---------- */
function Model(){
  return html`<section id="model" className="wrap py-20">
    <${Head} eyebrow=${'The '+PLATFORM+' model'} title="One integrated business, aligned from vision to data." sub="We work through five layers, in this order. When all five pull in one direction, productivity multiplies instead of adding up."/>
    <div className="relative mt-10">
      <div className="thread hidden sm:block" aria-hidden="true"><i></i></div>
      <ol className="flex flex-col gap-3">${LAYERS.map((l,i)=>html`<li key=${l[0]} className="glass lift p-5 sm:pl-20 relative grid md:grid-cols-[.8fr_1.6fr_1.1fr] gap-x-6 gap-y-2 items-center min-w-0">
        <span className="hidden sm:flex absolute left-[14px] top-1/2 -translate-y-1/2 w-7 h-7 rounded-full items-center justify-center mono text-[.65rem] avatar" style=${{letterSpacing:0}}>${i+1}</span>
        <h3 className="display font-bold text-lg text-ink"><span className="sm:hidden mono text-teal mr-2">${String(i+1).padStart(2,'0')}</span>${l[0]}</h3>
        <p className="text-mute text-[.95rem]">${T(l[1])}</p>
        <p className="text-ink font-semibold text-[.95rem] md:border-l-2 md:pl-4" style=${{borderColor:'var(--teal)'}}>${l[2]}</p></li>`)}</ol>
    </div>
  </section>`;
}

/* ---------- The automation engine: signals in, three forces, outcomes out ---------- */
const SIGNALS = ['Leads & enquiries','Orders & drawings','Shop-floor events','Bills & payments','Service calls'];
const OUTS = [['Sales','Quotes out faster'],['Operations','Delivered on time'],['Finance','Cash visible daily'],['Service','Higher uptime'],['Leadership','One live cockpit']];
/* The four forces AISutra brings together: [name, colour, role, description, diagram lines] */
const FORCES = [
 ['Optimised SOPs','var(--gold)','The right way to work','Operating procedures reviewed, simplified and made relevant, so every team runs each process the same, better way.',['Optimised','SOPs']],
 ['Integrated systems & flow','var(--violet)','Everything connected','Consolidated software and IT infrastructure, with data and process flowing end to end, so nothing is typed twice.',['Integrated','systems & flow']],
 ['Enriched databank','var(--teal)','Smarter every day','Orders, drawings, costs, suppliers and service history, cleaned and linked. Every decision draws on the full picture.',['Enriched','databank']],
 ['AI agents & automation','var(--pink)','Work done for you','Agents read, draft, match and follow up where the roadmap prioritizes them. People approve what matters.',['AI agents &','automation']]
];
const SCENARIOS = [
 ['A new enquiry arrives',[['Agent','Enquiry agent reads the email and drawing and extracts the specs'],['Databank','Finds similar past jobs, live material costs and stock'],['AISutra','Quote follows the standard costing SOP, with margin shown'],['Person','Sales head approves on mobile'],['Outcome','Quote goes out the same day']]],
 ['An order is confirmed',[['AISutra','Advance receipt is matched to the sales order'],['Databank','Capacity, BOMs and open purchase orders are checked'],['Agent','Planning and MRP agents schedule the job and raise requisitions'],['Person','Planner approves the plan and the purchase orders'],['Outcome','A delivery date the factory can keep']]],
 ['A supplier bill lands',[['Agent','Invoice agent reads the bill'],['Databank','Matches it to the purchase order and goods receipt'],['AISutra','The entry posts to the books and payment is scheduled'],['Person','Finance approves the payment run'],['Outcome','Accurate payables, books always current']]],
 ['A customer reports a breakdown',[['Agent','Support agent logs the ticket from WhatsApp'],['Databank','Pulls the serial number, warranty and service history'],['AISutra','Service SOP assigns an engineer and reserves the spares'],['Person','Service head confirms the visit'],['Outcome','Faster fix, and failure data feeds quality']]]
];
const ACTOR = {Agent:'var(--gold)',Databank:'var(--teal)',AISutra:'var(--violet)',Person:'var(--ink)',Outcome:'var(--pink)'};
/* Hub-and-satellite layout: AISutra at the centre, four forces around it. All labels sit well inside their circles. */
const HUB = [550,250]; const SAT = [[480,110],[620,110],[620,390],[480,390]]; const SR = 64;
function EngineDiagram(){
  const still = useMemo(()=>window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches,[]);
  const cy = i => 90+i*80;
  const lp = i => 'M240 '+cy(i)+' C 330 '+cy(i)+', 380 250, 466 250';
  const rp = i => 'M634 250 C 720 250, 770 '+cy(i)+', 860 '+cy(i);
  const order=[0,1,3,2]; /* SOPs top-left, systems top-right, agents bottom-right, databank bottom-left */
  return html`<svg viewBox="0 0 1100 500" className="w-full hidden lg:block" role="img" aria-label="Signals from across the business flow into the AISutra platform, where optimised SOPs, integrated systems and flow, an enriched databank and AI agents work together, and come out as outcomes for each department">
    <defs>
      <linearGradient id="gl" x1="0" x2="1"><stop offset="0" stopColor="var(--gold)"/><stop offset="1" stopColor="var(--violet)"/></linearGradient>
      <linearGradient id="gr" x1="0" x2="1"><stop offset="0" stopColor="var(--violet)"/><stop offset="1" stopColor="var(--teal)"/></linearGradient>
      <linearGradient id="gb" x1="0" x2="1"><stop offset="0" stopColor="var(--gold)"/><stop offset=".5" stopColor="var(--pink)"/><stop offset="1" stopColor="var(--violet)"/></linearGradient>
    </defs>
    <text x="30" y="38" fill="var(--mute)" style=${{font:'600 12px var(--mono)',letterSpacing:'.14em'}}>SIGNALS IN</text>
    <text x="550" y="38" textAnchor="middle" fill="var(--mute)" style=${{font:'600 12px var(--mono)',letterSpacing:'.14em'}}>THE ENGINE</text>
    <text x="860" y="38" fill="var(--mute)" style=${{font:'600 12px var(--mono)',letterSpacing:'.14em'}}>OUTCOMES OUT</text>
    ${SIGNALS.map((t,i)=>html`<g key=${'s'+i}>
      <path d=${lp(i)} fill="none" stroke="url(#gl)" strokeWidth="2" className="flow" strokeOpacity=".75"/>
      ${!still && html`<circle r="4.5" fill="var(--gold)"><animateMotion dur=${(2.6+i*.35)+'s'} repeatCount="indefinite" path=${lp(i)}/></circle>`}
      <rect x="30" y=${cy(i)-25} width="210" height="50" rx="14" fill="var(--bg2)" stroke="var(--line)"/>
      <text x="48" y=${cy(i)+5} fill="var(--ink)" style=${{font:'700 15px var(--body)'}}>${t}</text></g>`)}
    ${OUTS.map((t,i)=>html`<g key=${'o'+i}>
      <path d=${rp(i)} fill="none" stroke="url(#gr)" strokeWidth="2" className="flow" strokeOpacity=".75"/>
      ${!still && html`<circle r="4.5" fill="var(--teal)"><animateMotion dur=${(2.8+i*.3)+'s'} repeatCount="indefinite" path=${rp(i)}/></circle>`}
      <rect x="860" y=${cy(i)-25} width="210" height="50" rx="14" fill="var(--bg2)" stroke="var(--line)"/>
      <text x="878" y=${cy(i)-3} fill="var(--ink)" style=${{font:'700 14px var(--body)'}}>${t[0]}</text>
      <text x="878" y=${cy(i)+15} fill="var(--mute)" style=${{font:'500 12.5px var(--body)'}}>${t[1]}</text></g>`)}
    ${order.map((fi,k)=>{ const f=FORCES[fi], c=SAT[k]; return html`<g key=${'f'+fi}>
      <line x1=${HUB[0]} y1=${HUB[1]} x2=${c[0]} y2=${c[1]} stroke=${f[1]} strokeWidth="2" strokeOpacity=".7" className="flow"/>
      <circle cx=${c[0]} cy=${c[1]} r=${SR} fill="var(--bg2)"/>
      <circle cx=${c[0]} cy=${c[1]} r=${SR} fill=${f[1]} fillOpacity=".16" stroke=${f[1]} strokeWidth="2"/>
      <text x=${c[0]} y=${c[1]-4} textAnchor="middle" fill="var(--ink)" style=${{font:'800 13px var(--body)'}}>${f[4][0]}</text>
      <text x=${c[0]} y=${c[1]+13} textAnchor="middle" fill="var(--ink)" style=${{font:'800 13px var(--body)'}}>${f[4][1]}</text></g>`; })}
    <g className="breathe hub-glow">
      <circle cx=${HUB[0]} cy=${HUB[1]} r="84" fill="var(--bg2)" stroke="url(#gb)" strokeWidth="3"/>
    </g>
    <text x=${HUB[0]} y=${HUB[1]-22} textAnchor="middle" fill="var(--mute)" style=${{font:'600 10px var(--mono)',letterSpacing:'.12em'}}>PLATFORM</text>
    <text x=${HUB[0]} y=${HUB[1]+9} textAnchor="middle" fill="url(#gb)" style=${{font:'800 30px var(--body)',letterSpacing:'-.02em'}}>AISutra</text>
    <text x=${HUB[0]} y=${HUB[1]+32} textAnchor="middle" fill="var(--mute)" style=${{font:'600 11px var(--body)'}}>Digital Transformation</text>
  </svg>`;
}
function Engine(){
  const [sc,setSc]=useState(0); const [step,setStep]=useState(0); const paused=useRef(false);
  useEffect(()=>{ if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; const t=setInterval(()=>{ if(!paused.current) setStep(s=>(s+1)%5); },2200); return ()=>clearInterval(t); },[]);
  const pick=i=>{ setSc(i); setStep(0); paused.current=false; };
  const steps=SCENARIOS[sc][1];
  return html`<section id="engine" className="wrap py-20">
    <${Head} eyebrow="The AISutra engine" title="One platform. Every process in sync." sub="Signals from every corner of the business flow into AISutra. Optimised SOPs set the right way to work, integrated systems carry it end to end, the enriched databank keeps it accurate, and AI agents automate where it pays most."/>
    <div className="glass glow-card p-4 sm:p-8 mt-10">
      <${EngineDiagram}/>
      <div className="lg:hidden flex flex-col items-center gap-3">
        <p className="mono text-mute">Signals in</p>
        <div className="flex flex-wrap justify-center gap-2">${SIGNALS.map(t=>html`<span key=${t} className="text-sm rounded-full border border-line px-3 py-1.5 text-ink">${t}</span>`)}</div>
        <div className="vflow"></div>
        <div className="w-full rounded-2xl border-2 p-5 text-center hub-glow" style=${{borderColor:'var(--pink)',background:'var(--bg2)'}}>
          <p className="mono text-mute">Platform</p>
          <p className="display font-extrabold text-3xl mt-1">${SA}</p>
          <p className="text-mute text-sm mt-1">Digital Transformation</p>
          <div className="grid grid-cols-2 gap-2 mt-4 text-left">${FORCES.map(f=>html`<div key=${f[0]} className="rounded-xl border p-3 min-w-0" style=${{borderColor:f[1],background:'var(--panel)'}}><p className="text-ink font-bold text-sm">${f[0]}</p><p className="text-mute text-xs mt-0.5">${f[2]}</p></div>`)}</div>
        </div>
        <div className="vflow"></div>
        <p className="mono text-mute">Outcomes out</p>
        <div className="flex flex-wrap justify-center gap-2">${OUTS.map(t=>html`<span key=${t[0]} className="text-sm rounded-full border border-line px-3 py-1.5 text-ink"><b>${t[0]}:</b> ${t[1]}</span>`)}</div>
      </div>
    </div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">${FORCES.map(f=>html`<div key=${f[0]} className="glass lift p-6 min-w-0">
      <div className="flex items-center gap-3"><i className="inline-block w-3 h-3 rounded-full shrink-0" style=${{background:f[1],boxShadow:'0 0 18px '+f[1]}}></i><p className="mono" style=${{color:f[1]}}>${f[2]}</p></div>
      <h3 className="display font-bold text-lg text-ink mt-3">${f[0]}</h3><p className="text-mute mt-2 text-[.95rem]">${f[3]}</p></div>`)}</div>
    <div className="glass p-5 sm:p-7 mt-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><p className="display font-bold text-lg text-ink">Watch ${SA} orchestrate</p><p className="text-mute text-sm">Pick a moment in the business and follow it through the engine.</p></div>
      <div className="flex gap-2 mt-4 overflow-x-auto pb-2">${SCENARIOS.map((s,i)=>html`<button key=${s[0]} className=${'pill '+(sc===i?'on':'')} onClick=${()=>pick(i)}>${s[0]}</button>`)}</div>
      <ol className="grid md:grid-cols-5 gap-3 mt-4">${steps.map((st,i)=>html`<li key=${sc+'-'+i}><button className=${'step w-full h-full text-left rounded-2xl border border-line p-4 '+(step===i?'live':'')} onClick=${()=>{ paused.current=true; setStep(i); }}>
        <span className="flex items-center gap-2"><i className="inline-block w-2.5 h-2.5 rounded-full" style=${{background:ACTOR[st[0]]}}></i><span className="mono" style=${{color:st[0]==='Person'?'var(--mute)':ACTOR[st[0]]}}>${i+1} · ${T(st[0])}</span></span>
        <span className="block text-ink mt-2 text-[.95rem] font-semibold">${st[1]}</span></button></li>`)}</ol>
    </div>
  </section>`;
}

/* ---------- Cycle explorer ---------- */
function Cycle({active,setActive}){
  const seg = SEGMENTS[active];
  return html`<section id="cycle" className="wrap py-20">
    <${Head} eyebrow="Your operating cycle" title="Every process, from as-is to business value." sub="Pick a segment to see how each step runs today, what we change with off-the-shelf AI agents and digital transformation, and the outcome it delivers."/>
    <div className="flex gap-2 mt-8 overflow-x-auto pb-2" role="tablist">${SEGMENTS.map((s,i)=>html`<button key=${s.id} role="tab" aria-selected=${active===i} className=${'pill '+(active===i?'on':'')} onClick=${()=>setActive(i,true)}>${s.n} ${s.name}</button>`)}</div>
    <div className="glass mt-5 overflow-hidden">
      <div className="p-6 border-b border-line flex flex-wrap items-end justify-between gap-3">
        <div><p className="display font-bold text-2xl text-ink">${seg.line}</p><p className="text-mute mt-1">${seg.outcome}</p></div>
        <span className="mono text-mute">${seg.rows.length} processes</span>
      </div>
      <div className="hidden md:grid grid-cols-[1.1fr_1.5fr_1.7fr_1.4fr] gap-5 px-6 py-3 border-b border-line mono text-mute"><span>Process</span><span>As-is today</span><span style=${{color:'var(--teal)'}}>What we change</span><span style=${{color:'var(--gold)'}}>Value delivered</span></div>
      ${seg.rows.map((r,i)=>html`<div key=${seg.id+i} className="rowx grid md:grid-cols-[1.1fr_1.5fr_1.7fr_1.4fr] gap-x-5 gap-y-2 px-6 py-4 border-b border-line last:border-0">
        <p className="font-semibold text-ink">${r[0]}</p>
        <p className="text-mute text-[.95rem]"><span className="md:hidden mono block mb-1">As-is</span>${r[1]}</p>
        <p className="text-ink text-[.95rem] md:border-l-2 md:pl-4" style=${{borderColor:'var(--teal)'}}><span className="md:hidden mono block mb-1" style=${{color:'var(--teal)'}}>What we change</span>${r[2]}</p>
        <p className="text-ink font-semibold text-[.95rem]"><span className="md:hidden mono block mb-1 font-normal" style=${{color:'var(--gold)'}}>Value</span>${r[3]}</p></div>`)}
    </div>
  </section>`;
}

/* ---------- Platform bento ---------- */
function Platform(){
  const roles=['MD','Sales','Planning','Stores','Production','Quality','Finance','Service'];
  const [role,setRole]=useState(0);
  const tiles=[['Approvals waiting','Quotes, POs and payments in one queue'],['Orders at risk','Late materials and bottlenecks flagged'],['Cash this week','Receipts due and payables scheduled'],['Agent activity','What the agents did, and what needs you']];
  const agents=['Lead','Enquiry intake','Quote engine','Planning','MRP','Procurement','Purchase invoice','Collections','Support','Ask-your-ERP'];
  return html`<section id="platform" className="wrap py-20">
    <${Head} eyebrow=${PLATFORM+" platform"} title="Your team works in one simple application. A proven ERP runs underneath." sub=${PLATFORM+" is the front door: a CRM, role-based homepages, simpler screens, AI agents and dashboards. ERPNext stays as the core engine for transactions and compliance, trimmed to what you need."}/>
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-10">
      <div className="glass lift p-6 md:col-span-4 min-w-0">
        <p className="mono" style=${{color:'var(--gold)'}}>Role-based homepage</p>
        <h3 className="display font-bold text-xl text-ink mt-2">One home per role, built around today's work.</h3>
        <div className="flex gap-2 mt-5 overflow-x-auto pb-1">${roles.map((r,i)=>html`<button key=${r} className=${'pill '+(role===i?'on':'')} onClick=${()=>setRole(i)}>${r}</button>`)}</div>
        <div className="grid sm:grid-cols-2 gap-3 mt-4">${tiles.map((t,i)=>html`<div key=${t[0]} className="rounded-2xl border border-line p-4" style=${{background:'var(--panel)'}}>
          <p className="text-ink font-semibold">${t[0]}</p><p className="text-mute text-sm mt-1">${t[1]}</p>
          <div className="bar mt-3"><i style=${{width:(38+((role*17+i*23)%55))+'%',background:i%2?'var(--gold)':'var(--teal)'}}></i></div></div>`)}</div>
        <p className="text-mute text-xs mt-3">Illustrative layout for the ${roles[role]} role.</p>
      </div>
      <div className="glass lift p-6 md:col-span-2 min-w-0">
        <p className="mono text-teal">AI agent layer</p>
        <h3 className="display font-bold text-xl text-ink mt-2">Agents act. People approve.</h3>
        <div className="flex flex-wrap gap-2 mt-4">${agents.map((a,i)=>html`<span key=${a} className="text-sm rounded-full border border-line px-3 py-1 text-ink flex items-center gap-2"><i className="pulse inline-block w-1.5 h-1.5 rounded-full" style=${{background:'var(--teal)',animationDelay:(i*.25)+'s'}}></i>${a}</span>`)}</div>
        <p className="text-mute text-sm mt-4">Prices, payments and dispatch always pass a human approval, and every agent action is logged.</p>
      </div>
      <div className="glass lift p-6 md:col-span-2 min-w-0"><p className="mono text-mute">Core engine</p><h3 className="display font-bold text-xl text-ink mt-2">ERPNext, trimmed</h3><p className="text-mute text-sm mt-2">Selling, buying, stock, manufacturing, quality, accounts and GST. Unused features are hidden, never forked, so upgrades stay clean.</p></div>
      <div className="glass lift p-6 md:col-span-2 min-w-0"><p className="mono text-mute">Knowledge layer</p><h3 className="display font-bold text-xl text-ink mt-2">AI grounded in your documents</h3><p className="text-mute text-sm mt-2">SOPs, drawings and records become searchable knowledge through retrieval and a knowledge graph.</p></div>
      <div className="glass lift p-6 md:col-span-2 min-w-0"><p className="mono text-mute">Integrations</p><h3 className="display font-bold text-xl text-ink mt-2">Connected to how you work</h3><div className="flex flex-wrap gap-2 mt-3">${['GST e-invoice','E-way bill','Bank feeds','WhatsApp','Email','Tally bridge'].map(t=>html`<span key=${t} className="text-sm rounded-full border border-line px-3 py-1 text-mute">${t}</span>`)}</div></div>
      <div className="glass lift p-6 md:col-span-3 min-w-0">
        <p className="mono" style=${{color:'var(--gold)'}}>Management cockpit</p><h3 className="display font-bold text-xl text-ink mt-2">Decide today, not at month-end.</h3>
        <svg viewBox="0 0 400 90" className="w-full mt-4" role="img" aria-label="Illustrative trend line"><path d="M0 70 L50 62 L100 66 L150 48 L200 52 L250 34 L300 30 L350 16 L400 10 L400 90 L0 90 Z" fill="var(--teal)" fillOpacity=".12"/><path d="M0 70 L50 62 L100 66 L150 48 L200 52 L250 34 L300 30 L350 16 L400 10" fill="none" stroke="var(--teal)" strokeWidth="2.5"/><circle cx="400" cy="10" r="4" fill="var(--gold)"/></svg>
        <p className="text-mute text-sm mt-2">Order book, capacity, delivery, cash, margin and service on one screen. Illustrative chart.</p>
      </div>
      <div className="glass lift p-6 md:col-span-3 min-w-0">
        <p className="mono text-teal">Niche technology, right-sized</p><h3 className="display font-bold text-xl text-ink mt-2">The lightest technology that delivers the outcome.</h3>
        <ul className="mt-4 grid sm:grid-cols-2 gap-2 text-sm text-ink">${['No-code / low-code platforms','Right-sized AI models','Knowledge graphs & RAG','Agentic automation','Open-source ERP core','India-hosted client sites'].map(t=>html`<li key=${t} className="flex items-center gap-2"><${Check}/>${t}</li>`)}</ul>
      </div>
    </div>
  </section>`;
}

/* ---------- Catalogue (CMS-backed) ---------- */
function Catalogue({products, dbState, openProduct}){
  const [cat,setCat]=useState('All'); const [seg,setSeg]=useState('All'); const [q,setQ]=useState('');
  const list = useMemo(()=>products.filter(p=>(cat==='All'||p.category===cat)&&(seg==='All'||p.segment===seg)&&(!q||((p.name||'')+' '+(p.summary||'')).toLowerCase().includes(q.toLowerCase()))),[products,cat,seg,q]);
  return html`<section id="catalogue" className="wrap py-20">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <${Head} eyebrow="Product catalogue" title="Off-the-shelf products, configured to your cycle." sub="Agents, apps, dashboards and services you can deploy one at a time or as a full platform."/>
    </div>
    <div className="glass p-4 mt-8 flex flex-col gap-3">
      <div className="flex flex-wrap gap-2 items-center">
        <input id="cat-search" className="field" style=${{maxWidth:320}} placeholder="Search products" value=${q} onChange=${e=>setQ(e.target.value)} aria-label="Search products"/>
        <select id="cat-seg" className="field" style=${{maxWidth:220}} value=${seg} onChange=${e=>setSeg(e.target.value)} aria-label="Filter by segment"><option value="All">All segments</option>${SEGS.map(s=>html`<option key=${s} value=${s}>${s}</option>`)}</select>
        <span className="mono text-mute ml-auto">${list.length} of ${products.length}</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">${CATS.map(c=>html`<button key=${c} className=${'pill '+(cat===c?'on':'')} onClick=${()=>setCat(c)}>${c}</button>`)}</div>
    </div>
    ${products.length===0 ? html`<div className="glass p-10 mt-5 text-center">
        <p className="display font-bold text-xl text-ink">${dbState==='loading'?'Loading the catalogue…':'The catalogue is empty right now.'}</p>
        <p className="text-mute mt-2 max-w-lg mx-auto">${dbState==='none'?'The catalogue could not be loaded. Please refresh the page, or ask us for the product list.':'Products will appear here shortly.'}</p></div>`
    : list.length===0 ? html`<div className="glass p-10 mt-5 text-center"><p className="text-ink font-semibold">No products match these filters.</p><button className="pill mt-4" onClick=${()=>{setCat('All');setSeg('All');setQ('');}}>Clear filters</button></div>`
    : html`<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">${list.map(p=>html`<button key=${p.id} className="glass lift p-6 text-left flex flex-col gap-3 min-w-0" onClick=${()=>openProduct(p)}>
        <div className="flex items-center justify-between gap-2"><span className="mono" style=${{color:p.category==='AI agent'?'var(--teal)':'var(--gold)'}}>${p.category}</span><span className="text-xs rounded-full border border-line px-2.5 py-0.5 text-mute">${p.status}</span></div>
        <h3 className="display font-bold text-xl text-ink">${p.name}</h3>
        <p className="text-mute text-[.95rem]">${p.summary}</p>
        <div className="mt-auto pt-2 flex items-center justify-between text-sm"><span className="text-mute">${p.segment}</span><span className="text-teal font-semibold inline-flex items-center gap-1">Details <${Arrow}/></span></div></button>`)}</div>`}
  </section>`;
}
function ProductModal({p, close, enquire}){
  useEffect(()=>{ const k=e=>{ if(e.key==='Escape') close(); }; window.addEventListener('keydown',k); return ()=>window.removeEventListener('keydown',k); },[]);
  return html`<div className="scrim flex items-end sm:items-center justify-center p-4" onClick=${close}>
    <div className="sheet w-full max-w-xl p-7 max-h-[88vh] overflow-y-auto" role="dialog" aria-modal="true" aria-label=${p.name} onClick=${e=>e.stopPropagation()}>
      <div className="flex items-start justify-between gap-4"><div><p className="mono" style=${{color:'var(--gold)'}}>${p.category} · ${p.segment}</p><h3 className="display font-bold text-3xl text-ink mt-2">${p.name}</h3></div><button className="pill" onClick=${close}>Close</button></div>
      <p className="text-mute mt-4">${p.summary}</p>
      ${(p.outcomes||[]).length>0 && html`<div className="mt-5"><p className="mono text-teal">Business outcomes</p><ul className="mt-3 flex flex-col gap-2">${p.outcomes.map((o,i)=>html`<li key=${i} className="flex gap-2 text-ink"><span className="shrink-0 mt-0.5"><${Check}/></span>${o}</li>`)}</ul></div>`}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-7"><span className="text-sm rounded-full border border-line px-3 py-1 text-mute">Status: ${p.status}</span><button className="btn btn-primary" onClick=${()=>enquire(p)}>Enquire about this <${Arrow}/></button></div>
    </div></div>`;
}

/* ---------- Process, value calculator, why, FAQ ---------- */
const More = ({href,children}) => html`<a href=${href} className="text-teal font-semibold inline-flex items-center gap-1.5 hover:gap-2.5 transition-all">${children} <${Arrow}/></a>`;

/* ---------- Results by department ---------- */
function Departments({full}){
  return html`<section id="departments" className="wrap py-20">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <${Head} eyebrow="Results by department" title="Every department performs higher. Together." sub=${full?'What changes in each department, and the measures we commit to move against your Discovery baseline.':'Eight departments on one AISutra platform. Each gets improved SOPs, its own screens and measures, and automation where it pays, all pulling toward the same plan.'}/>
      ${!full && html`<${More} href="/solutions">See every department and process<//>`}
    </div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">${DEPTS.map(d=>html`<article key=${d[0]} className="glass lift p-6 flex flex-col gap-3 min-w-0">
      <div className="flex items-center gap-2"><i className="inline-block w-2.5 h-2.5 rounded-full" style=${{background:d[1],boxShadow:'0 0 14px '+d[1]}}></i><p className="mono" style=${{color:d[1]}}>${d[0]}</p></div>
      <h3 className="display font-bold text-lg text-ink">${d[2]}</h3>
      ${full && html`<ul className="flex flex-col gap-2 text-[.93rem] text-ink">${d[3].map(t=>html`<li key=${t} className="flex gap-2"><span className="shrink-0 mt-0.5"><${Check}/></span>${t}</li>`)}</ul>`}
      <div className="mt-auto pt-3 border-t border-line"><p className="mono text-mute mb-2">Measures we move</p><div className="flex flex-wrap gap-1.5">${d[4].map(k=>html`<span key=${k} className="text-xs rounded-full border border-line px-2.5 py-1 text-ink">${k}</span>`)}</div></div>
    </article>`)}</div>
  </section>`;
}

/* ---------- What we offer ---------- */
function Offer(){
  return html`<section id="offer" className="wrap py-20">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <${Head} eyebrow="What we offer" title="Four ways in. One accountable partner." sub="Start with Discovery, then add only what your roadmap justifies."/>
      <${More} href="/how">How engagements work<//>
    </div>
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">${OFFER.map((o,i)=>html`<article key=${o[0]} className=${'glass lift p-6 flex flex-col gap-3 min-w-0'+(i===0?' glow-card':'')} style=${i===0?{borderColor:'var(--pink)'}:null}>
      <p className="display font-extrabold text-3xl grad-text">${String(i+1).padStart(2,'0')}</p>
      <h3 className="display font-bold text-lg text-ink">${o[0]}</h3><p className="text-mute text-[.95rem]">${T(o[1])}</p>
      <p className=${'mt-auto pt-3 border-t border-line font-semibold '+(i===0?'text-ink':'text-mute')}>${o[2]}</p></article>`)}</div>
  </section>`;
}

/* ---------- Platform teaser for the home page ---------- */
function PlatformTeaser({products, openProduct}){
  const top=products.slice(0,3);
  return html`<section id="platform-teaser" className="wrap py-20">
    <div className="glass glow-card p-6 sm:p-10 grid lg:grid-cols-[1fr_1.1fr] gap-8 items-center">
      <div className="min-w-0">
        <${Eyebrow}>The ${SA} platform<//>
        <h2 className="display font-bold text-ink mt-4 text-[clamp(1.55rem,3.3vw,2.4rem)]">One simple application for every role. A proven ERP underneath.</h2>
        <p className="text-mute mt-4">${SA} brings a CRM, role-based homepages, simpler screens, AI agents and live dashboards together, on an ERPNext core trimmed to what you need.</p>
        <div className="flex flex-wrap gap-2 mt-5">${['Role-based homepages','AI agent layer','Enriched databank','ERPNext core','Management cockpit','WhatsApp & GST integrations'].map(t=>html`<span key=${t} className="text-sm rounded-full border border-line px-3 py-1 text-ink">${t}</span>`)}</div>
        <div className="mt-7"><a href="/platform" className="btn btn-primary">Explore ${SA} and the catalogue <${Arrow}/></a></div>
      </div>
      <div className="flex flex-col gap-3 min-w-0">
        <p className="mono text-mute">From the catalogue</p>
        ${top.length===0 ? html`<div className="rounded-2xl border border-dashed border-line p-6 text-mute">Products appear here from the catalogue.</div>`
        : top.map(p=>html`<button key=${p.id} className="rounded-2xl border border-line p-5 text-left lift min-w-0" style=${{background:'var(--panel)'}} onClick=${()=>openProduct(p)}>
          <div className="flex items-center justify-between gap-2"><span className="mono" style=${{color:p.category==='AI agent'?'var(--teal)':'var(--gold)'}}>${p.category}</span><span className="text-xs rounded-full border border-line px-2.5 py-0.5 text-mute">${p.status}</span></div>
          <p className="text-ink font-bold mt-2">${p.name}</p><p className="text-mute text-sm mt-1">${p.summary}</p></button>`)}
      </div>
    </div>
  </section>`;
}

/* ---------- The WEAVE method ---------- */
function Weave({full}){
  return html`<section id="method" className="wrap py-20">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-3xl">
        <${Head} eyebrow=${'The '+METHOD+' method'} title="Five stages, from the truth to compounding results." sub="Witness, Envision, Assemble, Vitalise, Evolve. Each stage ends with a visible result, so you decide every next step on evidence."/>
        <p className="text-mute mt-3 text-[.98rem]">In Sanskrit, the same five stages spell <b style=${{color:'var(--violet)'}}>Sutra</b>, the thread: <span style=${{color:'var(--violet)'}}>Samiksha · Upaya · Tantra · Rachana · Abhyudaya</span>.</p>
      </div>
      ${!full && html`<${More} href="/how">The method in detail<//>`}
    </div>
    <ol className="grid sm:grid-cols-2 md:grid-cols-5 gap-3 mt-10">${WEAVE.map((w,i)=>{ const k=SANS[i]; return html`<li key=${i} className="glass lift p-5 flex flex-col gap-2 min-w-0">
      <span className="display font-extrabold text-5xl leading-none" style=${{color:'var(--gold)'}} aria-hidden="true">${w[0]}</span>
      <h3 className="display font-bold text-lg mt-2" style=${{color:'var(--gold)'}}>${w[1]}</h3>
      <p className="mono text-mute" style=${{fontSize:'.66rem'}}>${w[2]}</p>
      ${full && html`<p className="text-mute text-[.93rem]">${T(w[3])}</p><p className="text-ink text-[.93rem]"><span className="mono block text-mute mb-1">Deliverable</span>${T(w[4])}</p>`}
      <p className="mt-auto pt-3 border-t border-line text-ink font-semibold text-[.93rem]">${w[5]}</p>
      <div className="mt-3 pt-4 border-t-2" style=${{borderColor:'var(--violet)'}}>
        <span className="display font-extrabold text-5xl leading-none block" style=${{color:'var(--violet)'}} aria-hidden="true">${k[0]}</span>
        <p className="display font-bold text-lg mt-2" style=${{color:'var(--violet)'}} lang="sa">${k[2]}</p>
        <p className="text-mute text-xs mt-1">${k[3]}</p>
      </div></li>`; })}</ol>
    <div className="grid md:grid-cols-5 gap-3 mt-3" aria-hidden="true">
      <div className="md:col-span-2 rounded-full border border-line px-4 py-2 text-center text-sm text-ink" style=${{background:'var(--panel)'}}>Discovery · ₹2.5 lakh indicative</div>
      <div className="md:col-span-3 rounded-full border border-line px-4 py-2 text-center text-sm text-mute">Build, run and grow · priced after Discovery</div>
    </div>
  </section>`;
}

/* ---------- Proof: Proman as client zero ---------- */
function Proof(){
  return html`<section id="proof" className="wrap py-20">
    <${Head} eyebrow="Proof" title="Built and running in our own factory first." sub="Before we offer anything to a client, we build it and run it at Proman Group, a multi-division industrial equipment manufacturer. Proman is our client zero."/>
    <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4 mt-10">
      <article className="glass glow-card p-6 sm:p-8 min-w-0" style=${{borderColor:'var(--violet)'}}>
        <div className="flex flex-wrap items-center justify-between gap-3"><p className="display font-bold text-2xl text-ink">Proman Group</p><span className="mono rounded-full border px-3 py-1" style=${{borderColor:'var(--pink)',color:'var(--pink)'}}>Client zero</span></div>
        <p className="text-mute mt-2">Crushing, screening and mineral-processing equipment · Bengaluru</p>
        <p className="mono text-teal mt-6">Running today</p>
        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mt-3 text-ink text-[.95rem]">${PROMAN.map(t=>html`<li key=${t} className="flex gap-2"><span className="shrink-0 mt-0.5"><${Check}/></span>${t}</li>`)}</ul>
        <div className="grid grid-cols-3 gap-3 mt-6">${['[Result 1]','[Result 2]','[Result 3]'].map(r=>html`<div key=${r} className="rounded-2xl border border-dashed border-line p-4"><p className="display font-bold text-lg text-mute">${r}</p><p className="text-mute text-xs mt-1">[measure]</p></div>`)}</div>
      </article>
      <div className="flex flex-col gap-4 min-w-0">
        ${[1,2].map(n=>html`<div key=${n} className="glass p-6"><p className="display font-bold text-lg text-mute">[Client name]</p><p className="text-mute text-sm mt-2">[One line on the engagement and its result]</p></div>`)}
        <a href="#contact" className="glass lift p-6 flex-1 flex flex-col justify-center" style=${{borderColor:'var(--teal)'}}><p className="mono text-teal">Early-client programme</p><p className="display font-bold text-lg text-ink mt-2">Your company could be next.</p><p className="text-mute text-sm mt-2">We are welcoming a few early manufacturers, with the founders closely involved in delivery.</p><span className="text-teal font-semibold inline-flex items-center gap-1.5 mt-3">Talk to us <${Arrow}/></span></a>
      </div>
    </div>
  </section>`;
}

/* ---------- Leadership teaser ---------- */
function Leaders(){
  return html`<section id="leaders" className="wrap py-20">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <${Head} eyebrow="Leadership" title="Shop-floor depth meets enterprise AI." sub="55+ years between two founders: one who has run factories, one who has built enterprise technology and AI."/>
      <${More} href="/company">Meet the founders<//>
    </div>
    <div className="grid md:grid-cols-2 gap-4 mt-10">${FOUNDERS.map(f=>html`<a key=${f.name} href="/company" className="glass lift p-6 flex items-center gap-5 min-w-0">
      <div className="avatar w-14 h-14 rounded-2xl flex items-center justify-center display font-extrabold text-xl shrink-0">${f.ini}</div>
      <div className="min-w-0"><p className="display font-bold text-lg text-ink">${f.name}</p><p className="mono text-teal mt-1">${f.role}</p><p className="text-mute text-sm mt-2"><b className="text-ink">${f.years}</b> ${f.unit}</p></div></a>`)}</div>
  </section>`;
}

/* ---------- Trust and ownership ---------- */
function Trust(){
  return html`<section id="trust" className="wrap py-20">
    <${Head} eyebrow="Trust & ownership" title="Your business, your data, your control." sub="AI only helps if you can trust it. These are the rules every engagement runs on."/>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">${TRUST.map((t,i)=>html`<div key=${t[0]} className="glass lift p-6 min-w-0">
      <div className="flex items-center gap-3"><${Check}/><h3 className="text-ink font-bold">${t[0]}</h3></div><p className="text-mute text-[.95rem] mt-2">${T(t[1])}</p></div>`)}</div>
  </section>`;
}

/* ---------- Ways to engage and pricing ---------- */
function Engage(){
  return html`<section id="engage" className="wrap py-20">
    <${Head} eyebrow="Ways to engage" title="Start with a clear price. Commit to the rest on evidence." sub="Discovery has an indicative fixed fee. Everything after it is scoped to your specific needs, from the roadmap Discovery produces."/>
    <div className="grid lg:grid-cols-3 gap-4 mt-10">${ENGAGE.map((e,i)=>html`<article key=${e[0]} className=${'glass p-7 flex flex-col gap-4 min-w-0'+(e[4]?' glow-card':'')} style=${e[4]?{borderColor:'var(--pink)'}:null}>
      <div className="flex items-center justify-between gap-2"><p className="mono" style=${{color:e[4]?'var(--pink)':'var(--mute)'}}>Step ${i+1}</p>${e[4] && html`<span className="text-xs rounded-full px-2.5 py-0.5 font-bold" style=${{background:'var(--grad)',color:'var(--on)'}}>Start here</span>`}</div>
      <h3 className="display font-bold text-2xl text-ink">${e[0]}</h3>
      <div><p className=${'price font-extrabold text-4xl '+(e[4]?'grad-text':'text-ink')}>${e[1]}</p><p className="text-mute text-sm mt-1">${e[2]}</p></div>
      <ul className="flex flex-col gap-2 text-[.95rem] text-ink border-t border-line pt-4">${e[3].map(t=>html`<li key=${t} className="flex gap-2"><span className="shrink-0 mt-0.5"><${Check}/></span><span>${T(t)}</span></li>`)}</ul>
      ${e[4] && html`<a href="#contact" className="btn btn-primary justify-center mt-auto">Book a Discovery <${Arrow}/></a>`}
    </article>`)}</div>
    <p className="text-mute text-sm mt-4">Indicative fee, excluding taxes. The final Discovery scope is confirmed in a short call before we start.</p>
  </section>`;
}
function Value(){
  const [team,setTeam]=useState(40); const [growth,setGrowth]=useState(3); const [prod,setProd]=useState(3);
  const trad=Math.round(team*growth), ours=Math.max(team,Math.ceil(team*growth/prod)), saved=trad-ours;
  return html`<section id="value" className="wrap py-20">
    <${Head} eyebrow="The value math" title="What could a productivity multiple mean for you?" sub="Move the sliders to model your own back office. This is an illustrative scenario, not a forecast; your real numbers come from the Discovery baseline."/>
    <div className="grid lg:grid-cols-2 gap-4 mt-10">
      <div className="glass p-7 flex flex-col gap-6 min-w-0">
        <label htmlFor="v-team" className="block"><span className="flex justify-between text-ink font-semibold"><span>Back-office and operations support team today</span><span className="font-mono">${team}</span></span><input id="v-team" type="range" min="5" max="200" step="5" value=${team} onChange=${e=>setTeam(+e.target.value)} className="mt-3"/></label>
        <label htmlFor="v-growth" className="block"><span className="flex justify-between text-ink font-semibold"><span>Revenue growth you are aiming for</span><span className="font-mono">${growth}x</span></span><input id="v-growth" type="range" min="1.5" max="5" step="0.5" value=${growth} onChange=${e=>setGrowth(+e.target.value)} className="mt-3"/></label>
        <label htmlFor="v-prod" className="block"><span className="flex justify-between text-ink font-semibold"><span>Productivity multiple achieved</span><span className="font-mono">${prod}x</span></span><input id="v-prod" type="range" min="1.5" max="5" step="0.5" value=${prod} onChange=${e=>setProd(+e.target.value)} className="mt-3"/></label>
      </div>
      <div className="glass p-7 min-w-0">
        <p className="mono text-mute">Team needed at ${growth}x revenue</p>
        <div className="mt-5"><div className="flex justify-between text-sm text-mute"><span>Traditional: team grows with revenue</span><span className="font-mono text-ink">${trad} people</span></div><div className="bar mt-2" style=${{height:14}}><i style=${{width:'100%',background:'var(--mute)'}}></i></div></div>
        <div className="mt-5"><div className="flex justify-between text-sm text-mute"><span>AI-operated, at ${prod}x productivity</span><span className="font-mono text-ink">${ours} people</span></div><div className="bar mt-2" style=${{height:14}}><i style=${{width:Math.max(4,ours/trad*100)+'%',background:'var(--gold)'}}></i></div></div>
        <div className="mt-8 pt-6 border-t border-line flex flex-wrap items-baseline gap-x-4 gap-y-1"><span className="display font-extrabold text-5xl text-teal">${saved}</span><span className="text-ink">roles of capacity you would not need to hire</span></div>
        <p className="text-mute text-sm mt-3">Assumes the team would otherwise grow in line with revenue and that you keep your current team.</p>
      </div>
    </div>
  </section>`;
}
const FOUNDERS = [
 { ini:'P', name:'Prashant [Surname]', role:'Co-founder · Technology & Delivery', years:'20+', unit:'years in enterprise technology',
   bio:'Two decades delivering enterprise technology, including four years as COO of Cognizer leading AI research and operations, and earlier roles at Accenture, Sonata Software and NIIT Technologies. Today he leads AI-led transformation across the Proman group, from process standardization to ERP and AI automation.',
   tags:['Enterprise AI & GenAI products','ERP implementation','Digital transformation','IT delivery at scale'] },
 { ini:'R', name:'R S Raghavan', role:'Co-founder · Industry & Governance', years:'35', unit:'years in industrial operations',
   bio:'Managing Director of the Proman group, a manufacturer of crushing, screening and mineral-processing equipment near Bengaluru. He brings the operator\'s view of what a factory really needs, and a deep network across Indian manufacturing.',
   tags:['Manufacturing operations','Industrial equipment','Plant and P&L leadership','Supplier and customer networks'] }
];
function Company(){
  return html`<section id="company" className="wrap py-20">
    <${Head} eyebrow="Leadership" title="Built by people who have run factories and built AI." sub="Our founders bring the two things this work needs most: decades on the shop floor, and decades building enterprise technology and AI."/>
    <div className="grid lg:grid-cols-2 gap-4 mt-10">${FOUNDERS.map(f=>html`<article key=${f.name} className="glass lift p-7 min-w-0 flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="avatar w-16 h-16 rounded-2xl flex items-center justify-center display font-extrabold text-2xl shrink-0">${f.ini}</div>
        <div className="min-w-0"><h3 className="display font-bold text-xl text-ink">${f.name}</h3><p className="mono text-teal mt-1">${f.role}</p></div>
      </div>
      <p className="flex items-baseline gap-3"><span className="display font-extrabold text-4xl grad-text">${f.years}</span><span className="text-mute">${f.unit}</span></p>
      <p className="text-mute">${f.bio}</p>
      <div className="flex flex-wrap gap-2 mt-auto">${f.tags.map(t=>html`<span key=${t} className="text-sm rounded-full border border-line px-3 py-1 text-ink">${t}</span>`)}</div>
    </article>`)}</div>
    <div className="grid sm:grid-cols-3 gap-4 mt-4">
      ${[['55+','years of combined experience'],['2','worlds joined: shop floor and software'],['1','accountable team, from Discovery to ownership']].map(k=>html`<div key=${k[1]} className="glass p-6"><p className="display font-extrabold text-3xl grad-text">${k[0]}</p><p className="text-mute mt-1">${k[1]}</p></div>`)}
    </div>
    <div className="grid sm:grid-cols-2 gap-4 mt-4">${WHY.slice(2).map(w=>html`<div key=${w[0]} className="glass lift p-6"><h3 className="display font-bold text-lg text-ink">${w[0]}</h3><p className="text-mute mt-2">${w[1]}</p></div>`)}</div>
  </section>`;
}
function Faq(){
  const [open,setOpen]=useState(0);
  return html`<section id="faq" className="wrap py-20">
    <${Head} eyebrow="Questions" title="What manufacturers ask us first."/>
    <div className="mt-8 flex flex-col gap-3 max-w-3xl">${FAQ.map((f,i)=>html`<div key=${i} className="glass overflow-hidden">
      <button className="w-full flex items-center justify-between gap-4 text-left p-5" aria-expanded=${open===i} onClick=${()=>setOpen(open===i?-1:i)}><span className="text-ink font-semibold">${f[0]}</span><span className="display text-2xl" style=${{color:'var(--gold)',transition:'transform .3s',transform:open===i?'rotate(45deg)':'none'}}>+</span></button>
      ${open===i && html`<p className="text-mute px-5 pb-5 -mt-1">${T(f[1])}</p>`}</div>`)}</div>
  </section>`;
}

/* ---------- Contact: posts to /api/enquiry.php (email + optional ERPNext Lead) ---------- */
function Contact({interest, setInterest, products, site}){
  site=site||{};
  const blank={name:'',company:'',email:'',phone:'',message:'',website:'',consent:false};
  const [f,setF]=useState(blank); const [state,setState]=useState('idle');
  const set=k=>e=>setF({...f,[k]:e.target.type==='checkbox'?e.target.checked:e.target.value});
  async function submit(e){
    e.preventDefault(); if(state==='saving') return;
    setState('saving');
    try{
      const r=await fetch('/api/enquiry.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...f,interest,page:location.pathname})});
      const j=await r.json().catch(()=>({}));
      if(r.ok&&j.ok){ setState('sent'); setF(blank); } else setState(j.error==='rate'?'rate':'error');
    }catch(err){ setState('error'); }
  }
  const msg={sent:'Thank you. Your enquiry has reached our team, and we will get back to you shortly.',rate:'You have sent several enquiries in a short time. Please try again later, or email us directly.',error:'Your enquiry could not be sent just now. Please try again in a moment, or email us directly.'}[state];
  return html`<section id="contact" className="wrap py-20">
    <div className="glass p-6 sm:p-10 grid lg:grid-cols-[.9fr_1.1fr] gap-10">
      <div className="min-w-0">
        <${Eyebrow}>Start with Discovery<//>
        <h2 className="display font-extrabold text-ink mt-4 text-[clamp(2rem,4.4vw,3.4rem)]">Let's find <span className="grad-text">your 3x.</span></h2>
        <p className="text-mute mt-4 max-w-md">Tell us where your business slows down. We will set up an executive conversation and confirm the scope of a fixed-fee Discovery.</p>
        <dl className="mt-8 flex flex-col gap-3 text-ink">
          ${site.email && html`<div><dt className="mono text-mute">Email</dt><dd>${/@/.test(site.email)&&!/\[/.test(site.email)?html`<a className="text-ink hover:text-teal" href=${'mailto:'+site.email}>${site.email}</a>`:site.email}</dd></div>`}
          ${site.phone && html`<div><dt className="mono text-mute">Phone</dt><dd>${/\d{6}/.test(site.phone.replace(/\D/g,''))?html`<a className="text-ink hover:text-teal" href=${'tel:'+site.phone.replace(/[^\d+]/g,'')}>${site.phone}</a>`:site.phone}</dd></div>`}
          ${site.whatsapp_number && html`<div><dt className="mono text-mute">WhatsApp</dt><dd><a className="text-teal font-semibold" href=${'https://wa.me/'+site.whatsapp_number.replace(/\D/g,'')} target="_blank" rel="noopener">Chat with us on WhatsApp</a></dd></div>`}
          ${site.office && html`<div><dt className="mono text-mute">Office</dt><dd>${site.office}</dd></div>`}
        </dl>
      </div>
      <form className="grid sm:grid-cols-2 gap-3 min-w-0" onSubmit=${submit}>
        <input id="c-name" className="field" placeholder="Your name" required value=${f.name} onChange=${set('name')} aria-label="Your name"/>
        <input id="c-company" className="field" placeholder="Company" required value=${f.company} onChange=${set('company')} aria-label="Company"/>
        <input id="c-email" type="email" className="field" placeholder="Work email" required value=${f.email} onChange=${set('email')} aria-label="Work email"/>
        <input id="c-phone" className="field" placeholder="Phone" value=${f.phone} onChange=${set('phone')} aria-label="Phone"/>
        <select id="c-interest" className="field sm:col-span-2" value=${interest} onChange=${e=>setInterest(e.target.value)} aria-label="I am interested in">
          <option value="Discovery">Discovery (₹2.5 lakh indicative): review my whole business</option>
          ${products.map(p=>html`<option key=${p.id} value=${p.name}>${p.name}</option>`)}
          <option value="Something else">Something else</option></select>
        <textarea id="c-message" className="field sm:col-span-2" rows="4" placeholder="Where does your business slow down today?" value=${f.message} onChange=${set('message')} aria-label="Message"></textarea>
        <div className="hp" aria-hidden="true"><label>Website<input tabIndex="-1" autoComplete="off" value=${f.website} onChange=${set('website')}/></label></div>
        <label className="sm:col-span-2 flex items-start gap-3 text-sm text-mute"><input id="c-consent" type="checkbox" required checked=${f.consent} onChange=${set('consent')} className="mt-1"/><span>I agree that AI Sutra may use these details to respond to my enquiry, as described in the <a href="/privacy" className="text-teal underline">privacy policy</a>.</span></label>
        <div className="sm:col-span-2 flex flex-wrap items-center gap-4"><button id="c-send" type="submit" className="btn btn-primary">${state==='saving'?'Sending…':'Send enquiry'} <${Arrow}/></button>${msg && html`<p className=${state==='sent'?'text-teal':'text-mute'} role="status">${msg}</p>`}</div>
      </form>
    </div>
  </section>`;
}
function Footer(){
  return html`<footer className="wrap pb-12 pt-4"><div className="border-t border-line pt-8 grid md:grid-cols-[1.2fr_1fr_auto] gap-6 items-start">
    <div><${Logo}/><p className="text-ink text-sm mt-3 max-w-sm font-semibold">${TAGLINE}</p><p className="text-mute text-sm mt-1 max-w-sm">Digital Transformation and AI that make every department of a manufacturing business work as one. Powered by ${SATM}.</p><p className="text-mute text-xs mt-2">AI Sutra™ and AISutra™ are trademarks of [Company legal name].</p></div>
    <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-label="Footer">${[['Home','/']].concat(LINKS).concat([['Contact','#contact'],['Privacy','/privacy']]).map(l=>html`<a key=${l[1]} href=${l[1]} className="navlink">${T(l[0])}</a>`)}</nav>
    <p className="text-mute text-sm">© 2026 ${AS}</p></div></footer>`;
}

/* ---------- App ---------- */
const META = {
  '/': ['AI Sutra | The Neural Fabric for Industrial Excellence','AI Sutra helps manufacturing businesses lift performance across every department, starting with a Discovery of how the business runs today and a roadmap on the AISutra platform.'],
  '/solutions': ['Solutions by department | AI Sutra','What changes in marketing, sales, operations, finance, service, people, R&D and leadership, and how each process moves from as-is to measurable value.'],
  '/platform': ['AISutra platform and product catalogue | AI Sutra','The AISutra platform: role-based apps, AI agents and an enriched databank on an ERPNext core. Browse the product catalogue.'],
  '/how': ['How we work: Discovery, roadmap and the WEAVE method | AI Sutra','Discovery from ₹2.5 lakh (indicative), a three-phase roadmap (Stabilise, Build, Scale) and the WEAVE method for compounding results.'],
  '/company': ['Company and leadership | AI Sutra','AI Sutra is founded by an industrialist and a technologist, with Proman Group as client zero.'],
  '/privacy': ['Privacy policy | AI Sutra','How AI Sutra collects, uses and protects personal data shared through this website.']
};
const ROUTES = Object.keys(META);
const normPath = p => { p=(p||'/').replace(/\/index\.html$/,'').replace(/\/+$/,''); return p===''?'/':p; };
function setMeta(route){
  const m=META[route]||META['/'];
  document.title=m[0];
  const put=(sel,attr,val)=>{ const el=document.querySelector(sel); if(el) el.setAttribute(attr,val); };
  put('meta[name="description"]','content',m[1]);
  put('meta[property="og:title"]','content',m[0]);
  put('meta[property="og:description"]','content',m[1]);
  const base=(document.querySelector('meta[name="site-url"]')||{}).content||location.origin;
  put('link[rel="canonical"]','href',base.replace(/\/$/,'')+(route==='/'?'/':route+'/'));
  put('meta[property="og:url"]','content',base.replace(/\/$/,'')+(route==='/'?'/':route+'/'));
}

/* ---------- Privacy policy (draft: have it reviewed by your lawyer) ---------- */
function Privacy(){
  const H=({children})=>html`<h2 className="display font-bold text-xl text-ink mt-10">${children}</h2>`;
  return html`<section className="wrap py-16"><div className="max-w-3xl text-mute leading-relaxed flex flex-col gap-3">
    <${Eyebrow}>Privacy policy<//>
    <h1 className="display font-extrabold text-ink text-[clamp(2rem,4.4vw,3rem)] mt-3">How we handle your information</h1>
    <p>Last updated: [date]. This policy explains how [Company legal name] ("AI Sutra", "we") collects and uses personal data shared through this website, in line with India's Digital Personal Data Protection Act, 2023.</p>
    <${H}>What we collect<//>
    <p>Only what you type into our enquiry form: your name, company, work email, phone number (optional), the product or service you are interested in, and your message. We also keep the date and time of the enquiry and the page you sent it from. The website does not use advertising or tracking cookies.</p>
    <${H}>Why we use it<//>
    <p>To respond to your enquiry, arrange a conversation and, if you go ahead, scope a Discovery engagement. We do not sell your data or use it for unrelated marketing.</p>
    <${H}>Where it is kept<//>
    <p>Enquiries are delivered to our business email and may be recorded in our customer relationship system. Our website and these systems are hosted with reputable providers. Access is limited to the people who need it to respond to you.</p>
    <${H}>How long we keep it<//>
    <p>For as long as needed to respond and, if we work together, for the duration of that relationship and any period the law requires. You can ask us to delete it sooner.</p>
    <${H}>Your rights<//>
    <p>You can ask to see, correct or erase the personal data we hold about you, withdraw your consent, or raise a grievance. Write to our Grievance Officer at [privacy@yourdomain.com]. We will respond within a reasonable time and in any case within the period set by law. If you are not satisfied, you may approach the Data Protection Board of India.</p>
    <${H}>Changes<//>
    <p>We may update this policy; the date above shows the latest version.</p>
    <p className="mt-6"><a href="/" className="text-teal font-semibold">Back to home</a></p>
  </div></section>`;
}

/* ---------- App ---------- */
function App(){
  const [active,setActiveRaw]=useState(0); const touched=useRef(false);
  const [products,setProducts]=useState([]); const [dbState,setDbState]=useState('loading');
  const [modal,setModal]=useState(null); const [interest,setInterest]=useState('Discovery');
  const [site,setSite]=useState({email:'[email@yourdomain.com]',phone:'[+91 _____ _____]',whatsapp_number:'',office:'Bengaluru, India'});
  useEffect(()=>{ fetch('/content/site.json',{cache:'no-cache'}).then(r=>r.ok?r.json():null).then(j=>{ if(j) setSite(j); }).catch(()=>{}); },[]);
  const setActive=(i,user)=>{ if(user) touched.current=true; setActiveRaw(i); };
  useEffect(()=>{ let dead=false;
    fetch('/content/products.json',{cache:'no-cache'}).then(r=>{ if(!r.ok) throw 0; return r.json(); }).then(rows=>{ if(dead) return;
      rows.sort((a,b)=>(a.order||100)-(b.order||100)||(a.name||'').localeCompare(b.name||'')); setProducts(rows); setDbState('ready'); })
      .catch(()=>{ if(!dead) setDbState('none'); });
    return ()=>{ dead=true; }; },[]);
  const enquire=p=>{ setInterest(p.name); setModal(null); const el=document.getElementById('contact'); if(el) el.scrollIntoView({behavior:'smooth'}); };
  const [route,setRoute]=useState(()=>normPath(location.pathname));
  /* Internal links: client-side navigation with real URLs (/solutions, /platform, ...) */
  useEffect(()=>{
    const onClick=e=>{ if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey) return;
      const a=e.target.closest&&e.target.closest('a[href]'); if(!a) return; const href=a.getAttribute('href');
      if(!href||href[0]!=='/'||href.startsWith('//')||a.target) return;
      const to=normPath(href.split('#')[0]); if(!ROUTES.includes(to)) return;
      e.preventDefault(); if(to!==normPath(location.pathname)){ history.pushState({},'',to==='/'?'/':to+'/'); setRoute(to); window.scrollTo(0,0); } };
    const onPop=()=>{ setRoute(normPath(location.pathname)); };
    document.addEventListener('click',onClick); window.addEventListener('popstate',onPop);
    return ()=>{ document.removeEventListener('click',onClick); window.removeEventListener('popstate',onPop); }; },[]);
  useEffect(()=>{ setMeta(route); },[route]);
  const contact=html`<${Contact} interest=${interest} setInterest=${setInterest} products=${products} site=${site}/>`;
  const pages={
    '/': html`<${React.Fragment}><${Hero}/><${Strip}/><${Gaps}/><${Roadmap}/><${Model}/><${Engine}/><${Departments}/><${Offer}/><${PlatformTeaser} products=${products} openProduct=${setModal}/><${Weave}/><${Proof}/><${Leaders}/><${Trust}/><${Engage}/><${Faq}/>${contact}<//>`,
    '/solutions': html`<${React.Fragment}><${PageHero} eyebrow="Solutions" title=${html`Every department, every process, <span className="grad-text">one engine.</span>`} sub="What changes in each department, and how each step of your operating cycle moves from how it runs today to measurable business value."/><${Departments} full=${true}/><${Cycle} active=${active} setActive=${setActive}/>${contact}<//>`,
    '/platform': html`<${React.Fragment}><${PageHero} eyebrow=${SA} title=${html`The platform that weaves <span className="grad-text">your business into one.</span>`} sub=${PLATFORM+' combines a simple application for every role, an AI agent layer and an enriched databank on a proven ERPNext core. Deploy one product at a time, or the whole platform.'}/><${Platform}/><${Catalogue} products=${products} dbState=${dbState} openProduct=${setModal}/>${contact}<//>`,
    '/how': html`<${React.Fragment}><${PageHero} eyebrow="How we work" title=${html`From the truth to <span className="grad-text">compounding results.</span>`} sub=${'The '+METHOD+' method takes you from an honest view of how the business runs to a 3x–5x productivity lift, one evidence-backed stage at a time.'}/><${Roadmap}/><${Weave} full=${true}/><${Engage}/><${Value}/><${Faq}/>${contact}<//>`,
    '/company': html`<${React.Fragment}><${PageHero} eyebrow="Company" title=${html`A young company with <span className="grad-text">deep roots.</span>`} sub="AI Sutra was founded by an industrialist and a technologist to bring enterprise-grade Digital Transformation and AI to manufacturing businesses. The Neural Fabric for Industrial Excellence."/><${Company}/><${Proof}/><${Trust}/>${contact}<//>`,
    '/privacy': html`<${Privacy}/>`
  };
  const page=pages[route]||pages['/'];
  return html`<div>
    <${Nav} route=${route}/>
    <main key=${route}>${page}
    </main>
    <${Footer}/>
    ${modal && html`<${ProductModal} p=${modal} close=${()=>setModal(null)} enquire=${enquire}/>`}
  </div>`;
}
createRoot(document.getElementById('root')).render(html`<${App}/>`);
