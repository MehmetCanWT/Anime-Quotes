Anime Quote Generator
This project fetches random anime quotes using the Yurippe Anime Quote API and retrieves detailed anime information like posters, genres, episodes, rating, tags, and more via the Jikan API.

Features
Random anime quotes: Fetches character names, quotes, and anime titles from Yurippe Anime Quote API.

Anime details: Uses Jikan API to get additional anime info such as poster images, type, episode count, airing status, MyAnimeList ranking, and genre tags.

Clickable anime title: Opens the corresponding anime page on MyAnimeList in a new tab.

Responsive and clean user interface.

“New Quote” button to refresh and load another quote and anime info.

APIs Used
Yurippe Anime Quote API
Endpoint: https://yurippe.vercel.app/api/quotes?random=1

Returns a random anime quote object containing the quote text, character, and anime/show title.

Jikan API
Endpoint example: https://api.jikan.moe/v4/anime?q=<anime_title>&limit=1

Returns detailed anime data from MyAnimeList, including images, airing dates, type, rating, status, ranking, and genre tags.

This project picks the top result based on the search query for accuracy.

Usage
Fetch a random quote from Yurippe API.

Extract the anime title from the quote.

Search for that anime title on Jikan API and retrieve the most relevant anime info.

Display the quote, character, and anime info dynamically.

Provide a link to the anime’s MyAnimeList page.
