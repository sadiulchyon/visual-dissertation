(() => {
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const figures=window.FIGURES,source=window.SOURCE;
const {chapters,rivers,evidence,impactSteps}=window.CONTENT;
const mining=window.MINING,spine=window.SPINE,guide=window.FIELD_GUIDE;
const figureById=new Map(figures.map(f=>[f.id,f]));
const state={view:'spine',chapter:0,river:'someshwari',variants:{},impact:0,year:3,revenue:null,complaint:null,action:0,evidenceCase:0,playing:false,playTimer:null,reduceMotion:false,figureLimit:16,filtered:figures,viewer:null,part:0,zoom:1,previousHash:'#top',answers:new Map(),spineScroll:0};
const paths={map:'M3 5l6-2 6 2 6-2v16l-6 2-6-2-6 2V5zm6-2v16m6-14v16',growth:'M4 20V5m0 15h17M7 15l4-4 4 2 6-9m-5 0h5v5',water:'M3 8c3-4 5 4 8 0s5 4 10 0M3 14c3-4 5 4 8 0s5 4 10 0M3 20c3-4 5 4 8 0s5 4 10 0',restore:'M4 10a8 8 0 1 1 1 9M4 4v6h6M10 14l2 2 5-5',people:'M9 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm9 3a2.5 2.5 0 1 0 0-5M3 21v-6a6 6 0 0 1 12 0v6m2-8a5 5 0 0 1 5 5v3',shield:'M12 2l9 4v6c0 5-5 9-9 11-4-2-9-6-9-11V6l9-4zm-4 10 3 3 5-6',balance:'M12 3v18M5 21h14M3 7h18M6 7l-4 8h8L6 7zm12 0-4 8h8l-4-8z',evidence:'M4 3h12l4 4v14H4V3zm12 0v5h4M8 12h8M8 16h5',image:'M3 4h18v16H3V4zm0 12 5-5 5 5 3-3 5 5M15 8h1',money:'M3 5h18v14H3V5zm9 3v8m3-6c-1-2-6-2-6 0s6 1 6 3-5 3-6 0',bed:'M2 17l5 3 5-3 5 3 5-3M5 12l5-7 4 3-5 7-4-3zm8-4 4-5',cloud:'M4 14a4 4 0 0 1 0-8 6 6 0 0 1 11-1 4 4 0 1 1 3 9H4zm3 3-1 4m7-4-1 4m7-4-1 4'};
function icon(name,cls=''){return `<svg class="mini-icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]||paths.water}"/></svg>`;}
function figureThumb(id,className='figure-thumb'){const f=figureById.get(id);return f?`<button class="${className}" data-figure="${id}" aria-label="Open Figure ${id}: ${esc(f.title)}"><img src="${f.parts[0].thumb}" alt="${esc(f.title)}" loading="lazy"><span>Figure ${id} ↗</span></button>`:'';}
function tabs(key,items){const active=state.variants[key]||items[0][0];return `<div class="visual-tabs" role="group" aria-label="Choose a view">${items.map(([id,label])=>`<button data-variant-key="${key}" data-variant="${id}" aria-pressed="${active===id}">${label}</button>`).join('')}</div>`;}
function topLine(label,controls=''){return `<div class="board-top"><span>${label}</span>${controls}</div>`;}
function horizontalBars(items,max=100,unit='%'){return `<div class="horizontal-bars">${items.map(item=>`<div class="horizontal-bar"><div><span>${esc(item.name)}</span><strong>${item.value}${unit}</strong></div><span class="horizontal-track"><i style="width:${item.value/max*100}%;background:${item.color||'#4a8a7b'}"></i></span></div>`).join('')}</div>`;}
function note(text){return `<p class="visual-note">${text}</p>`;}
function metric(value,label,cls=''){return `<div class="metric ${cls}"><strong>${value}</strong><span>${label}</span></div>`;}

function riverPhoto(river){const [x,y,w,h]=mining.crops[river.id];return `<button class="river-photo" style="aspect-ratio:${w}/${h}" data-figure="2.4" aria-label="View the field photograph from the ${esc(river.name)} River"><img src="assets/figures/fig-2-4-1.webp" alt="Field photograph of extraction on the ${esc(river.name)} River" style="width:${2160/w*100}%;left:${-x/w*100}%;top:${-y/h*100}%"><span>Field photograph ↗</span></button>`;}
function drawRegional(){
  return `<div class="regional-layout"><button class="regional-map" data-figure="4.3" aria-label="Expand the regional extraction map"><img src="assets/figures/fig-4-3-1.webp" alt="Mapped extraction signals along Bangladesh’s northern fringe"><span>Expand the original map ↗</span></button><div class="regional-stats">${metric('337','fixed sites examined')}${metric('79','with an extraction-type signal','accent')}${metric('28','depots and land fills')}<p>Persistent changes visible in low-flow satellite images.</p></div></div>`;
}
function drawWhere(){
  const river=rivers.find(r=>r.id===state.river);
  let html=topLine('SIX STUDY RIVERS · WEST TO EAST');
  const riverShapes=rivers.map((r,i)=>{const x=68+i*148;return `<g class="river-target ${r.id===river.id?'selected':''}" role="button" tabindex="0" data-river-map="${r.id}" aria-label="Explore the ${esc(r.name)} River" aria-pressed="${r.id===river.id}"><path class="river-line" d="M${x} 104C${x-28} 160 ${x+28} 196 ${x+7} 249S${x-16} 304 ${x+18} 330"/><circle cx="${x}" cy="181" r="9"/><text x="${x}" y="160" text-anchor="middle">${esc(r.name)}</text></g>`;}).join('');
  html+=`<div class="where-layout"><div class="river-landscape"><svg viewBox="0 0 900 365" aria-label="Schematic locations of the six study rivers, from west to east"><path d="M0 96L38 65 68 80 108 29 148 67 192 37 239 75 280 31 323 66 360 39 410 78 460 30 500 59 545 22 595 69 633 35 682 75 728 32 776 60 823 26 864 69 900 42V144H0Z" fill="#dbe5ce"/><path d="M0 121C170 90 245 151 400 116S682 140 900 109V365H0Z" fill="#f3eddd"/><path d="M0 134H900" stroke="#a9b59e" stroke-dasharray="6 6"/><text x="24" y="25" class="landscape-place">INDIA · SHILLONG PLATEAU</text><text x="22" y="301" class="landscape-place">BANGLADESH</text><text x="22" y="320" class="landscape-small">Sediment spreads onto fans and floodplains</text>${riverShapes}<text x="25" y="352" class="landscape-small">West</text><path d="M65 347H835" stroke="#bac4b6"/><text x="877" y="352" text-anchor="end" class="landscape-small">East</text></svg><div class="river-pills">${rivers.map(r=>`<button data-river-map="${r.id}" aria-pressed="${r.id===river.id}">${esc(r.name)}</button>`).join('')}</div></div><div class="river-peek"><div class="river-peek-heading"><h2>${esc(river.name)}</h2><span>${esc(river.site)} · ${esc(river.material)}</span></div>${riverPhoto(river)}<p>${esc(river.hook)}</p><button class="source-button" data-river-evidence="${river.id}">Explore this river’s evidence ↗</button></div></div>`;
  return {html,evidence:'setting',figures:['2.1','2.2','2.4'],note:'River order is schematic, not to scale. The wider regional reconstruction examines 337 fixed sites.'};
}

function drawBudget(){return `<div class="budget-visual"><div class="budget-intro">${icon('restore')}<h2>Was removal balanced by replenishment?</h2><p>Lubha · million tonnes per year</p></div>${horizontalBars([{name:'Gravel removed',value:.79,color:'#b47a4c'},{name:'Sediment infill / supply',value:.58,color:'#448f80'}],.9,'')}<div class="budget-balance"><span>OUT</span><div class="balance-beam"><i></i><b></b></div><span>IN</span></div></div>`;}
function drawGrowth(){
  const variant=state.variants.growth||'footprint';
  let html=topLine('THE REGIONAL MINING FOOTPRINT',tabs('growth',[['footprint','Growth'],['map','Where'],['bans','What about bans?']]));
  if(variant==='map')return {html:html+drawRegional(),evidence:'extent',figures:['4.3','4.4'],note:'A conservative record of visible change. Small or underwater extraction can be missed.'};
  if(variant==='bans'){
    html+=`<div class="ban-visual"><div class="ban-title">${icon('shield')}<h2>Closing some gravel sites did not shrink the regional footprint.</h2></div><div class="ban-timeline"><div><b>2014–2015</b><span>Restrictions at Sylhet gravel sites</span></div><div><b>2020</b><span>National gravel ban begins</span></div><div><b>2023</b><span>Footprint reaches ~1,000 ha</span></div><div><b>Aug 2024</b><span>Extraction resumes at Jaflong and Bholaganj</span></div></div><p class="route-label">THE SUPPLY LANDSCAPE ALSO CHANGED</p><div class="supply-routes"><span>${icon('water')}Sand-bed rivers</span><span>${icon('growth')}Imported stone</span><span>${icon('bed')}Dredged sand</span></div></div>`;
    return {html,evidence:'policy',figures:['2.5','4.13'],note:'The evidence shows shifts in supply. It does not establish that every new sand site was displaced from a banned gravel site.'};
  }
  const bars=mining.footprint.map((d,i)=>{const h=d.area/1000*230,x=75+i*173;return `<g class="growth-column ${i===state.year?'selected':''}" role="button" tabindex="0" data-year="${i}" aria-label="${d.year}: about ${d.area} hectares"><rect x="${x}" y="${290-h}" width="95" height="${h}" rx="7"/><text class="bar-number" x="${x+47.5}" y="${274-h}" text-anchor="middle">~${d.area.toLocaleString('en-US')}</text><text class="bar-year" x="${x+47.5}" y="320" text-anchor="middle">${d.year}</text></g>`;}).join('');
  html+=`<div class="growth-layout"><div class="growth-chart"><p class="chart-label">Altered surface area · hectares</p><svg viewBox="0 0 760 342" aria-label="Reported extraction footprint benchmarks: 260 hectares in 2000, 540 in 2010, 880 in 2020 and 1000 in 2023"><path d="M45 60H742M45 175H742" stroke="#e0e7df" stroke-dasharray="4 5"/><path d="M45 291H742" stroke="#bdcbbd"/>${bars}</svg></div><div class="growth-highlight">${metric('~4×','growth from 2000 to 2023','accent')}<p>Seventy-two of 77 dated onsets occurred from 2000 onward.</p><div class="selected-year"><b>${mining.footprint[state.year].year}</b><span>~${mining.footprint[state.year].area.toLocaleString('en-US')} hectares</span></div></div></div>`;
  return {html,evidence:'extent',figures:['4.5','4.6','4.13'],note:'Four reported benchmarks. The visible footprint is a lower bound on surface change, not extracted volume.'};
}


function floodAreaGraphic(){return `<svg viewBox="0 0 780 340" role="img" aria-label="Inundated floodplain area: 27.96 square kilometres in 2017 and 3.45 in 2025, from one matched-discharge image pair"><text x="30" y="32" class="flood-scene-title">Inundated floodplain area · closely matched flow</text><circle cx="215" cy="160" r="97" fill="#b6d7db"/><circle cx="570" cy="160" r="34.1" fill="#69a9b6"/><path d="M354 160H468M457 150L468 160L457 170" stroke="#b4c2a6" stroke-width="2" fill="none"/><text x="215" y="159" text-anchor="middle" class="flood-area-big">27.96</text><text x="215" y="183" text-anchor="middle" class="flood-area-unit">km²</text><text x="570" y="165" text-anchor="middle" class="flood-area-small">3.45</text><text x="215" y="283" text-anchor="middle" class="flood-area-year">2017</text><text x="570" y="283" text-anchor="middle" class="flood-area-year">2025</text><text x="390" y="319" text-anchor="middle" class="scene-note">Circles scale with area, not the shape of the river.</text></svg>`;}

function drawImpact(){
  const variant=state.variants.effects||'chain',views=tabs('effects',[['chain','Impact chain'],['model','3D cutaway']]);
  if(variant==='model')return {html:topLine('SOMESHWARI · BELOW THE WATERLINE',views)+'<div class="river-model" data-model="incision"></div>',evidence:'stage',figures:['6.6','6.11'],note:window.RIVER_MODEL.modes.incision.limit};
  const step=impactSteps[state.impact],names=['Riverbed','River water','Groundwater','Floodplain'];
  const plainImpact=['Surveys measured deep local excavation. The deepest change is at one cross-section; it is not a reach-wide average.','Water flowing at the same rate now passes at a lower level, pointing to a changed channel rather than simply less water.','The nearby well deepened while a regional reference well became shallower, helping separate local change from regional groundwater trends.','At closely matched flow, the 2025 image shows far less flooded area. This is one image pair, not a long-term inundation trend.'];
  const bed=state.impact>=0,water=state.impact>=1,gw=state.impact>=2;
  let html=topLine('SOMESHWARI · FOLLOW THE CONNECTIONS',views);
  html+=`<div class="impact-selectors">${names.map((name,i)=>`<button data-impact="${i}" aria-pressed="${state.impact===i}"><span>${i+1}</span>${icon(['bed','water','water','cloud'][i])}<b>${name}</b></button>`).join('')}</div><div class="impact-layout"><div class="cross-section">${state.impact===3?floodAreaGraphic():`<svg viewBox="0 0 780 340" role="img" aria-label="Explanatory cross-section of a lowered river channel and nearby groundwater; not a measured profile"><defs><pattern id="sediment" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1" fill="#bcae8b" opacity=".35"/></pattern></defs><path d="M0 107H210L290 215H490L570 107H780V340H0Z" fill="#e2d7ba"/><path d="M0 107H210L290 215H490L570 107H780V340H0Z" fill="url(#sediment)"/><path d="M210 107L290 215H490L570 107L480 285H300Z" fill="#fafbf5"/><path d="${water?'M261 208H519L480 285H300Z':'M230 133H550L480 285H300Z'}" fill="#82bdcb"/><path d="M0 107H210L290 215H490L570 107H780" fill="none" stroke="#a39b83" stroke-width="2" stroke-dasharray="6 5"/><path d="M0 107H210L300 285H480L570 107H780" fill="none" stroke="#947d54" stroke-width="3"/><path d="${gw?'M0 174C120 174 195 180 261 208M519 208C585 180 660 174 780 174':'M0 151C120 151 195 148 248 163M532 163C585 148 660 151 780 151'}" stroke="#388da4" stroke-width="2.6" stroke-dasharray="8 5" fill="none"/><path d="M0 97H780V107H570L550 133H230L210 107H0Z" fill="#9ccbd1" opacity="${state.impact>=1?'.08':'.55'}"/><text x="27" y="77" class="scene-label">FLOODPLAIN</text><text x="330" y="61" class="scene-label">RIVER</text><text x="25" y="292" class="scene-label">GROUNDWATER</text><path d="M22 316H52" stroke="#a39b83" stroke-dasharray="5 4"/><text x="60" y="320" class="scene-note">Original bed</text><text x="594" y="320" class="scene-note">Schematic · not to scale</text></svg>`}</div><div class="impact-callout"><span class="eyebrow">${names[state.impact].toUpperCase()}</span><strong>${esc(step.value)}</strong><span class="impact-unit">${esc(step.unit)}</span><p>${esc(plainImpact[state.impact])}</p><button data-figure="${step.figure}" class="source-button">See the measured finding ↗</button></div></div><div class="play-row"><button id="impact-play" class="play-button" aria-pressed="${state.playing}">${state.playing?'Ⅱ Pause':'▶ Play the four links'}</button><span>One river supplies the fullest evidence for all four links.</span></div>`;
  return {html,evidence:step.evidence,figures:[step.figure],note:state.impact===3?'The 88% inundation difference comes from one matched-discharge image pair, 2017 and 2025.':'The diagram explains a mechanism. Values come from different measured comparisons; they do not set its scale.'};
}

function drawComparison(){
  const variant=state.variants.comparison||'stage';
  let html=topLine('FOUR MORE RIVERS · DO THE CHANGES RECUR?',tabs('comparison',[['stage','Water levels'],['flood','Floodplain']]));
  if(variant==='flood'){
    const flood=[{name:'Piyain',value:62,status:'Established',color:'#438e7f'},{name:'Jadukata',value:35,status:'Indicated',color:'#b99a5c'},{name:'Sari-Gowain',value:27,status:'Change not established',color:'#aebcac'}];
    html+=`<div class="comparison-chart"><div class="comparison-chart-title"><h2>Less floodplain inundation in 2025?</h2><p>Compared with 2017, at the same discharge and preceding rainfall</p></div>${flood.map(r=>`<div class="flood-row"><span>${r.name}</span><div class="flood-track"><i style="width:${r.value}%;background:${r.color}"></i></div><b>${r.value}% less</b><small>${r.status}</small></div>`).join('')}<p class="no-change-row">Lubha: no significant change in the adjusted comparison.</p></div>`;
    return {html,evidence:'comparison',figures:['7.9'],note:'Only two monsoons are compared here. Comparing two four-year periods established no change on any of the four additional rivers.'};
  }
  const compared=rivers.filter(r=>['jadukata','piyain','sari','lubha'].includes(r.id));
  html+=`<div class="comparison-chart"><div class="comparison-chart-title"><h2>Lower water level at the same low flow</h2><p>Each gauge is compared at its own reference low flow, before and after change</p></div><div class="river-levels">${compared.map(r=>`<button class="river-level-row" data-river-evidence="${r.id}"><span>${esc(r.name)}</span><div class="level-track">${r.stageValue?`<i style="width:${r.stageValue/4*100}%"></i>`:''}</div><b>${esc(r.stage)}</b><span class="row-info">↗</span></button>`).join('')}</div></div>`;
  return {html,evidence:'comparison',figures:['7.4','9.2'],note:'Piyain shows Jaflong Spill; Ratnar bhanga fell 1.4 m. Lubha’s small temporary fall was not significant. Open a river for its limits.'};
}

function drawRecovery(){
  const variant=state.variants.recovery||'river';
  let html=topLine('LUBHA · AFTER THE FEBRUARY 2021 BAN',tabs('recovery',[['river','The river'],['people','The people'],['budget','Sediment balance'],['model','3D cutaway']]));
  if(variant==='model')return {html:html+'<div class="river-model" data-model="infill"></div>',evidence:'recovery',figures:['5.10','5.6'],note:window.RIVER_MODEL.modes.infill.limit};
  if(variant==='budget')return {html:html+drawBudget(),evidence:'budget',figures:['5.4','5.7'],note:'First-order estimates from pit areas, assigned depths and monsoon infill; no comparable volume budget exists for every study river.'};
  if(variant==='people'){
    html+=`<div class="people-recovery"><div class="recovery-person-art">${icon('people')}<span>55 residents interviewed</span><small>February 2024 · purposive sample</small></div><div class="ring-outcomes"><div class="percent-ring" style="--percent:95;--ring-color:#b77b50"><strong>95<small>%</small></strong></div><div><h2>Reported hardship and unemployment</h2><p>Three years after the ban</p><span class="second-outcome"><b>73%</b> had petitioned to reopen extraction.</span></div></div></div>`;
    return {html,evidence:'livelihoods',figures:['9.3','5.14'],note:'These percentages describe the interviewed residents, not the population. Channel recovery did not replace their former income.'};
  }
  html+=`<div class="recovery-visual"><div class="recovery-rates"><h2>How much mined area had infilled by 2024?</h2>${horizontalBars([{name:'Active channel',value:94.5,color:'#458f7b'},{name:'Abandoned channels & floodplain',value:23,color:'#ba8655'}])}<div class="recovery-explanation"><span>${icon('water')}Regular monsoon sediment supply</span><span>${icon('bed')}Less frequent replenishment</span></div></div><div class="recovery-pair"><button data-figure="5.10" class="paired-image"><img src="assets/figures/fig-5-10-1.webp" alt="Lubha channel imagery showing pits in 2019 and reformed gravel dunes in 2024"><span>2019 → 2024 · View original ↗</span></button><p>The connected channel refilled faster than higher floodplain pits.</p></div></div>`;
  return {html,evidence:'recovery',figures:['5.6','5.7','5.10'],note:'Channel and floodplain percentages use different area denominators. Floodplain infill of 23% is a minimum.'};
}

function waffle(items,key='revenue'){let cells=[];items.forEach((item,index)=>{for(let n=0;n<item.value;n++)cells.push(`<i style="--cell:${item.color}" data-waffle="${index}" class="${state[key]!==null&&state[key]!==index?'dimmed':''}" aria-hidden="true"></i>`);});return cells.join('');}
function drawBenefits(variant){
  let html='';
  if(variant!=='money'){
    const chart=isJobs=>`<div class="group-comparison"><div class="comparison-chart-title"><h2>${isJobs?'Who reported more jobs?':'Whose livelihoods were hampered?'}</h2><p>${isJobs?'Recalled change over the preceding five years':'Reported impacts within each occupational group'}</p></div>${horizontalBars(mining.groups.map(g=>({name:g.name,value:isJobs?g.jobs:g.costs,color:g.color})))}</div>`;
    html=`<div class="vd-pair">${chart(true)}${chart(false)}</div>`;
    return {html,evidence:['jobs','costs'],evidenceLabels:['Jobs: evidence &amp; limits','Costs: evidence &amp; limits'],figures:['8.5','8.3'],note:'Non-probability household sample. Percentages describe respondents within each group; valid denominators vary by question.'};
  }
  const selected=state.revenue===null?mining.revenue[0]:mining.revenue[state.revenue];
  html+=`<div class="money-layout"><div><p class="chart-label">Of each 100 BDT paid by a buyer</p><div class="money-waffle" role="img" aria-label="54 to leaseholder and machine owner, 15 to transport, 11 to laborers and 20 to other allocations">${waffle(mining.revenue)}</div><div class="money-legend">${mining.revenue.map((item,i)=>`<button data-revenue="${i}" aria-pressed="${state.revenue===i}"><i style="background:${item.color}"></i><span>${item.short}</span><b>${item.value}</b></button>`).join('')}</div></div><div class="money-callout">${icon('money')}<strong>${selected.value}<small>of 100 BDT</small></strong><h2>${esc(selected.name)}</h2><p>${esc(selected.note)}</p></div></div>`;
  return {html,evidence:'revenue',figures:['8.4'],note:'One leaseholder’s allocation exercise, not an audited revenue account. “Other” includes fuel, unofficial payments and royalty.'};
}

function drawPersistence(variant){
  let html='';
  if(variant==='loops'){
    const loopRows=[{color:'green',icon:'people',title:'Income and dependence',nodes:['Mining','Employment & income','Fewer options to leave','Mining continues']},{color:'gold',icon:'shield',title:'Revenue and protection',nodes:['Mining','Concentrated revenue','Political protection','Continued access']}];
    html+=`<div class="simple-loops">${loopRows.map(row=>`<div class="simple-loop ${row.color}"><h2>${icon(row.icon)}${row.title}</h2><div>${row.nodes.map((name,i)=>`<span>${esc(name)}</span>${i<3?'<b aria-hidden="true">→</b>':''}`).join('')}</div></div>`).join('')}<div class="blocked-path"><span>Recognized harm</span><b>→</b><span>Complaints</span><b class="blocked-cross">×</b><span>Effective response & enforcement</span></div><p>Political protection weakened complaint handling and enforcement.</p></div>`;
    return {html,evidence:'loops',figures:['8.7','8.8'],note:'Simplified qualitative pathways. They explain relationships, not measured loop strength or predicted intervention effects.'};
  }
  const groups=[{name:'Addressed',value:5,color:'#4b977e'},{name:'Met pressure',value:42,color:'#cf9c57'},{name:'No response',value:50,color:'#bec9bf'}];
  html+=`<div class="complaint-layout"><div class="complaint-main"><span class="eyebrow">FORMAL COMPLAINT ATTEMPTS</span><strong>5 <small>of 97</small></strong><h2>reported as addressed</h2><p>Recognition was already high: 72–90% of each occupational group judged the changes unsustainable.</p></div><div class="complaint-chart"><div class="complaint-waffle" role="img" aria-label="97 formal complaint attempts: 5 addressed, 42 met pressure, 50 received no response">${waffle(groups,'complaint')}</div><div class="complaint-key">${groups.map((g,i)=>`<button data-complaint="${i}" aria-pressed="${state.complaint===i}"><i style="background:${g.color}"></i><b>${g.value}</b><span>${g.name}</span></button>`).join('')}</div></div></div>`;
  return {html,evidence:'governance',figures:['8.6','8.7'],note:'97 attempts among 337 classified household respondents. Each dot represents one reported attempt; January 2024 survey.'};
}

function drawPeople(){
  const variant=state.variants.people||'complaints';
  const result=variant==='money'||variant==='jobs'?drawBenefits(variant):drawPersistence(variant);
  result.html=topLine('SOMESHWARI · THE 2023–2024 LEASE REGIME',tabs('people',[['complaints','Complaints'],['money','The money'],['jobs','Jobs & costs'],['loops','Why it continues']]))+result.html;
  return result;
}

function drawManagement(){
  const active=mining.actions[state.action];
  const html=topLine('THREE THINGS TO CONNECT')+`<div class="management-visual">${mining.actions.map((a,i)=>`<button class="action-card ${state.action===i?'selected':''}" data-action="${i}" aria-pressed="${state.action===i}"><span class="action-illustration">${icon(a.icon)}</span><small>0${i+1}</small><h2>${a.title}</h2><p>${a.line}</p><span class="action-arrow">↓</span></button>`).join('')}</div><div class="action-detail" aria-live="polite"><span class="action-detail-label">${active.title}</span><ul>${active.details.map(d=>`<li>${esc(d)}</li>`).join('')}</ul></div>`;
  return {html,evidence:'synthesis',figures:['9.4','9.2'],note:'Recommendations connect annual lease decisions to river changes that extend across kilometres and decades.'};
}

function drawEvidence(){
  const example=[{title:'Records converge',text:'Someshwari: images, surveys, gauges and a near-river well support linked physical changes.',figure:'6.6',label:'Agreement'},{title:'Another record adds context',text:'Lubha: images show channel recovery; household accounts reveal lost income.',figure:'9.3',label:'A wider picture'},{title:'Disagreement marks a limit',text:'Piyain at Ratnar bhanga: water level fell, but the nearby surveyed section did not show lowering.',figure:'7.4',label:'A limitation'}][state.evidenceCase];
  const html=topLine('COMBINE THREE KINDS OF EVIDENCE')+`<div class="evidence-flow"><div class="evidence-strand">${icon('image')}<h2>Satellite images</h2><p>Where and when<br>the surface changed</p></div><b>+</b><div class="evidence-strand">${icon('water')}<h2>River records</h2><p>Bed, water level<br>and groundwater</p></div><b>+</b><div class="evidence-strand">${icon('people')}<h2>People’s accounts</h2><p>Benefits, costs<br>and governance</p></div></div><div class="alignment"><span>Same river reach</span><b>+</b><span>Same season</span><b>+</b><span>Dated events</span></div><div class="evidence-examples"><div class="example-tabs">${['Agreement','A wider picture','A limitation'].map((label,i)=>`<button data-example="${i}" aria-pressed="${state.evidenceCase===i}">${label}</button>`).join('')}</div><div><h2>${example.title}</h2><p>${example.text}</p><button data-figure="${example.figure}" class="source-button">View the example ↗</button></div></div>`;
  return {html,evidence:'methods',figures:['3.1','3.4','9.5'],note:'A falling water level alone does not identify its cause. The thesis tests rainfall, flow, regional groundwater and other controls.'};
}

function drawFramework(){
  const items=[{chapter:4,icon:'growth',title:'Demand',detail:'Construction needs material'},{chapter:2,icon:'map',title:'Extraction',detail:'Rivers supply sand and gravel'},{chapter:6,icon:'water',title:'Impacts',detail:'Water systems and livelihoods change'},{chapter:9,icon:'shield',title:'Management',detail:'Decisions respond—or fail to'}];
  const html=topLine('THE CONNECTING QUESTION')+`<div class="framework-flow">${items.map((item,i)=>`<button data-chapter="${item.chapter}" aria-label="${item.title}: go to Chapter ${item.chapter}">${icon(item.icon)}<span>0${i+1}</span><h2>${item.title}</h2><p>${item.detail}</p></button>${i<3?'<b aria-hidden="true">→</b>':''}`).join('')}</div><div class="framework-takeaway">Decisions made at one site can have consequences far along a river.</div>`;
  return {html,evidence:'framework',figures:['1.2','1.9'],note:'The Driver-to-Management Pathway connects the thesis’s four research questions. Choose a stage to jump to a chapter that covers it.'};
}

/* ---------- The reading spine: cover, contents, three acts, nine chapters ---------- */
const boards={1:drawFramework,2:drawWhere,3:drawEvidence,4:drawGrowth,5:drawRecovery,6:drawImpact,7:drawComparison,8:drawPeople,9:drawManagement};
const mediaSlots={5:'lubha',6:'someshwari',8:'governance'};
const svgStart='<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"';
const expandIcon=`${svgStart} viewBox="0 0 20 20"><path d="M4 9V4h5m7 7v5h-5M4 4l5 5m7 7-5-5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>`;
const pinIcon=`${svgStart} viewBox="0 0 20 20"><path d="M10 18s5.5-6.1 5.5-10.4a5.5 5.5 0 0 0-11 0C4.5 11.9 10 18 10 18Z" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="10" cy="7.4" r="1.8" fill="currentColor"/></svg>`;

function photoCrop(key){
  const photo=guide.photos[key],part=figureById.get(photo.figure).parts[0],[left,top,width,height]=photo.box;
  return `<svg class="field-photo" viewBox="${left} ${top} ${width} ${height}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(photo.alt)}"><image href="${part.src}" width="${part.width}" height="${part.height}" preserveAspectRatio="none"/></svg>`;
}
function photoCredit(key){
  const photo=guide.photos[key];
  return `<button class="plate-credit" data-figure="${photo.figure}" aria-label="Open original Figure ${photo.figure}, panel ${photo.panel}">${expandIcon} Fig. ${photo.figure}${photo.panel}</button>`;
}

function renderBoard(id){
  const holder=$(`#chapter-${id} .vd-board`);if(!holder)return;
  const result=boards[id](),board=$('.visual-board',holder);
  board.innerHTML=result.html;
  board.dataset.visual=mining.chapterVisuals[id];
  const model=$('.river-model',board);
  if(model)window.RIVER_MODEL.mount(model,model.dataset.model);
  $('.vd-source',holder).innerHTML=`<p>${esc(result.note)}</p><div>${[].concat(result.evidence).map((key,index)=>`<button data-evidence="${key}">${icon('evidence')} ${result.evidenceLabels?.[index]||'Evidence &amp; limits'}</button>`).join('')}${result.figures.slice(0,2).map(f=>`<button data-figure="${f}">Fig. ${f} ↗</button>`).join('')}</div>`;
}

function cover(){
  return `<section class="vd-cover" id="cover" aria-labelledby="cover-title">
    <div class="vd-cover-photo">${photoCrop('pools')}${photoCredit('pools')}</div>
    <div class="vd-cover-copy">
      <p class="vd-eyebrow">A visual dissertation · Northern Bangladesh</p>
      <h1 id="cover-title" tabindex="-1">What does mining <em>leave behind?</em></h1>
      <p class="vd-lede">These pools on the Lubha floodplain were dug for gravel. Across six rivers, this is what changes when people take sand and stone from the bed.</p>
      <div class="vd-cover-actions"><a class="vd-button" href="#chapter-1">Start reading <span aria-hidden="true">↓</span></a><a class="vd-textlink" href="#contents">See all nine chapters</a></div>
      <p class="vd-byline">Research by <strong>Md Sadiul Alam Chyon</strong></p>
    </div>
    <div class="vd-place">${pinIcon}<div><strong>Lubhachorra</strong><span>Lubha floodplain · January 2023</span></div></div>
  </section>`;
}

function contents(){
  return `<section class="vd-map" id="contents" aria-labelledby="contents-title"><div class="vd-wrap">
    <header class="vd-map-head"><p class="vd-eyebrow">The whole thesis on one screen</p><h2 id="contents-title" tabindex="-1">Nine chapters, three acts.</h2><p>Read straight through, or jump to the question you care about. Every chapter gives you one question, one number and one picture. The detail waits behind “Go deeper”.</p></header>
    <div class="vd-acts">${spine.acts.map(act=>`<div class="vd-act-col act-${act.id} vd-reveal"><p class="vd-act-tag"><b>Act ${act.roman}</b>${esc(act.title)}</p><ol>${act.chapters.map(id=>{const scene=spine.scenes[id];return `<li><a href="#chapter-${id}"><span class="vd-num">${pad(id)}</span><span class="vd-map-ask">${esc(scene.ask)}</span><span class="vd-map-stat"><b>${esc(scene.stat)}</b> ${esc(scene.unit)}</span></a></li>`;}).join('')}</ol></div>`).join('')}</div>
  </div></section>`;
}

function actBand(act){
  return `<div class="vd-act act-${act.id}" id="act-${act.id}"><div class="vd-wrap vd-reveal"><span class="vd-act-roman" aria-hidden="true">${act.roman}</span><div><p class="vd-eyebrow">Act ${act.roman} · Chapters ${act.chapters[0]}–${act.chapters.at(-1)}</p><h2>${esc(act.title)}</h2><p>${esc(act.line)}</p></div></div></div>`;
}

function hunch(id){
  const scene=spine.scenes[id],chapter=chapters[id-1],stop=scene.hunch&&guide.stops.find(item=>item.id===scene.hunch);
  if(!stop)return `<p class="vd-lede">${esc(chapter.question)}</p>`;
  const picked=state.answers.get(id);
  if(picked===undefined)return `<p class="vd-lede">${esc(stop.prompt)}</p><div class="vd-choices" role="group" aria-label="Take a guess">${stop.choices.map((choice,index)=>`<button data-guess="${index}"><span aria-hidden="true">${'AB'[index]}</span>${esc(choice)}</button>`).join('')}</div><p class="vd-hint">Take a guess, or just keep scrolling.</p>`;
  return `<div class="vd-verdict" role="status" tabindex="-1"><strong>${picked===stop.best?'That fits the evidence.':'The evidence points another way.'}</strong><p>${esc(stop.finding)}</p><button data-guess-reset>Guess again</button></div>`;
}

function deeper(chapter){
  return `<div class="vd-deeper"><button class="vd-deeper-toggle" aria-expanded="false" aria-controls="deeper-${chapter.id}"><span>Go deeper</span><small>Summary, key findings and ${chapter.figures.length} key figures</small><i aria-hidden="true">+</i></button>
    <div class="vd-deeper-body" id="deeper-${chapter.id}" hidden>
      <div class="vd-deeper-text"><h3>${esc(chapter.title)}</h3><p>${esc(chapter.summary)}</p><p class="vd-approach"><b>Approach</b>${esc(chapter.methods)}</p></div>
      <div class="vd-deeper-findings"><h4>Key findings</h4><ol>${chapter.findings.map(finding=>`<li>${esc(finding)}</li>`).join('')}</ol><div class="vd-deeper-actions"><button class="vd-chip" data-evidence="${chapter.evidence}">Evidence &amp; limits</button><button class="vd-chip" data-chapter-figures="${chapter.id}">All Chapter ${chapter.id} figures</button></div></div>
      <div class="vd-deeper-figs">${chapter.figures.map(id=>figureThumb(id)).join('')}</div>
    </div></div>`;
}

function chapterSection(chapter,act){
  const scene=spine.scenes[chapter.id],photo=guide.photos[scene.photo],nextId=chapter.id<9?chapter.id+1:0;
  const next=nextId?`<a class="vd-next" href="#chapter-${nextId}"><span>${esc(scene.next)}</span><b>Next <i>${pad(nextId)}</i> ${esc(spine.scenes[nextId].ask)} <em aria-hidden="true">↓</em></b></a>`:'';
  return `<section class="vd-chapter act-${act.id}${chapter.id%2?'':' flip'}" id="chapter-${chapter.id}" data-chapter="${chapter.id}" aria-labelledby="chapter-${chapter.id}-title">
    <div class="vd-poster"><div class="vd-wrap vd-poster-grid">
      <figure class="vd-plate vd-reveal">${photoCrop(scene.photo)}${photoCredit(scene.photo)}<figcaption>${pinIcon}${esc(photo.place)}${photo.date?' · '+esc(photo.date):''}</figcaption></figure>
      <div class="vd-poster-copy vd-reveal">
        <p class="vd-kicker"><span class="vd-bignum" aria-hidden="true">${pad(chapter.id)}</span><span>Chapter ${chapter.id} of 9<b>${esc(mining.chapterNames[chapter.id])}</b></span></p>
        <h2 id="chapter-${chapter.id}-title" tabindex="-1">${esc(scene.ask)}</h2>
        <div class="vd-hunch" data-hunch-holder>${hunch(chapter.id)}</div>
      </div>
    </div></div>
    <div class="vd-answer"><div class="vd-wrap">
      <div class="vd-stat vd-reveal"><p class="vd-stat-num${scene.stat.length>5?' long':''}"><strong>${esc(scene.stat)}</strong><span>${esc(scene.unit)}</span></p><div class="vd-stat-copy"><p class="vd-take">${esc(chapter.takeaway)}</p><p class="vd-stat-label">${esc(scene.label)}</p></div></div>
      <div class="vd-board vd-reveal"><div class="visual-board"></div><div class="vd-source"></div><div class="vd-media"></div></div>
      ${deeper(chapter)}
      ${next}
    </div></div>
  </section>`;
}

function ending(){
  const recap=[4,6,7,5,8].map(id=>{const scene=spine.scenes[id];return `<li><a href="#chapter-${id}"><b>${esc(scene.stat)}</b><span>${esc(scene.unit)}</span><small>Chapter ${id}</small></a></li>`;}).join('');
  return `<section class="vd-end" id="end" aria-labelledby="end-title"><div class="vd-wrap">
    <p class="vd-eyebrow">The argument in five numbers</p>
    <h2 id="end-title" tabindex="-1">A photograph can show which pits remain.</h2>
    <p class="vd-lede">To judge recovery, we also need to ask who can earn a living and whose concerns will be heard.</p>
    <ol class="vd-recap">${recap}</ol>
    <div class="vd-end-actions"><a class="vd-button" href="#figures">Browse the 81 original figures <span aria-hidden="true">→</span></a><button class="vd-textlink" data-evidence="sources">About the research</button><a class="vd-textlink" href="#top">Back to the top ↑</a></div>
  </div></section>`;
}

function renderRail(){
  $('#rail').innerHTML=spine.acts.map(act=>`<span class="vd-rail-act act-${act.id}"><small aria-hidden="true">${act.roman}</small>${act.chapters.map(id=>`<a href="#chapter-${id}" data-rail="${id}" title="${esc(spine.scenes[id].ask)}" aria-label="Chapter ${id}: ${esc(spine.scenes[id].ask)}">${id}</a>`).join('')}</span>`).join('')+'<span class="vd-rail-now" id="rail-now"></span>';
}

function renderSpine(){
  const parts=[cover(),contents()];
  for(const act of spine.acts){
    parts.push(actBand(act));
    for(const id of act.chapters)parts.push(chapterSection(chapters[id-1],act));
  }
  parts.push(ending());
  $('#spine').innerHTML=parts.join('');
  for(const chapter of chapters){renderBoard(chapter.id);renderMedia(chapter.id);}
  observe();
}

/* ---------- Where the reader is ---------- */
let spyQueued=false;
const headerHeight=()=>$('.vd-header').offsetHeight;
function markRail(id){
  $$('[data-rail]').forEach(link=>{
    const number=Number(link.dataset.rail);
    if(number===id)link.setAttribute('aria-current','true');else link.removeAttribute('aria-current');
    link.classList.toggle('done',id>0&&number<id);
  });
  $('#rail-now').textContent=spine.scenes[id]?.ask||'';
}
function setCurrent(id){
  state.chapter=id;markRail(id);
  if($('#figure-dialog').open)return;
  const hash=spine.scenes[id]?'#chapter-'+id:id>9?'#end':'';
  if(location.hash!==hash)history.replaceState(null,'',hash||location.pathname+location.search);
}
function spy(){
  spyQueued=false;
  if(state.view!=='spine')return;
  const line=headerHeight()+innerHeight*.35;let current=0;
  for(const section of $$('.vd-chapter')){if(section.getBoundingClientRect().top<=line)current=Number(section.dataset.chapter);else break;}
  if($('#end').getBoundingClientRect().top<=line)current=10;
  const room=document.documentElement.scrollHeight-innerHeight;
  $('#progress-bar').style.transform=`scaleX(${room>0?Math.min(1,scrollY/room):0})`;
  if(current!==state.chapter)setCurrent(current);
}
function queueSpy(){if(!spyQueued){spyQueued=true;requestAnimationFrame(spy);}}

/* The scroll reveal is pure CSS (spine.css); this class only switches it on or off. */
function observe(){document.body.classList.toggle('vd-motion-ok',!state.reduceMotion);}

function showView(view){
  if(state.view===view)return;
  if(state.view==='spine')state.spineScroll=scrollY;
  state.view=view;
  $('#spine').hidden=view!=='spine';$('#library-wrap').hidden=view!=='figures';
  $('#nav-figures').setAttribute('aria-pressed',String(view==='figures'));
  document.body.classList.toggle('vd-library',view==='figures');
  if(view==='figures'){stopPlay();renderFigures();markRail(0);$('#progress-bar').style.transform='scaleX(0)';}
}
function scrollToId(id,instant=false,focus=false){
  const element=document.getElementById(id);if(!element)return;
  const top=id==='top'?0:Math.max(0,element.getBoundingClientRect().top+scrollY-headerHeight()+1);
  const far=Math.abs(top-scrollY)>innerHeight*2.5;
  window.scrollTo({top,left:0,behavior:instant||far||state.reduceMotion?'instant':'smooth'});
  if(focus)$('h1[tabindex],h2[tabindex]',element)?.focus({preventScroll:true});
}

function normalize(value){return String(value).toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}.]+/gu,' ').trim();}
function renderFigures(reset=false){
  if(reset)state.figureLimit=16;
  const query=normalize($('#figure-search').value),words=query.split(/\s+/).filter(Boolean),chapter=$('#figure-chapter').value;
  const exact=query.match(/^(?:figure )?(\d+\.\d+)$/);
  state.filtered=figures.filter(f=>(chapter==='all'||f.chapter===Number(chapter))&&(exact?f.id===exact[1]:words.every(w=>normalize(f.id+' '+f.title+' '+f.caption).includes(w))));
  const visible=state.filtered.slice(0,state.figureLimit);
  $('#figure-grid').innerHTML=visible.map(f=>`<button class="figure-card" data-figure="${f.id}" data-gallery="true"><span class="figure-card-image"><img src="${f.parts[0].thumb}" alt="${esc(f.title)}" loading="lazy">${f.parts.length>1?`<small>${f.parts.length} parts</small>`:''}</span><span>FIGURE ${f.id} · CHAPTER ${f.chapter}</span><b>${esc(f.title)}</b></button>`).join('');
  $('#figure-count').textContent=`${state.filtered.length} figure${state.filtered.length===1?'':'s'}${visible.length<state.filtered.length?' · '+visible.length+' shown':''}`;
  $('#figure-empty').hidden=state.filtered.length!==0;$('#figure-more').hidden=state.figureLimit>=state.filtered.length;
}

  function evidenceFigures(ids) {
    return `<div class="evidence-figures">${ids.map(id => figureThumb(id)).join('')}</div>`;
  }

  function tableMarkup(key) {
    const rows = source.tables[key];
    if (!rows) return '';
    const caption = key.startsWith('8A.4') ? `Appendix Table 8A.4 · ${key.endsWith('Revenue')?'Revenue allocation':'Complaint counts'}` : `Table ${key}`;
    return `<details class="evidence-original"><summary>Inspect ${esc(caption)}</summary><div class="evidence-table-wrap"><table><caption>${esc(caption)} · source wording retained</caption><thead><tr>${rows[0].map(cell=>`<th scope="col">${esc(cell)}</th>`).join('')}</tr></thead><tbody>${rows.slice(1).map(row=>`<tr>${row.map((cell,i)=>i===0?`<th scope="row">${esc(cell)}</th>`:`<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></details>`;
  }

  function paragraphMarkup(ids) {
    const included = ids.filter(id => source.excerpts[id]);
    if (!included.length) return '';
    return `<details class="evidence-original"><summary>Read the relevant thesis excerpts (${included.length})</summary>${included.map((id,index)=>`<blockquote data-source-paragraph="${id}"><small>THESIS EXCERPT ${index+1} · ORIGINAL WORDING</small>${esc(source.excerpts[id])}</blockquote>`).join('')}</details>`;
  }

  function openEvidence(key) {
    const item = evidence[key];
    if (!item) return;
    $('#evidence-body').innerHTML = `<p class="eyebrow">${esc(item.label)}</p><h2 id="evidence-title">${esc(item.title)}</h2><p class="evidence-summary">${esc(item.summary)}</p>${evidenceFigures(item.figures || [])}${item.table?tableMarkup(item.table):''}${paragraphMarkup(item.paragraphs || [])}<p class="evidence-origin-note">Source: ${esc(source.file)} · supplied thesis draft. These excerpts preserve the source wording. Original figure captions retain their credits and any reproduction terms.</p>`;
    const dialog = $('#evidence-dialog');
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
  }

  function openRiverEvidence(id) {
    const river = rivers.find(item => item.id === id);
    if (!river) return;
    $('#evidence-body').innerHTML = `<p class="eyebrow">RIVER EVIDENCE / ${esc(river.site)}</p><h2 id="evidence-title">${esc(river.name)}</h2><p class="evidence-summary">${esc(river.summary)}</p><div class="river-evidence-facts"><p><b>Stage:</b> ${esc(river.stage)}. ${esc(river.stageNote)}</p><p><b>Floodplain:</b> ${esc(river.floodNote)}</p><p><b>Limit:</b> ${esc(river.caveat)}</p></div>${evidenceFigures([river.figure,'9.2'])}${paragraphMarkup(river.sources)}<div class="chapter-actions"><button class="text-link" data-river-chapter="${river.chapters.includes(7)?7:river.chapters.includes(6)?6:river.chapters.includes(5)?5:4}">Read the relevant chapter ↗</button><button class="source-button" data-figure="9.2">Compare all six rivers ↗</button></div><p class="evidence-origin-note">Comparisons follow Chapters 4–9 of the supplied thesis draft. The six rivers do not have identical monitoring coverage.</p>`;
    const dialog = $('#evidence-dialog');
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
  }

  function openFigure(id,part = 0,fromGallery = false) {
    const figure = figureById.get(id);
    if (!figure) return;
    const dialog = $('#figure-dialog');
    if (!dialog.open) {
      state.previousHash = location.hash.startsWith('#figure-') ? '#figures' : location.hash || '#top';
      state.viewerList = fromGallery ? state.filtered.map(f=>f.id) : figures.map(f=>f.id);
    }
    state.viewer = figure;
    state.part = Math.min(part,figure.parts.length-1);
    state.zoom = 1;
    $('#figure-dialog-title').textContent = `Figure ${figure.id}`;
    $('#figure-name').textContent = figure.title;
    $('#figure-caption').textContent = figure.caption;
    $('#figure-part-tabs').innerHTML = figure.parts.length>1 ? figure.parts.map((_,index)=>`<button class="${index===state.part?'selected':''}" data-figure-part="${index}" aria-pressed="${index===state.part}">Part ${index+1} of ${figure.parts.length}</button>`).join('') : '';
    const ids = state.viewerList || figures.map(f=>f.id);
    const at = ids.indexOf(id);
    $('#figure-prev').disabled = at<=0;
    $('#figure-next').disabled = at<0 || at>=ids.length-1;
    history.replaceState(null,'',`#figure-${id}`);
    if (!dialog.open) dialog.showModal();
    $('.figure-caption-panel').scrollTop = 0;
    loadFigurePart();
  }

  function loadFigurePart() {
    const part = state.viewer.parts[state.part];
    const img = $('#figure-large');
    img.alt = `Figure ${state.viewer.id}${state.viewer.parts.length>1 ? `, part ${state.part+1}`:''}: ${state.viewer.title}`;
    img.onload = () => fitFigure();
    img.src = part.original;
    $('#figure-original').href = part.original;
    $('#figure-origin').textContent = `${part.origin} · ${part.width.toLocaleString('en-US')} × ${part.height.toLocaleString('en-US')} pixels · ${part.sourceFile}`;
    $('#figure-to-chapter').dataset.chapter = state.viewer.chapter;
    $$('[data-figure-part]').forEach(button => {
      const active = Number(button.dataset.figurePart) === state.part;
      button.classList.toggle('selected',active);
      button.setAttribute('aria-pressed',String(active));
    });
    if (img.complete && img.naturalWidth) fitFigure();
  }

  function fitFigure() {
    const stage = $('#figure-stage');
    const img = $('#figure-large');
    if (!img.naturalWidth || !stage.clientWidth) return;
    const style = getComputedStyle(stage);
    const width = stage.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const height = stage.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    state.baseScale = Math.min(width/img.naturalWidth,height/img.naturalHeight,1);
    setZoom(1,false);
  }

  function setZoom(zoom,keepCenter = true) {
    const stage = $('#figure-stage');
    const img = $('#figure-large');
    const oldZoom = state.zoom;
    const centerX = (stage.scrollLeft+stage.clientWidth/2)/oldZoom;
    const centerY = (stage.scrollTop+stage.clientHeight/2)/oldZoom;
    state.zoom = Math.min(5,Math.max(1,zoom));
    const scale = (state.baseScale || 1)*state.zoom;
    img.style.width = `${Math.round(img.naturalWidth*scale)}px`;
    img.style.height = `${Math.round(img.naturalHeight*scale)}px`;
    stage.classList.toggle('zoomed',state.zoom>1);
    $('#zoom-label').textContent = state.zoom===1?'Fit':`${Math.round(state.zoom*100)}%`;
    $('#zoom-out').disabled = state.zoom<=1;
    $('#zoom-in').disabled = state.zoom>=5;
    if (keepCenter) {
      stage.scrollLeft = centerX*state.zoom-stage.clientWidth/2;
      stage.scrollTop = centerY*state.zoom-stage.clientHeight/2;
    } else {
      stage.scrollTop = 0;
      stage.scrollLeft = 0;
    }
  }

  function adjacentFigure(direction) {
    if (!state.viewer) return;
    const ids = state.viewerList || figures.map(f=>f.id);
    const next = ids[ids.indexOf(state.viewer.id)+direction];
    if (next) openFigure(next);
  }


function renderMedia(id){
  const holder=$(`#chapter-${id} .vd-media`),item=window.THESIS_MEDIA?.[mediaSlots[id]];
  if(!holder)return;holder.innerHTML='';if(!item?.src)return;
  const block=document.createElement('div');block.className='media-block';const title=document.createElement('h2');title.textContent=item.title||'Field video';block.append(title);
  const video=document.createElement('video');video.controls=true;video.preload='none';video.playsInline=true;video.src=item.src;if(item.poster)video.poster=item.poster;
  if(item.captions){const track=document.createElement('track');track.src=item.captions;track.kind='captions';track.srclang='en';track.label='English';video.append(track);}block.append(video);
  if(item.caption){const p=document.createElement('p');p.textContent=item.caption;block.append(p);}holder.append(block);
}

function stopPlay(){clearTimeout(state.playTimer);state.playing=false;const button=$('#impact-play');if(button){button.textContent='▶ Play the four links';button.setAttribute('aria-pressed','false');}}
function playImpact(){
  if(state.playing){stopPlay();renderBoard(6);return;}
  state.playing=true;state.impact=0;renderBoard(6);
  const advance=()=>{if(!state.playing)return;if(state.impact>=3){stopPlay();renderBoard(6);return;}state.impact++;renderBoard(6);state.playTimer=setTimeout(advance,7500);};
  state.playTimer=setTimeout(advance,7500);
}
function updateMotion(reduced,save=false){
  state.reduceMotion=reduced;document.body.classList.toggle('reduce-motion',reduced);
  $('#motion-toggle').textContent=reduced?'Motion off':'Motion on';$('#motion-toggle').setAttribute('aria-pressed',String(!reduced));
  $('#motion-toggle').title=reduced?'Turn explanatory motion on':'Turn explanatory motion off';
  if(save){try{localStorage.setItem('thesis-motion',reduced?'off':'on');}catch{}}
  if(reduced){stopPlay();renderBoard(6);}
  observe();
}

/* ---------- Routing: one page, deep links to chapters and figures ---------- */
function resolve(hash){
  const chapter=hash.match(/^#chapter-([1-9])$/);if(chapter)return 'chapter-'+chapter[1];
  if(hash==='#contents'||hash==='#chapters')return 'contents';
  if(hash==='#end')return 'end';
  if(/^#act-(setup|rivers|people)$/.test(hash))return hash.slice(1);
  /* Links from the earlier version of the site still land on the right chapter. */
  const stop=hash.match(/^#story-([a-z]+)$/);
  if(stop){const chapterId=guide.stops.find(item=>item.id===stop[1])?.chapter;return chapterId?'chapter-'+(stop[1]==='voice'?8:chapterId):'top';}
  const old=hash.match(/^#question-([a-z]+)$/);
  if(old){
    const chapterId={where:2,growth:4,effects:6,recovery:5,benefits:8,persistence:8,management:9,evidence:3}[old[1]];
    if(old[1]==='benefits'){state.variants.people='money';renderBoard(8);}
    return chapterId?'chapter-'+chapterId:'top';
  }
  return 'top';
}
function routeHash(instant=false,focus=false){
  const hash=decodeURIComponent(location.hash),figure=hash.match(/^#figure-(\d+\.\d+)$/);
  if(figure){openFigure(figure[1]);return;}
  closeDialogs();
  stopPlay();
  if(hash==='#figures'){showView('figures');window.scrollTo({top:0,left:0,behavior:'instant'});return;}
  const returning=state.view!=='spine';
  showView('spine');
  scrollToId(resolve(hash),instant||returning,focus);
  queueSpy();
}
function go(hash){history.pushState(null,'',hash);routeHash(false,true);}
function closeDialogs(){for(const dialog of $$('dialog'))if(dialog.open)dialog.close();}

/* Re-render the board a control belongs to, and keep keyboard focus on that control. */
function focusKey(control){
  if(control.id)return '#'+control.id;
  const entries=Object.entries(control.dataset);if(!entries.length)return null;
  return control.tagName.toLowerCase()+entries.map(([key,value])=>`[data-${key.replace(/[A-Z]/g,letter=>'-'+letter.toLowerCase())}="${value}"]`).join('');
}
function refresh(control){
  const section=control.closest('.vd-chapter');if(!section)return;
  const key=focusKey(control);renderBoard(Number(section.dataset.chapter));
  if(key)$(key,section)?.focus({preventScroll:true});
}

function clickHandler(event){
  const button=event.target.closest('button,a,[data-river-map],[data-year]');if(!button)return;
  const d=button.dataset;
  if(button.classList.contains('skip')){event.preventDefault();$('#workspace').focus();return;}
  if(d.close){document.getElementById(d.close).close();return;}
  if(d.figure){event.preventDefault();openFigure(d.figure,0,d.gallery==='true');return;}
  if(d.evidence){openEvidence(d.evidence);return;}
  if(d.riverEvidence){openRiverEvidence(d.riverEvidence);return;}
  if(d.goto==='figures'){go(state.view==='figures'?'#top':'#figures');return;}
  if(d.chapter||d.riverChapter){closeDialogs();go('#chapter-'+(d.chapter||d.riverChapter));return;}
  if(d.chapterFigures){$('#figure-chapter').value=d.chapterFigures;$('#figure-search').value='';state.figureLimit=16;go('#figures');return;}
  if(d.guess!==undefined||d.guessReset!==undefined){
    const section=button.closest('.vd-chapter'),id=Number(section.dataset.chapter),holder=$('[data-hunch-holder]',section);
    if(d.guess!==undefined)state.answers.set(id,Number(d.guess));else state.answers.delete(id);
    holder.innerHTML=hunch(id);
    ($('.vd-verdict',holder)||$('.vd-choices button',holder))?.focus({preventScroll:true});
    return;
  }
  if(button.classList.contains('vd-deeper-toggle')){
    const open=button.getAttribute('aria-expanded')!=='true';
    button.setAttribute('aria-expanded',String(open));document.getElementById(button.getAttribute('aria-controls')).hidden=!open;
    return;
  }
  if(d.variant){stopPlay();state.variants[d.variantKey]=d.variant;refresh(button);return;}
  if(d.riverMap){state.river=d.riverMap;refresh(button);return;}
  if(d.year!==undefined){state.year=Number(d.year);refresh(button);return;}
  if(d.impact!==undefined){stopPlay();state.impact=Number(d.impact);refresh(button);return;}
  if(d.revenue!==undefined){const index=Number(d.revenue);state.revenue=state.revenue===index?null:index;refresh(button);return;}
  if(d.complaint!==undefined){const index=Number(d.complaint);state.complaint=state.complaint===index?null:index;refresh(button);return;}
  if(d.action!==undefined){state.action=Number(d.action);refresh(button);return;}
  if(d.example!==undefined){state.evidenceCase=Number(d.example);refresh(button);return;}
  if(d.figurePart!==undefined){state.part=Number(d.figurePart);loadFigurePart();return;}
  if(button.id==='impact-play'){playImpact();$('#impact-play')?.focus({preventScroll:true});return;}
  const href=button.tagName==='A'?button.getAttribute('href')||'':'';
  if(href.startsWith('#')){event.preventDefault();closeDialogs();go(href);}
}

let drag=null,dragMoved=false;
function initPan(){const stage=$('#figure-stage');stage.addEventListener('pointerdown',e=>{dragMoved=false;if(state.zoom<=1||e.pointerType==='touch'||e.button!==0)return;drag={x:e.clientX,y:e.clientY,left:stage.scrollLeft,top:stage.scrollTop};stage.setPointerCapture(e.pointerId);stage.classList.add('dragging');});stage.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>4)dragMoved=true;stage.scrollLeft=drag.left-dx;stage.scrollTop=drag.top-dy;});const release=()=>{drag=null;stage.classList.remove('dragging');};stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);}
function init(){
  document.addEventListener('click',clickHandler);
  $('#figure-chapter').insertAdjacentHTML('beforeend',chapters.map(c=>`<option value="${c.id}">Chapter ${c.id} · ${mining.chapterNames[c.id]}</option>`).join(''));
  $('#figure-search').addEventListener('input',()=>renderFigures(true));$('#figure-chapter').addEventListener('change',()=>renderFigures(true));
  $('#figure-clear').addEventListener('click',()=>{$('#figure-search').value='';$('#figure-chapter').value='all';renderFigures(true);});
  $('#figure-more').addEventListener('click',()=>{const old=state.figureLimit;state.figureLimit+=16;renderFigures();$('#figure-grid').children[old]?.focus({preventScroll:true});});
  $('#figure-prev').addEventListener('click',()=>adjacentFigure(-1));$('#figure-next').addEventListener('click',()=>adjacentFigure(1));
  $('#zoom-in').addEventListener('click',()=>setZoom(state.zoom+.5));$('#zoom-out').addEventListener('click',()=>setZoom(state.zoom-.5));$('#zoom-fit').addEventListener('click',fitFigure);
  $('#figure-large').addEventListener('click',()=>{if(!dragMoved)setZoom(state.zoom===1?2:1);});
  $('#figure-dialog').addEventListener('close',()=>{if(location.hash.startsWith('#figure-'))history.replaceState(null,'',state.previousHash);});
  $('#motion-toggle').addEventListener('click',()=>updateMotion(!state.reduceMotion,true));
  document.addEventListener('keydown',e=>{
    if($('#figure-dialog').open){if(e.key==='ArrowRight'){e.preventDefault();adjacentFigure(1);}if(e.key==='ArrowLeft'){e.preventDefault();adjacentFigure(-1);}if(e.key==='+'||e.key==='='){e.preventDefault();setZoom(state.zoom+.5);}if(e.key==='-'){e.preventDefault();setZoom(state.zoom-.5);}return;}
    if((e.key==='Enter'||e.key===' ')&&e.target.matches('g[data-river-map],g[data-year]')){e.preventDefault();e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}
  });
  for(const dialog of $$('dialog'))dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
  window.addEventListener('popstate',()=>routeHash(true));
  window.addEventListener('scroll',queueSpy,{passive:true});
  window.addEventListener('resize',()=>{if($('#figure-dialog').open)fitFigure();queueSpy();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPlay();});
  initPan();
  let saved=null;try{saved=localStorage.getItem('thesis-motion');}catch{}
  const preferred=matchMedia('(prefers-reduced-motion: reduce)');state.reduceMotion=saved?saved==='off':preferred.matches;
  document.body.classList.toggle('reduce-motion',state.reduceMotion);
  $('#motion-toggle').textContent=state.reduceMotion?'Motion off':'Motion on';$('#motion-toggle').setAttribute('aria-pressed',String(!state.reduceMotion));
  preferred.addEventListener('change',e=>{let set=null;try{set=localStorage.getItem('thesis-motion');}catch{}if(!set)updateMotion(e.matches);});
  if('scrollRestoration' in history)history.scrollRestoration='manual';
  renderRail();renderSpine();routeHash(true);
}
init();
})();
