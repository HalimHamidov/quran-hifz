# Surat Al-Mulk Memorization Websites

Comparing AI-generated memorization tools for Surah Al-Mulk (Quran 67).

## Live Sites

| Version | URL |
|---|---|
| Landing | `https://halimhamidov.github.io/surat-almulk/` |
| Claude | `https://halimhamidov.github.io/surat-almulk/claude/` |
| Manus | `https://halimhamidov.github.io/surat-almulk/manus/` |
| ChatGPT | `https://halimhamidov.github.io/surat-almulk/chatgpt/` |
| Gemini | `https://halimhamidov.github.io/surat-almulk/gemini/` |

## Repo Structure

```text
surat-almulk/
├── index.html
├── README.md
├── chatgpt/
├── claude/
├── gemini/
└── manus/
```

## GitHub Pages Setup

1. Go to **Settings -> Pages**.
2. Source: `Deploy from a branch`, branch `main`, folder `/ (root)`.
3. Save. GitHub Pages serves all subfolders automatically.

## Offline Use

The landing page registers a service worker and web app manifest. After the site is opened once over `https://` or `localhost`, browsers can cache the landing page and version pages for offline use. On mobile, use the browser menu's install/Add to Home Screen action to save it like an app.

## Sources

- Arabic text: [Quran.com/67](https://quran.com/67)
- Russian explanations: [umma.ru](https://umma.ru/sura-67-al-mulk-vlast)
