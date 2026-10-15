"""Original symbolic vector illustrations. No generated Quran lettering or human figures."""
from pathlib import Path
import urllib.request
ROOT = Path(__file__).resolve().parents[1]
images = ROOT / 'assets/images'
images.mkdir(parents=True, exist_ok=True)
scenes = {
 'dawn': '<circle cx="465" cy="208" r="73" fill="#d8b778" opacity=".85"/><path d="M0 340 110 236 212 312 335 182 500 340 625 244 800 350V500H0Z" fill="#22354b"/><path d="M0 420 170 310 330 405 510 300 800 428V500H0Z" fill="#14283d"/><path d="M0 470Q250 365 800 450" stroke="#d8b778" opacity=".3" fill="none"/>',
 'path': '<circle cx="610" cy="120" r="48" fill="#d8b778" opacity=".75"/><path d="M0 300Q160 205 360 310T800 260V500H0Z" fill="#22354b"/><path d="M0 430Q250 285 800 390V500H0Z" fill="#14283d"/><path d="M370 500Q510 410 390 370T415 285" fill="none" stroke="#d8b778" stroke-width="5" opacity=".65"/>',
 'moon': '<circle cx="430" cy="180" r="90" fill="#d8b778"/><circle cx="467" cy="148" r="82" fill="#102339"/><path d="M0 420 170 360 340 435 550 350 800 410V500H0Z" fill="#1d3148"/><g fill="#d8b778" opacity=".65"><circle cx="150" cy="130" r="2"/><circle cx="650" cy="220" r="2"/><circle cx="280" cy="70" r="2"/><circle cx="700" cy="70" r="2"/><circle cx="300" cy="290" r="2"/></g>',
 'balance': '<g stroke="#d8b778" fill="none" stroke-width="4"><path d="M400 110V390M270 395H530M235 170H565M250 170 190 300H310ZM550 170 490 300H610Z"/><circle cx="400" cy="150" r="12" fill="#d8b778"/></g><ellipse cx="400" cy="430" rx="215" ry="12" fill="#d8b778" opacity=".08"/>',
 'book': '<path d="M160 190Q280 135 400 207 520 135 640 190V360Q520 305 400 377 280 305 160 360Z" fill="#20364d" stroke="#d8b778" stroke-width="3"/><path d="M400 207V377" stroke="#d8b778" stroke-width="2"/><path d="M185 160Q280 115 380 170M420 170Q520 115 615 160" fill="none" stroke="#d8b778" opacity=".3"/><circle cx="400" cy="95" r="3" fill="#d8b778"/>'}
for name, scene in scenes.items():
    (images / f'{name}.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500"><rect width="800" height="500" fill="#102339"/>{scene}</svg>\n', encoding='utf-8')
fonts = ROOT / 'assets/fonts'
fonts.mkdir(exist_ok=True)
for url, name in [
 ('https://raw.githubusercontent.com/google/fonts/main/ofl/amiri/Amiri-Regular.ttf','Amiri-Regular.ttf'),
 ('https://raw.githubusercontent.com/google/fonts/main/ofl/amiri/OFL.txt','OFL.txt')]:
    with urllib.request.urlopen(url, timeout=45) as response:
        (fonts/name).write_bytes(response.read())
print('5 original SVGs; locally hosted Amiri font and OFL license.')
