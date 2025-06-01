async function getQuote() {
  const response = await fetch('https://yurippe.vercel.app/api/quotes?random=1');
  const data = await response.json();
  const item = data[0];

  const quoteText = item.quote || "Quote not found.";
  const character = item.character || "Unknown";
  const show = item.show || "Unknown";

  document.getElementById('quote').innerText = quoteText;
  document.getElementById('author').innerText = `– ${character}`;
  
  const showLink = `https://myanimelist.net/anime.php?q=${encodeURIComponent(show)}`;
  document.getElementById('show').innerHTML = `<a href="${showLink}" target="_blank">${show}</a>`;
}
