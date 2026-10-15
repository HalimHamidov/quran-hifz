// Keep the verified source intact; separate only its opening basmala visually.
export const BASMALA = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
export function splitBasmala(text, surah, ayah) {
  // Tanzil retains an initial shadda in surahs 95 and 97.
  const opening = [BASMALA, BASMALA.replace('بِ', 'بِّ')].find(value => text.startsWith(`${value} `));
  return Number(ayah) === 1 && Number(surah) !== 1 && Number(surah) !== 9 && opening
    ? {basmala: opening, verse: text.slice(opening.length + 1)}
    : {basmala: '', verse: text};
}
export function arabicHTML(text, surah, ayah, escape) {
  const {basmala, verse} = splitBasmala(text, surah, ayah);
  return basmala
    ? `<span class="basmala" style="display:block;margin-bottom:1em;font-size:.8em">${escape(basmala)}</span><span class="ayah-body" style="display:block">${escape(verse)}</span>`
    : escape(verse);
}
