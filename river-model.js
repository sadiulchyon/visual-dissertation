window.RIVER_MODEL = (() => {
  const modes = {
    incision: {
      title:'Look below the waterline', states:['Shallower channel','Incised channel'],
      notes:['Water sits closer to the height of the banks.','A deeper bed can carry the same discharge at a lower water level.'],
      ref:'6.6', limit:'The block illustrates the mechanism. Its heights and shapes are not survey measurements.'
    },
    infill: {
      title:'Where can fresh gravel reach?', states:['Excavated pits','After replenishment'],
      notes:['Pits interrupt the bed and the land beside it.','Sediment carried by the river can refill channel pits while hollows remain beyond the bank.'],
      ref:'5.10', limit:'The block illustrates selective infill. Its shapes and timing are not a reconstruction of Lubha.'
    }
  };
  const clamp = value => Math.min(1, Math.max(0, value));
  const blend = (low, high, fraction) => `rgb(${low.map((value,index)=>Math.round(value+(high[index]-value)*clamp(fraction))).join(',')})`;
  const edges = coordinate => -0.05+0.11*Math.sin(coordinate*2.2+0.5);
  function graphic(mode,progress,turn){
    const angle=(29+turn*35)*Math.PI/180, cos=Math.cos(angle), sin=Math.sin(angle);
    const project=([cross,along,height])=>[(310+180*(cross*cos-along*sin)).toFixed(1),(153+70*(cross*sin+along*cos)-122*height).toFixed(1)].join(',');
    const polygon=(points,color,stroke=color,width=.65)=>`<polygon points="${points.map(project).join(' ')}" fill="${color}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round"/>`;
    const line=(points,color,width,dash='')=>`<polyline points="${points.map(project).join(' ')}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
    const incising=mode==='incision',surface=incising ? .28-progress*.19 : .26;
    const gaussian=(distance,spread)=>Math.exp(-Math.pow(distance/spread,2));
    function land(cross,along){
      const distance=cross-edges(along),valley=gaussian(distance,.385);
      const ripple=.014*Math.sin(14*cross+along*4)*Math.cos(12*along-cross*3);
      let height=.49-.41*valley+ripple+.045*Math.cos(4*along+cross*3)*(1-valley);
      if(incising)height-=progress*.30*gaussian(distance,.29);
      else height-=(1-progress*.94)*.24*gaussian(distance,.18)*(.75+.25*Math.cos(along*15))+.26*gaussian(cross-.68,.145)*gaussian(along-.30,.35)+.20*gaussian(cross-.61,.1)*gaussian(along+.47,.18);
      return height;
    }
    const bed=(cross,along)=>[cross,along,land(cross,along)];
    const bottom=-.48,segments=28,dy=2/segments,terrain=[],waterlines=[];
    let forms='';
    const tint=(cx,cy)=>{const value=land(cx,cy); const light=clamp(.48+1.5*(land(cx-.035,cy-.04)-value)+.12*Math.sin(cx*24+cy*18)+.08*Math.cos(cy*21));if(value<surface-.005)return blend([30,100,108],[77,155,149],light);if(value<.37)return blend([179,144,93],[224,199,143],light);return blend([121,145,96],[187,189,126],light);};
    for(let row=0;row<segments;row++)for(let col=0;col<segments;col++){
      const left=-1+col*dy, far=-1+row*dy,right=left+dy,near=far+dy,cx=left+dy/2,cy=far+dy/2;
      const vertices=[[left,far],[right,far],[right,near],[left,near]];
      const points=vertices.map(([x,y])=>[x,y,Math.max(land(x,y),surface)]);
      terrain.push([cx*sin+cy*cos,polygon(points,tint(cx,cy))]);
    }
    terrain.sort((first,second)=>first[0]-second[0]);forms+=terrain.map(item=>item[1]).join('');
    for(let run=0;run<18;run++){
      const along=-.88+run*.1, offset=.13*Math.sin(run*12.1);
      waterlines.push(line([0,.065,.13].map(delta=>[edges(along+delta)+offset,along+delta,surface+.004]),'#a1d8cc',1));
    }
    forms+=waterlines.join('');
    const wall=(start,end,right)=>{
      const position=(fraction,height)=>[start[0]+(end[0]-start[0])*fraction,start[1]+(end[1]-start[1])*fraction,height];
      const top=Array.from({length:segments+1},(_,index)=>{const [x,y]=position(index/segments,0);return bed(x,y);});
      let face=polygon([...top,position(1,bottom),position(0,bottom)],right?'#ae855d':'#c49c6e');
      const rocks=Array.from({length:segments+1},(_,index)=>{const [x,y]=position(index/segments,0);return [x,y,-.31+.023*Math.sin(x*5+y*4)];});
      face+=polygon([...rocks,position(1,bottom),position(0,bottom)],right?'#90704f':'#a88259');
      for(let layer=0;layer<6;layer++){
        const stratum=top.map(([x,y,height])=>[x,y,Math.min(height-.004,bottom+.065+layer*.102+.018*Math.sin(x*5+y*4+layer*.5))]);
        face+=line(stratum,right?'#896a52':'#a77c54',layer%2===0?1.4:.7);
      }
      for(let n=0;n<segments;n++){
        const first=top[n],last=top[n+1];if(first[2]>=surface&&last[2]>=surface)continue;
        const level=point=>[point[0],point[1],Math.max(point[2],surface)];
        face+=polygon([first,last,level(last),level(first)],right?'#39878b':'#479b9c');
      }
      face+=line(top,'#75684d',1);return face;
    };
    forms+=wall([1,-1],[1,1],true)+wall([-1,1],[1,1],false);
    if(incising&&progress>.01){const guide=Array.from({length:13},(_,index)=>[edges(1)-.21+index*.035,1,.28]);forms+=line(guide,`rgba(246,247,221,${progress})`,1.9,'4 4');}
    return `<svg viewBox="20 6 580 330" role="img" aria-label="Oblique three-dimensional cutaway of a river, showing water, its bed and sediment layers"><ellipse cx="317" cy="271" rx="190" ry="20" fill="#112d2c" opacity=".23"/>${forms}</svg>`;
  }
  const motion=new WeakMap();
  function mount(host,mode){
    if(!modes[mode])return;
    const data=modes[mode];
    host.innerHTML=`<div class="model-title"><div><span class="atlas-tag">3D CUTAWAY · CONCEPTUAL</span><h3>${data.title}</h3></div><button type="button" data-turn aria-pressed="false" aria-label="Turn the 3D view">⟳ Turn view</button></div><div class="model-surface">${graphic(mode,0,0)}</div><div class="model-legend"><span>Water</span><span>Riverbed & sediment</span></div><div class="model-steps" role="group" aria-label="Compare river states">${data.states.map((name,index)=>`<button type="button" data-model-step="${index}" aria-pressed="${index===0}">${name}</button>`).join('')}</div><p class="model-reading" aria-live="polite">${data.notes[0]}</p><small>${data.limit} <button data-figure="${data.ref}">See Fig. ${data.ref} ↗</button></small>`;
    const state={step:0,turn:0,current:0,angle:0,tick:0};motion.set(host,state);
    host.onclick=event=>{const control=event.target.closest('[data-model-step],[data-turn]');if(!control)return;
      if(control.hasAttribute('data-turn')){state.turn=1-state.turn;control.setAttribute('aria-pressed',String(Boolean(state.turn)));}
      else {state.step=Number(control.dataset.modelStep);host.querySelectorAll('[data-model-step]').forEach(button=>button.setAttribute('aria-pressed',String(+button.dataset.modelStep===state.step)));host.querySelector('.model-reading').textContent=data.notes[state.step];}
      const start=performance.now(),from=state.current,angle=state.angle;cancelAnimationFrame(state.tick);
      const draw=now=>{if(!host.isConnected||host.closest('[hidden]')||motion.get(host)!==state)return;
        const phase=document.body.classList.contains('reduce-motion')?1:clamp((now-start)/780),ease=phase*phase*(3-2*phase);
        state.current=from+(state.step-from)*ease;state.angle=angle+(state.turn-angle)*ease;
        host.querySelector('.model-surface').innerHTML=graphic(mode,state.current,state.angle);
        if(phase<1)state.tick=requestAnimationFrame(draw);};draw(start);
    };
  }
  return {mount,modes};
})();
