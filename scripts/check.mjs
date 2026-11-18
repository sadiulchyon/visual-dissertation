import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const context={window:{}};vm.createContext(context);
for(const file of ['figures.js','sources.js','content.js','questions.js','media.js','field-guide.js','spine.js','river-model.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
new vm.Script(fs.readFileSync(path.join(root,'app.js'),'utf8'),{filename:'app.js'});
const {FIGURES:figures,SOURCE:source,CONTENT:content}=context.window;
const mining=context.window.MINING;
assert.equal(figures.length,81);
assert.equal(new Set(figures.map(f=>f.id)).size,81);
assert.equal(content.chapters.length,9);
assert.equal(content.rivers.length,6);
assert.equal(mining.questions.length,8);
const questionIds=new Set(mining.questions.map(q=>q.id));
assert.equal(questionIds.size,8);
for(const q of mining.questions){
  assert.ok(content.evidence[q.evidence]);
  for(const id of q.chapters)assert.ok(content.chapters.some(c=>c.id===id));
  for(const id of q.figures)assert.ok(figures.some(f=>f.id===id));
  for(const id of q.related)assert.ok(questionIds.has(id));
}
for(let id=1;id<=9;id++)assert.ok(mining.chapterVisuals[id]);
assert.equal(mining.revenue.reduce((total,item)=>total+item.value,0),100);
let separate=0,parts=0;
for(const figure of figures){
  assert.ok(figure.caption.startsWith(`Figure ${figure.id}`));
  assert.ok(figure.parts.length>0);
  for(const part of figure.parts){
    for(const key of ['src','thumb','original'])assert.ok(fs.existsSync(path.join(root,part[key])),`Missing ${part[key]}`);
    parts++;
    if(part.origin==='Separate figure file')separate++;
  }
}
assert.equal(separate,63);assert.equal(parts,84);
const figureIds=new Set(figures.map(f=>f.id));
const {FIELD_GUIDE:guide,SPINE:spine,RIVER_MODEL:model}=context.window;
const stopIds=new Set(guide.stops.map(stop=>stop.id));
assert.equal(stopIds.size,6);
assert.equal(new Set(guide.stops.map(stop=>stop.model).filter(Boolean)).size,2);
for(const [key,photo] of Object.entries(guide.photos)){
  const figure=figures.find(f=>f.id===photo.figure),part=figure?.parts[0];
  assert.ok(part && figure.caption.includes(`(${photo.panel})`),`Unknown photo panel ${key}`);
  const [x,y,w,h]=photo.box;
  assert.ok(x>=0 && y>=0 && w>0 && h>0 && x+w<=part.width && y+h<=part.height,`Crop outside original: ${key}`);
}
for(const stop of guide.stops){
  assert.ok(guide.photos[stop.photo] && figureIds.has(stop.figure) && content.evidence[stop.evidence],stop.id);
  assert.ok(questionIds.has(stop.question) && content.chapters.some(chapter=>chapter.id===stop.chapter),stop.id);
  assert.ok(stop.choices[stop.best] && (!stop.model || figureIds.has(model.modes[stop.model]?.ref)),stop.id);
}
/* The reading spine: three acts cover chapters 1–9 once each; every chapter has a photo, a headline number and a hand-off. */
assert.equal(spine.acts.length,3);
assert.equal(spine.acts.flatMap(act=>act.chapters).join(','),'1,2,3,4,5,6,7,8,9');
for(const chapter of content.chapters){
  const scene=spine.scenes[chapter.id];
  assert.ok(scene && scene.ask && scene.stat && scene.unit && scene.label,`Chapter ${chapter.id}: incomplete scene`);
  assert.ok(guide.photos[scene.photo],`Chapter ${chapter.id}: unknown photo`);
  assert.ok(!scene.hunch || stopIds.has(scene.hunch),`Chapter ${chapter.id}: unknown guess`);
  assert.ok(chapter.id===9 || scene.next,`Chapter ${chapter.id}: missing hand-off`);
}
assert.equal(new Set(Object.values(spine.scenes).map(scene=>scene.photo)).size,9,'Each chapter should open on its own photograph');
for(const id of questionIds)assert.ok(stopIds.has(guide.questionStops[id]),id);
for(const chapter of content.chapters)assert.ok(stopIds.has(guide.chapterStops[chapter.id-1]),chapter.id);
for(const chapter of content.chapters){
  for(const id of chapter.figures)assert.ok(figureIds.has(id),`Chapter ${chapter.id}: missing figure ${id}`);
  assert.ok(content.evidence[chapter.evidence]);
}
for(const [key,item] of Object.entries(content.evidence)){
  for(const id of item.figures||[])assert.ok(figureIds.has(id),`${key}: missing figure ${id}`);
  for(const id of item.paragraphs||[])assert.ok(source.excerpts[id],`${key}: missing source paragraph ${id}`);
  if(item.table)assert.ok(source.tables[item.table],`${key}: missing table ${item.table}`);
}
for(const river of content.rivers){
  for(const id of river.sources)assert.ok(source.excerpts[id],`${river.id}: missing source paragraph ${id}`);
}
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const htmlIds=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(htmlIds).size,htmlIds.length,'Duplicate HTML IDs');
for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){
  const href=match[1];
  if(href.startsWith('#')){
    assert.ok(htmlIds.includes(href.slice(1))||href.startsWith('#question-')&&questionIds.has(href.slice(10)),`Missing anchor ${href}`);
  }else if(!href.includes('://')){
    assert.ok(fs.existsSync(path.join(root,href)),`Missing local asset ${href}`);
  }
}
assert.equal(source.tables['8A.4Complaints'].at(-1)[4],'5');
assert.equal(source.tables['8A.4Complaints'].at(-1)[5],'97');
assert.ok(!html.match(/https?:\/\//),'The site should work without third-party requests');
console.log('Verified: 3 acts and 9 chapter scenes; cited photo panels and bounds; 2 conceptual 3D views; 6 rivers; 81 figures; 84 image parts; 63 separate high-resolution files; sources, tables and asset paths.');
