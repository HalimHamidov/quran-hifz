# Surah Al-Mulk Memorization System 🌙

Интерактивная система запоминания Суры Аль-Мульк (67-я сура Корана) с 30 аятами, разделенными на 10 блоков по 3 аята в каждом, распределенными по 5 ежедневным намазам.

**An interactive memorization system for Surah Al-Mulk (Chapter 67 of the Quran) with 30 verses divided into 10 blocks of 3 verses each, distributed across the 5 daily prayers.**

---

## 🎯 Features | Возможности

✅ **Single-file HTML** - No dependencies, no backend required
✅ **Beautiful Islamic Design** - Dark royal blue, gold accents, soft green
✅ **10 Prayer-based Blocks** - Fajr, Dhuhr, Asr, Maghrib, Isha (2 blocks each)
✅ **Interactive Learning** - Click to reveal translations (memorization mode)
✅ **Progress Tracking** - Track reading, memorization, and review progress
✅ **LocalStorage Persistence** - Your progress is saved automatically
✅ **Multiple View Modes**:
   - Arabic only
   - Arabic + Translation
   - Memorization mode (hidden translation)
✅ **Mini Recall Tests** - 2-3 questions per block for active recall
✅ **Mnemonics & Memory Anchors** - Emoji-based memory aids
✅ **Today's Block Logic** - Automatic recommendation based on day of week
✅ **Search & Filter** - Filter by prayer name or ayah number
✅ **Print-Friendly** - Beautiful print layout
✅ **Mobile Responsive** - Works perfectly on all devices
✅ **Religious Disclaimer** - Respectful note about consulting with imam/teacher

---

## 🚀 Quick Start | Быстрый старт

### Option 1: Open Locally | Открыть локально

1. Download `index.html`
2. Double-click to open in your browser
3. Start memorizing! 📖

### Option 2: GitHub Pages Deployment | Развертывание на GitHub Pages

1. Fork this repository or create a new one
2. Upload `index.html` to the repository root
3. Go to **Settings → Pages → Source → Deploy from a branch**
4. Select `main` branch and save
5. Your site will be live at: `https://yourusername.github.io/surat-almulk`

---

## 📋 Content Structure | Структура контента

Each block contains:
- **Prayer Name** (Фаджр, Зухр, Аср, Магриб, Иша)
- **Rakah Number** (1 or 2)
- **Ayah Range** (e.g., 1-3)
- **Arabic Text** (full ayahs)
- **Russian Translation** (from umma.ru)
- **Mnemonic Story** (to help remember)
- **Emoji Memory Anchors** (visual memory aids)
- **Key Meaning** (main concept)
- **Memory Tips** (how to remember)
- **Mini Recall Test** (2-3 questions)

---

## 🎨 Design Details | Детали дизайна

### Color Scheme | Цветовая схема
- **Primary Dark**: `#1a3a52` (Dark Royal Blue)
- **Primary Light**: `#2d5a7b` (Lighter Blue)
- **Accent Gold**: `#d4af37` (Gold)
- **Accent Green**: `#6b9e7f` (Soft Green)
- **Background**: `#f5f1e8` (Warm Light)

### Typography | Типография
- **Arabic Font**: Amiri, Scheherazade New, Noto Naskh Arabic (fallback)
- **Body Font**: System fonts (Apple, Google, Microsoft)
- **Large Arabic Text**: 1.8rem for readability

---

## 💾 How to Edit | Как редактировать

### Edit Ayah Text | Редактировать текст аятов

Open `index.html` in a text editor and find the `blocks` array:

```javascript
const blocks = [
    {
        number: 1,
        prayer: "Фаджр",
        prayerArabic: "الفجر",
        rakah: 1,
        ayahs: "1-3",
        arabic: "YOUR_ARABIC_TEXT_HERE",
        translation: "YOUR_RUSSIAN_TRANSLATION_HERE",
        mnemonic: "YOUR_MNEMONIC_HERE",
        emojis: "👑 ⚡ 🌍",
        keyMeaning: "YOUR_KEY_MEANING_HERE",
        memoryTip: "YOUR_MEMORY_TIP_HERE",
        recallQuestions: [
            "Question 1?",
            "Question 2?"
        ]
    },
    // ... more blocks
];
```

### Recommended Sources | Рекомендуемые источники

