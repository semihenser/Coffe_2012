export const quotes = [
"Malın fiyati olur hizmetin ücreti olur - TYT",
"Lezzetin adresi YELKİ ŞEN ÇİFTLİK",
"Yel kayadan ancak toz alır.",
"Her türlü omlet siparişi alınır - Arda ŞEN",
"HAYDİİİ -TYT",
"YEAP UNDERWEAR ***ÜNÜZ RAHAT ETSİN 'https://ty.gl/shbzc2amznsxp'-Erkan Mert",
];

// Returns a quote based on current 10-minute block interval
export const getDailyQuote = (): string => {
  const tenMinutesMs = 1000 * 60 * 10;
  const timeBlock = Math.floor(Date.now() / tenMinutesMs);
  const quoteIndex = timeBlock % quotes.length;
  return quotes[quoteIndex];
};