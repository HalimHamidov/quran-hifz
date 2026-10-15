# Current Compaction

Date: `2026-10-15`

## Current Goal

- Add the exact user-provided Umma Al-Alaq translation to all 19 posters; preserve brackets, paired ranges, separate basmala and source footnotes.

## Completed

- v1.0.0.5 is published. Translation release v1.0.0.6 is pushed on `fix/alaq-translation` (`41c6850`); PR and publication remain pending.
- 19 posters, 19 distinct generated WebP images, shared per-ayah counters/audio/memory fund, fullscreen and offline images.
- Reusable `docs/AYAH_VISUAL_PROMPT.md`, 19 individual prompts in `data/al-alaq-visual-plan.json`, 17 exact user-provided translation ranges covering all 19 ayahs and Umma source links.
- Original mulk and legacy contents preserved.

## Verified Facts

- 19 tests pass; all 6 236 Tanzil ayahs verified. Translation matches the supplied text on all 19 posters; mobile and offline checks pass. Brackets, paired ranges 9–10 and 11–12, separate basmala, and source footnotes 5/19 are preserved.
- Local and production browser checks PASS: all19 distinct decoded images, exact Arabic, full modal gallery, recall, isolated per-ayah counters, reload/shared progress, mobile and offline images. Local cross-tab audio cancellation also PASS.

## Assumptions

- Preserve the supplied translation exactly; keep author notes separate.

## Risks Or Blockers

- Translation is provided and locally verified; production verification of v1.0.0.6 remains pending.
- Generated scenes are symbolic artistic associations, not historical photographs.
- Other historical/editorial coverage remains partial.

## Important Files

- `surahs/096-al-alaq/`; `assets/images/al-alaq/`; `data/al-alaq.json`; `data/al-alaq-translation.json`; `data/al-alaq-visual-plan.json`.
- `docs/AYAH_VISUAL_PROMPT.md`; `README.md`; `docs/IMPLEMENTATION.md`; `docs/RIGHTS.md`; `CHANGELOG.md`.

## Exact Next Step

1. Finish documentation sync, create PR against main, then publish and verify v1.0.0.6.

## Handoff Summary

Al-Alaq's 19-image update is live and production-verified. PNG posters are saved in F:/Code/67mulk/sura_al_alaq_images/01.png through19.png; originals at assets/images/al-alaq/ayah-01.webp through ayah-19.webp. Built-in imagegen used; prompt set saved. All 19 PNG exports have been refreshed with the supplied translation; v1.0.0.6 is locally verified and awaits publication. Preserve original mulk and shared progress.
