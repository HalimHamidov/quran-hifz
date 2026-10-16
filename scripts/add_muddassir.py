"""Rebuild Al-Muddassir card metadata and prompt plan; preserve translation and page."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = 'https://umma.ru/sura-74-al-muddassir-ukutavshijsya'
summaries = [
    'Обращение к укрывшемуся одеждой Пророку: поддержка в начале его миссии.',
    'Повеление встать и предостерегать; наставление побуждает работать и над собой.',
    'Возвеличивать Господа, чаще поминая Его и укрепляя веру.',
    'Заботиться о чистоте одежды и внутренней чистоте даже в трудностях.',
    'Отдаляться от язычества, безбожия и дурных качеств, очищая душу.',
    'Делать добро бескорыстно, без расчёта получить больше взамен.',
    'Ради Господа терпеливо преодолевать трудности, сдерживая гнев.',
    'Звук Горна возвещает тяжёлый День; готовиться следует заранее.',
    'Звук Горна возвещает тяжёлый День; готовиться следует заранее.',
    'Для отвергающих веру этот День будет особенно тяжёлым.',
]
titles = ['Укутавшийся','Встань и предостерегай','Возвеличивай Господа','Очищай одежду','Сторонись скверны','Добро без расчёта','Терпение ради Господа','Звук Горна','Тяжёлый День','Нелёгкий для неверующих']
hooks = ['Сложенное покрывало — опора для обращения к укутавшемуся; Пророк не изображён.', 'Встать с места и предупредить — перейти к ответственному действию.', 'Молитвенное место среди гор напоминает о возвеличивании Творца; пейзаж не изображает Его.', 'Очищение одежды напоминает также о внутренней чистоте.', 'Отвернуться от скверны — не только вымыть руки, но менять дурные качества.', 'Передать хлеб, не ожидая платы или ответного дара.', 'Продолжать полезное дело в трудную погоду — условный образ терпения.', 'Горн — условный зрительный якорь; его действительный облик неизвестен.', 'Тяжесть камня — условная ассоциация с тяжестью Дня, не картина Судного дня.', 'Закрытый тяжёлый проход — условное напоминание о трудности для отвергающих веру.']
scenes = [
    'A thick woven cream blanket carefully folded on an empty simple resting bench in a quiet modest room, rich textile folds filling foreground, natural early light. Absolutely no person or silhouette beneath the blanket. This mnemonic refers to the address to the wrapped Prophet without depicting him or a revelation event.',
    'A fictional contemporary adult rising from a plain bench, gently holding up an open palm to warn another adult approaching an unsafe broken pavement edge. Clear caring warning gesture, ordinary town, no historical or sacred characters.',
    'A simple unoccupied prayer mat on a rocky terrace overlooking immense believable mountains under a vast natural dawn sky. Reverence and remembrance of the Creator, never show God, no divine light or being, no worship of nature.',
    'Close realistic still life of plain white clothing being washed in clear water in a stone basin, only fabric and flowing water, no body, beautiful material details, visual anchor is purification of clothing.',
    'A fictional contemporary adult seen from behind decisively walking away from a neglected grimy courtyard into a clean open walkway. Leaving filth as a limited mnemonic for rejecting spiritual impurity and bad qualities, not a claim that dirt equals unbelief.',
    'Close realistic view of ordinary contemporary hands freely passing a fresh loaf of bread to another pair of hands over a humble kitchen table, no money, no payment, no luxury reward, clear selfless giving.',
    'A fictional contemporary gardener calmly continues tending a young sapling in steady rain, ordinary raincoat and muddy boots, patient constructive care despite difficulty, no miracle, credible anatomy and weather.',
    'One simple unadorned curved brass horn resting alone on rough dark stone, dramatic natural side lighting, no player, no angel, no sky apparition. Merely an earthly mnemonic object for the sounding of the Horn, not its actual unseen form.',
    'An immense rough heavy boulder pressing into dry earth, solemn overcast natural sky, extreme realistic stone weight and texture. Purely earthly visual metaphor of a difficult Day, no actual resurrection or cosmic destruction.',
    'A narrow steep stone passage ending at a massive closed weathered wooden gate, austere difficult approach in deep natural shadow, no people, no hellfire, no monsters. Earthly metaphor for hardship, not literal depiction of the Last Day or judgment of any pictured person.',
]
base = 'Create one cinematic photorealistic educational illustration, landscape 3:2. Believable materials, anatomy and physics, warm gold highlights, deep natural shadows, a clear single visual anchor. This is a symbolic memory association for Quran 74:{ayah}, not literal tafsir or historical reconstruction. Scene: {scene} No text, letters, numbers, labels, collage, logos, watermarks. Never depict Allah, prophets, angels, divine hands, eyes, faces or supernatural beams. '
cards = []
for i in range(1,11):
    cards.append(dict(from_=i,to=i,prayer='Аят '+str(i),title=titles[i-1],keyword=titles[i-1],hook=hooks[i-1],image=f'al-muddassir/ayah-{i:02}.webp',imageAlt=hooks[i-1],symbolism='Художественная ассоциация, не буквальное изображение сокровенного.'))
    cards[-1]['from'] = cards[-1].pop('from_')
notice = json.loads((ROOT/'data/al-muddassir.json').read_text(encoding='utf-8'))['notice']
content = dict(surah=74,title='Аль-Муддассир — Укутавшийся',translationURL=SOURCE,history='Начало суры соединяет поддержку Пророка с призывом действовать; затем — очищение, бескорыстие, терпение и ответственность перед Судным днём. Это первые десять аятов, а не изложение всей суры.',notice=notice,cards=cards)
entries = [dict(from_=i,to=(9 if i==8 else i),text=summaries[i-1]) for i in range(1,11) if i!=9]
for e in entries:e['from']=e.pop('from_')
def write(path,data):
    (ROOT/path).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
write(Path('data/al-muddassir.json'),content)
write(Path('data/al-muddassir-visual-plan.json'),dict(surah=74,source=SOURCE,method='Сначала изучены пояснения Umma.ru, затем составлены смысловые опоры и отдельные промпты. Аяты 8–9 в источнике объединены.',scope='Только аяты 1–10 из 56. Остальные аяты не иллюстрируются.',generator='Built-in image_gen',cards=cards,prompts=[dict(ayah=i,tafsir=summaries[i-1],prompt=base.format(ayah=i,scene=scenes[i-1])) for i in range(1,11)]))
print('Built card metadata and prompt plan; supplied translation and presentation preserved')
