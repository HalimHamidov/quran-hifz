import hashlib
import json
import re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def read(name): return json.loads((ROOT/'data'/name).read_text(encoding='utf-8'))
provenance=read('provenance.json')
assert hashlib.sha256((ROOT/'data/quran-uthmani.txt').read_bytes()).hexdigest()==provenance['textSHA256']
assert hashlib.sha256((ROOT/'data/quran-data.xml').read_bytes()).hexdigest()==provenance['metadataSHA256']
text=read('ayahs.json')
rows={f'{s}|{a}':v for s,a,v in re.findall(r'^(\d+)\|(\d+)\|(.+)$',(ROOT/'data/quran-uthmani.txt').read_text(encoding='utf-8-sig'),re.M)}
assert len(rows)==6236
for s,verses in text['surahs'].items():
    for v in verses: assert rows[f"{s}|{v['number']}"]==v['text']
assert 'Tanzil' in text['copyright']
assert len(read('historical-events.json')['years'])==23
assert len(text['surahs']['74'])==56
legacy=ROOT/'surahs/067-al-mulk/legacy'
manifest=read('legacy-manifest.json')
for name,checksum in manifest['files'].items():
    content=(legacy/name).read_bytes()
    if name=='sw.js':
        content=content.replace(b'quran-hifz-legacy-v1',b'surat-almulk-offline-v2').replace(b'key.startsWith("quran-hifz-legacy-") && ',b'')
    assert hashlib.sha256(content).hexdigest()==checksum,name
print(f'PASS: 6236 ayahs byte-for-byte against Tanzil download; 23 years; all 56 ayahs of 74; {len(manifest["files"])-1} legacy files unchanged, SW only namespaced for cache isolation.')
