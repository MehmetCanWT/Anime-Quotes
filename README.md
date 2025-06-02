# 🎌 Anime Quote Generator

A sleek web app that fetches random anime quotes and displays detailed information about the anime, powered by two open APIs: **Yurippe Anime Quote API** and **Jikan API**.

---

## 🔥 Features

- ✨ Get **random anime quotes** with character names and anime titles.
- 📖 Fetch **detailed anime data**: cover image, type, episodes, airing dates, rating, status, ranking, and genre/tags.
- 🔗 Anime titles are **clickable**, directing users to the anime’s **MyAnimeList** page.
- 💡 Smooth **fade-in animation** for dynamic content.
- 🧠 Responsive and clean layout with semantic HTML and accessible labels.

---

## 📦 APIs Used

### 📜 Yurippe Anime Quote API

- **Endpoint**: `https://yurippe.vercel.app/api/quotes?random=1`
- Returns a single random quote object:

```json
{
  "quote": "The world isn't perfect...",
  "character": "Roy Mustang",
  "show": "Fullmetal Alchemist: Brotherhood"
}
```

### 📚 Jikan API (Unofficial MyAnimeList API)

- **Endpoint pattern**:  
  `https://api.jikan.moe/v4/anime?q=<anime_title>&limit=1`
- Searches for anime info using the title received from the quote.
- Returns detailed anime metadata:
  - `images.jpg.large_image_url`
  - `aired.string`
  - `episodes`
  - `type`
  - `rating`
  - `status`
  - `rank`
  - `genres[]`, `themes[]`
  - `url` (link to MyAnimeList page)

> ✅ Always retrieves the **highest resolution** poster image available (`large_image_url`) for best quality.

---

## ⚙️ How It Works

1. User clicks the **"New Quote"** button.
2. App fetches a random quote from the **Yurippe API**.
3. Using the anime title from the quote, the app queries **Jikan API**.
4. The first matching result is used to extract detailed anime information.
5. All data is rendered to the UI with smooth animations.
6. Clicking the anime name opens its **MyAnimeList** page in a new tab.

---

## 🌐 Live Demo

[https://anime-quotes-indol.vercel.app/](https://anime-quotes-indol.vercel.app/)

---

If you'd like, I can also write sections for installation, contribution, and deployment. Let me know!
