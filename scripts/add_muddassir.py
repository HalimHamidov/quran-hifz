"""Build the first ten Al-Muddassir cards using existing Al-Alaq presentation."""
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
notice = 'Арабский оригинал — неизменённый Tanzil. Пояснения — краткий авторский пересказ по переводу и комментариям Шамиля Аляутдинова на Umma.ru, не дословный перевод. Изображения ИИ — условные опоры памяти, не исторические сцены и не буквальное изображение сокровенного. Представлены только аяты 1–10 из 56.'
content = dict(surah=74,title='Аль-Муддассир — Укутавшийся',translationURL=SOURCE,history='Начало суры соединяет поддержку Пророка с призывом действовать; затем — очищение, бескорыстие, терпение и ответственность перед Судным днём. Это первые десять аятов, а не изложение всей суры.',notice=notice,cards=cards)
entries = [dict(from_=i,to=(9 if i==8 else i),text=summaries[i-1]) for i in range(1,11) if i!=9]
for e in entries:e['from']=e.pop('from_')
def write(path,data):
    (ROOT/path).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
write(Path('data/al-muddassir.json'),content)
write(Path('data/al-muddassir-tafsir.json'),dict(source=SOURCE,basmala='',entries=entries))
write(Path('data/al-muddassir-visual-plan.json'),dict(surah=74,source=SOURCE,method='Сначала изучены пояснения Umma.ru, затем составлены смысловые опоры и отдельные промпты. Аяты 8–9 в источнике объединены.',scope='Только аяты 1–10 из 56. Остальные аяты не иллюстрируются.',generator='Built-in image_gen',cards=cards,prompts=[dict(ayah=i,tafsir=summaries[i-1],prompt=base.format(ayah=i,scene=scenes[i-1])) for i in range(1,11)]))
target=ROOT/'surahs/074-al-muddassir'
target.mkdir(exist_ok=True)
js=(ROOT/'surahs/096-al-alaq/page.js').read_text(encoding='utf-8')
js=js.replace('al-alaq-translation','al-muddassir-tafsir').replace('al-alaq','al-muddassir').replace('1.0.0.6','1.0.0.7').replace('96','74').replace('Аль-Аляк','Аль-Муддассир').replace('Перевод смыслов ·','Пояснение по Umma.ru ·').replace('Шамиль Аляутдинов · Umma.ru','Источник: Шамиль Аляутдинов · Umma.ru').replace('19 аятов','10 аятов').replace('ayah===1?', 'ayah===1&&translation.basmala?').replace('эти два аята переведены совместно', 'эти два аята объединены; пояснение относится к обоим').replace("verses=allTexts['74'];","verses=allTexts['74'].slice(0,10);")
(target/'page.js').write_text(js,encoding='utf-8')
html=(ROOT/'surahs/096-al-alaq/index.html').read_text(encoding='utf-8')
html=html.replace('096-al-alaq','074-al-muddassir').replace('Аль-Аляк','Аль-Муддассир').replace('العلق','المدثر').replace('/96/','/74/').replace('Сура 96','Сура 74').replace('1.0.0.6','1.0.0.7').replace('0 / 19','0 / 10').replace('19 аятов — 19 образов','Аяты 1–10 — 10 образов').replace('Все 19 сцен','Все 10 сцен')
start=html.index('      <div class="hero-content">');end=html.index('      <div class="hero-foot">')
html=html[:start]+'''      <div class="hero-content"><p class="eyebrow">Сура 74 · Мекканская · 56 аятов · здесь 1–10</p><p class="surah-name" lang="ar" dir="rtl">المدثر</p><h1 id="title">Сура Аль-Муддассир</h1><p class="subtitle">Встань. Очищайся. Будь терпелив.</p><p class="intro">Первые десять аятов по порядку мусхафа: пояснения по Umma.ru и десять отдельных образов для памяти.</p><div class="actions"><a class="button primary" href="#cards">К аятам 1–10 ↓</a><a class="button" href="../../#surah/74/1">Тренажёр хифза →</a></div></div>
'''+html[end:]
start=html.index('    <section class="history-section');end=html.index('    <section class="wrap gallery-section')
html=html[:start]+'''    <section class="history-section wrap" aria-labelledby="history-title"><p class="eyebrow">Смысловая связь</p><h2 id="history-title">От призыва к ответственности</h2><p id="history-text"></p><p>Пояснения ниже — краткий пересказ, а не дословный перевод. В источнике аяты 8–9 объединены. Полный тафсир доступен по ссылке в каждой карточке.</p></section>
'''+html[end:]
start=html.index('    <section class="wrap closing');end=html.index('    <section class="wrap sources')
html=html[:start]+'''    <section class="wrap closing"><h2>Продолжение суры</h2><p>На этой странице только аяты 1–10 из 56. Вся сура продолжает тему ответственности, отрицания знамений и предостережения. Арабский текст остальных аятов доступен в тренажёре.</p><a class="button" href="../../#surah/74/11">Продолжить с аята 11 →</a></section>
'''+html[end:]
html=html.replace('https://umma.ru/sura-96-al-alyak-sgustok-krovi',SOURCE).replace('источник перевода','пояснение и ссылка на источник').replace('Аль-Муддассир: 19 аятов, 19 отдельных визуальных карточек, история первого откровения и повторение по пяти намазам.','Аль-Муддассир, сура 74: пояснения по Umma.ru и 10 отдельных иллюстраций для аятов 1–10.')
(target/'index.html').write_text(html,encoding='utf-8')
(target/'page.css').write_text((ROOT/'surahs/096-al-alaq/page.css').read_text(encoding='utf-8').replace('../../assets/images/al-alaq-hira.webp','../../assets/images/al-muddassir/ayah-01.webp'),encoding='utf-8')
print('Built 10 cards and prompt plan')
