"""Import verbatim Quran text and metadata from Tanzil. No generated ayahs."""
import hashlib
import json
import re
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'data'
DATA.mkdir(exist_ok=True)
URL = 'https://tanzil.net/pub/download/index.php?quranType=uthmani&outType=txt-2&agree=true'

def download(url):
    with urllib.request.urlopen(url, timeout=60) as response:
        return response.read()

def write(name, value):
    (DATA / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

raw = download(URL)
(DATA / 'quran-uthmani.txt').write_bytes(raw)
text = raw.decode('utf-8-sig')
verses = {}
for line in text.splitlines():
    match = re.match(r'^(\d+)\|(\d+)\|(.+)$', line)
    if match:
        s, a, arabic = match.groups()
        verses.setdefault(s, []).append({'number': int(a), 'text': arabic})
assert len(verses) == 114 and sum(map(len, verses.values())) == 6236
metadata_raw = download('https://tanzil.net/res/text/metadata/quran-data.xml')
(DATA / 'quran-data.xml').write_bytes(metadata_raw)
metadata = ET.fromstring(metadata_raw)
surahs = []
for node in metadata.find('suras'):
    d = node.attrib
    surahs.append({'id': int(d['index']), 'name': d['name'], 'latin': d['tname'],
                   'meaning': d['ename'], 'count': int(d['ayas']),
                   'period': d['type'], 'order': int(d['order'])})
for s in surahs:
    assert len(verses[str(s['id'])]) == s['count']
notice = text[text.find('#'):] if '#' in text else ''
assert 'Tanzil' in notice
(DATA / 'TANZIL-LICENSE.txt').write_text(notice, encoding='utf-8')
write('ayahs.json', {'source': 'https://tanzil.net', 'license': 'CC BY 3.0; verbatim text only',
                     'copyright': notice, 'surahs': verses})
write('surahs.json', surahs)
write('revelation-order.json', {'source': 'https://tanzil.net/docs/revelation_order',
      'note': 'Traditional order of the first revelations, not dates of complete surahs.',
      'traditional': [s['id'] for s in sorted(surahs, key=lambda s: s['order'])],
      'personalStart': [96, 74, 68, 73, 1]})
write('provenance.json', {'textURL': URL, 'textSHA256': hashlib.sha256(raw).hexdigest(),
                         'metadataURL': 'https://tanzil.net/res/text/metadata/quran-data.xml',
                         'metadataSHA256': hashlib.sha256(metadata_raw).hexdigest()})
print(f'Imported {len(surahs)} surahs, 6236 verbatim ayahs. SHA256: {hashlib.sha256(raw).hexdigest()}')
