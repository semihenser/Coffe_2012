export const quotes = [
"Malın fiyatı, hizmetin ücreti olur - TYT",
"Yel kayadan ancak toz alır.",
"Her türlü omlet siparişi alınır - Arda ŞEN",
"HAYDİİİ -TYT",
"YEAP UNDERWEAR ***ÜNÜZ RAHAT ETSİN https://ty.gl/shbzc2amznsxp -Erkan Mert",
"Ayık ol - Betül",
"Hak haklıyken aranır -Neşe Yıldız",
"Canıma doydum -Mr.Huge",
"Kurşunlara gelesiniz -TYT",
"Baaaağk gaaarri -Ceren UÖ",
"Manyatik alan var burda -Mr.Huge"
];

// Returns a quote based on current 10-minute block interval
export const getDailyQuote = (): string => {
  const tenMinutesMs = 1000 * 5 * 1;
  const timeBlock = Math.floor(Date.now() / tenMinutesMs);
  const quoteIndex = timeBlock % quotes.length;
  return quotes[quoteIndex];
};