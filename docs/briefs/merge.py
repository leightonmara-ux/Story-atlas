import json, glob, os, re
ROOT='/home/user/story-atlas/site'
OUT='AGENT_OUT_DIR'
cur=json.load(open(f'{ROOT}/content/curriculum.json'))
conc=json.load(open(f'{ROOT}/content/concordance.json'))
seqs=json.load(open(f'{ROOT}/content/sequences.json'))
diag_path=f'{ROOT}/content/diagrams.json'
diags=json.load(open(diag_path)) if os.path.exists(diag_path) else {}
lessons={l['id']:l for t in cur['tracks'] for l in t['lessons']}
problems=[]
for f in sorted(glob.glob(f'{OUT}/*.json')):
    if os.path.basename(f).startswith('example-'): continue
    d=json.load(open(f))
    for lid,summ in d.get('summaries',{}).items():
        if lid not in lessons: problems.append(f'unknown lesson {lid}'); continue
        md=f'{ROOT}/content/lessons/{lid}.md'; qz=f'{ROOT}/content/quiz/{lid}.json'
        if not (os.path.exists(md) and os.path.exists(qz)): problems.append(f'missing files {lid}'); continue
        lessons[lid]['summary']=summ; lessons[lid]['ready']=True
    for k,v in d.get('diagrams',{}).items(): diags[k]=v
    for s in d.get('sequences',[]):
        if s['title']=="Swain's motivation-reaction unit": continue
        if not any(x['title']==s['title'] for x in seqs): seqs.append(s)
    for row in d.get('concordance',[]):
        if row['lesson']=='propp': row['medium']='Folktale'
        if not any(r.get('lesson')==row['lesson'] for r in conc['frameworks']): conc['frameworks'].append(row)
# every diagram referenced in a ready lesson must exist
for lid,l in lessons.items():
    if l.get('ready'):
        for m in re.findall(r'\{\{diagram:([\w-]+)\}\}', open(f'{ROOT}/content/lessons/{lid}.md').read()):
            if m not in diags and m not in ('shared-core','aristotle','mckee','franklin'): problems.append(f'diagram {m} missing for {lid}')
# write curriculum in compact house style
out=['{','  "tracks": [']
for ti,t in enumerate(cur['tracks']):
    out.append('    {')
    for k in ('id','title','blurb'): out.append(f'      "{k}": {json.dumps(t[k],ensure_ascii=False)},')
    out.append('      "lessons": [')
    rows=[]
    for l in t['lessons']:
        if l.get('ready'): rows.append('        '+json.dumps(l,ensure_ascii=False,indent=2).replace('\n','\n        '))
        else: rows.append('        { '+', '.join(f'"{k}": {json.dumps(v,ensure_ascii=False)}' for k,v in l.items())+' }')
    out.append(',\n'.join(rows)); out.append('      ]'); out.append('    }'+(',' if ti<len(cur['tracks'])-1 else ''))
out+=['  ]','}','']
open(f'{ROOT}/content/curriculum.json','w').write('\n'.join(out))
json.dump(conc,open(f'{ROOT}/content/concordance.json','w'),ensure_ascii=False,indent=2)
json.dump(seqs,open(f'{ROOT}/content/sequences.json','w'),ensure_ascii=False,indent=2)
json.dump(diags,open(diag_path,'w'),ensure_ascii=False,indent=2)
# glossary additions and game scenarios
gl_path=f'{ROOT}/content/glossary.json'; gl=json.load(open(gl_path))
sc_path=f'{ROOT}/content/scenarios.json'; sc=json.load(open(sc_path)) if os.path.exists(sc_path) else []
have={t['term'].lower() for t in gl}; have_q={x['q'] for x in sc}
import unicodedata
for f in sorted(glob.glob(f'{OUT}/*.json')):
    if os.path.basename(f).startswith('example-'): continue
    d=json.load(open(f))
    for t in d.get('glossary',[]):
        t['lessons']=[l for l in t.get('lessons',[]) if l in lessons]
        if t['term'].lower() not in have: gl.append(t); have.add(t['term'].lower())
    for x in d.get('scenarios',[]):
        if len(x.get('choices',[]))==4 and 0<=x.get('answer',-1)<4 and x['q'] not in have_q and x.get('lesson') in lessons:
            sc.append(x); have_q.add(x['q'])
        elif x['q'] not in have_q: problems.append('bad scenario: '+x['q'][:50])
key=lambda t: unicodedata.normalize('NFD',t['term']).encode('ascii','ignore').decode().lower()
gl.sort(key=key)
json.dump(gl,open(gl_path,'w'),ensure_ascii=False,indent=2)
json.dump(sc,open(sc_path,'w'),ensure_ascii=False,indent=2)
print('glossary',len(gl),'scenarios',len(sc))
# case studies for the Examples tab
ex_path=f'{ROOT}/content/examples.json'; exs=json.load(open(ex_path)) if os.path.exists(ex_path) else []
for f in sorted(glob.glob(f'{OUT}/example-*.json')):
    e=json.load(open(f))['example']
    if not os.path.exists(f"{ROOT}/content/examples/{e['id']}.md"): problems.append('missing example file '+e['id']); continue
    e['lessons']=[l for l in e.get('lessons',[]) if l in lessons]
    exs=[x for x in exs if x['id']!=e['id']]+[e]
json.dump(exs,open(ex_path,'w'),ensure_ascii=False,indent=2); print('examples',len(exs))
ready=[l for l in lessons.values() if l.get('ready')]
print(f'ready {len(ready)}/{len(lessons)}; sequences {len(seqs)}; compare rows {len(conc["frameworks"])}; diagrams {len(diags)}')
print('not ready:', [l for l in lessons if not lessons[l].get('ready')])
print('problems:', problems)