- **Arabic Text**: [Quran.com](https://quran.com/67)
- **Russian Translations**: [umma.ru](https://umma.ru)
- **Explanations**: [Tafsir.com](https://tafsir.com)

---

## 📱 Features Explained | Объяснение функций

### Progress Tracking | Отслеживание прогресса

Three checkboxes per block:
- **✅ Прочитал** (Read) - You've read the ayahs
- **🧠 Выучил** (Memorized) - You've memorized the block
- **📿 Повторил без подсказки** (Reviewed) - You can recite without looking

All progress is automatically saved to browser's localStorage.

### View Modes | Режимы отображения

1. **Все** (All) - Shows Arabic + Translation
2. **Только арабский** (Arabic Only) - Just the Arabic text
3. **Режим запоминания** (Memorization Mode) - Translation hidden until clicked

### Today's Block | Сегодняшний блок

The system automatically recommends a block based on the day of the week:
- Sunday → Block 1
- Monday → Block 2
- Tuesday → Block 3
- Wednesday → Block 4
- Thursday → Block 5
- Friday → Block 6
- Saturday → Block 7

Blocks 8-10 cycle through the week.

### Mini Recall Tests | Мини-тесты на вспоминание

Each block has 2-3 questions to test your understanding. Click the button to reveal the answer.

---

## 🔄 Spaced Repetition Schedule | График повторения

For optimal memorization, follow this schedule:

| Day | Action | Purpose |
|-----|--------|---------|
| Day 1 | Learn block | Initial encoding |
| Day 2 | Review block | Strengthen memory |
| Day 4 | Review block | Prevent forgetting |
| Day 8 | Review block | Long-term retention |
| Day 15 | Review block | Consolidation |
| Day 30 | Final review | Permanent memory |

---

## 🌐 Deployment Options | Варианты развертывания

### GitHub Pages (Free) | GitHub Pages (Бесплатно)

```bash
# Clone repository
git clone https://github.com/yourusername/surat-almulk.git
cd surat-almulk

# Make changes to index.html
# Commit and push
git add .
git commit -m "Update content"
git push origin main

# Enable GitHub Pages in repository settings
```

### Netlify (Free) | Netlify (Бесплатно)

1. Go to [netlify.com](https://netlify.com)
2. Drag and drop `index.html`
3. Done! Your site is live

### Vercel (Free) | Vercel (Бесплатно)

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Deploy with one click

---

## 📖 How to Use | Как использовать

### Daily Routine | Ежедневная рутина

1. **Open the website** - Go to your deployed URL
2. **Check today's block** - Click "Показать рекомендуемый блок"
3. **Read the Arabic** - Focus on pronunciation
4. **Review the translation** - Understand the meaning
5. **Read the mnemonic** - Connect to memory anchors
6. **Answer recall questions** - Test your understanding
7. **Mark as read** - Check the "Прочитал" box
8. **Repeat daily** - Build consistency

### Memorization Tips | Советы по запоминанию

1. **Use emoji anchors** - Associate each block with emojis
2. **Create visual stories** - Imagine the scenes described
3. **Recite aloud** - Hearing helps memory
4. **Review regularly** - Follow the spaced repetition schedule
5. **Connect meaning** - Understand, don't just memorize
6. **Practice with others** - Recite to friends/family

---

## ⚠️ Important Disclaimer | Важное замечание

**Проверьте порядок чтения в намазе с вашим устозом/имамом, особенно если вы читаете за имамом или следуете конкретным правилам ханафитского мазхаба.**

This website is for **personal memorization and revision only**. It does not provide fatwas (religious rulings). Always consult with your imam or Islamic teacher for guidance on proper recitation in prayer.

---

## 🛠️ Technical Details | Технические детали

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables
- **Vanilla JavaScript** - No frameworks or libraries
- **LocalStorage API** - For progress persistence
- **Responsive Design** - Mobile-first approach
- **Print CSS** - Beautiful print layout
- **No external dependencies** - Works offline

---

## 📊 Browser Support | Поддержка браузеров

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🤝 Contributing | Вклад

Found an error or want to improve the content?

1. Fork the repository
2. Make your changes
3. Submit a pull request

Suggestions for improvements:
- Better translations
- Additional mnemonics
- More recall questions
- UI/UX improvements
- Bug fixes

---

## 📚 Resources | Ресурсы

- **Quran Text**: [Quran.com](https://quran.com/67)
- **Russian Translations**: [umma.ru](https://umma.ru)
- **Tafsir (Explanation)**: [Tafsir.com](https://tafsir.com)
- **Hadith Collections**: [Sunnah.com](https://sunnah.com)
- **Islamic Knowledge**: [IslamicFinder.org](https://islamicfinder.org)

---

## 📝 License | Лицензия

This project is open source and available under the MIT License.

---

## 🙏 Duas | Дуа

May Allah accept from us all (Баракаллаху фикум) 🤲

**"رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي"**

*"My Lord, expand for me my breast [with assurance] and ease for me my task"* (Quran 20:25)

---

## 📞 Support | Поддержка

Have questions or issues? 

- Check the FAQ section below
- Review the code comments
- Open an issue on GitHub

### FAQ

**Q: Where is my progress saved?**
A: Your progress is saved in your browser's localStorage. It persists across sessions on the same device/browser.

**Q: Can I export my progress?**
A: Currently, progress is stored locally. You can take screenshots or use browser developer tools to export the data.

**Q: How do I reset my progress?**
A: Click the "🔄 Сброс" button in the header. You'll be asked to confirm.

**Q: Can I use this on multiple devices?**
A: Yes, but progress won't sync between devices. Each device has its own localStorage.

**Q: Is there an app version?**
A: Not yet, but you can add it to your home screen as a PWA (Progressive Web App).

---

## 🌟 Star & Share

If you find this helpful, please:
- ⭐ Star this repository
- 📢 Share with friends
- 🔗 Link to your Islamic community

---

**Created with ❤️ for the Muslim community**

Баракаллаху фикум! May Allah bless you all! 🤲

---

*Last updated: May 2026*
*Version: 1.0*
