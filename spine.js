/* The reading spine: nine chapters in three acts.
   Every figure quoted here is already reported in content.js / questions.js.
   `hunch` names a stop in field-guide.js; `photo` names a crop defined there. */
window.SPINE = {
  acts: [
    {id:'setup', roman:'I', title:'The setup', line:'Why sand, why these rivers, and how anyone can know.', chapters:[1,2,3]},
    {id:'rivers', roman:'II', title:'What the rivers show', line:'Four tests, from the whole region down to a single riverbed.', chapters:[4,5,6,7]},
    {id:'people', roman:'III', title:'Why it continues', line:'Who gains, who is heard, and what would have to change.', chapters:[8,9]}
  ],
  scenes: {
    1: {ask:'Why follow sand and gravel?', photo:'carrier',
        stat:'4', unit:'questions, one pathway', label:'From construction demand to extraction, to its impacts, to the institutions that respond.',
        next:'Start where the sand comes from.'},
    2: {ask:'Why dig here?', photo:'loading', hunch:'source',
        stat:'6', unit:'study rivers', label:'Each leaves the Shillong Plateau and drops its sand and gravel where the plain begins.',
        next:'Removed volumes are rarely recorded. So how can anyone measure what mining does?'},
    3: {ask:'How do we know?', photo:'pit',
        stat:'3', unit:'kinds of evidence', label:'Satellite images, river records and people’s accounts, matched by reach, season and event.',
        next:'First test: how far has extraction spread?'},
    4: {ask:'Is mining growing?', photo:'fan', hunch:'footprint',
        stat:'~4×', unit:'larger visible footprint', label:'About 260 hectares in 2000, about 1,000 in 2023. A surface area, not a volume.',
        next:'The footprint kept growing through a gravel ban. What happens where mining really stopped?'},
    5: {ask:'Can a river recover?', photo:'machinery', hunch:'recovery',
        stat:'94.5%', unit:'of the mined channel refilled', label:'By 2024 on the Lubha, against at least 23% of the floodplain pit area.',
        next:'The Lubha shows what stopping looks like. The Someshwari shows what continuing does.'},
    6: {ask:'What does mining change?', photo:'dredgers', hunch:'bed',
        stat:'~10 m', unit:'lower riverbed, at most', label:'At one surveyed section of the Someshwari, 2010–2024. A local maximum, not a reach average.',
        next:'One river is a case. Do other rivers show the same changes?'},
    7: {ask:'Does it happen on other rivers?', photo:'cutbars',
        stat:'1.4–3.9 m', unit:'lower water at the same low flow', label:'At four gauges on the Jadukata, Piyain and Sari-Gowain. The Lubha shows no lasting fall.',
        next:'The harm is measurable and widely recognized. So why does extraction continue?'},
    8: {ask:'Why does it continue?', photo:'towers', hunch:'voice',
        stat:'5 of 97', unit:'complaints addressed', label:'Formal complaint attempts in the Someshwari household survey, January 2024.',
        next:'What would management have to change?'},
    9: {ask:'What would help?', photo:'cargo',
        stat:'3', unit:'things to connect', label:'River limits, livelihood support and enforcement that works. None is enough alone.',
        next:''}
  }
};
