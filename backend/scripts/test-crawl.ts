import * as cheerio from 'cheerio';

async function testCrawl() {
  const uprightUrl = 'https://tarot.vn/dien-giai-xuoi-cua-la-bai-the-fool-trong-tarot/';
  const reversedUrl = 'https://tarot.vn/dien-giai-nguoc-cua-la-bai-the-fool-trong-tarot/';

  try {
    // Upright
    console.log(`Fetching Upright: ${uprightUrl}...`);
    const resUp = await fetch(uprightUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const htmlUp = await resUp.text();
    const $up = cheerio.load(htmlUp);
    console.log('Upright Title:', $up('h1').text().trim());
    console.log('--- UPRIGHT FIRST 5 PARAGRAPHS ---');
    $up('.entry-content p').slice(0, 5).each((i, el) => {
      console.log(`P[${i}]:`, $up(el).text().trim().substring(0, 150));
    });

    // Reversed
    console.log(`Fetching Reversed: ${reversedUrl}...`);
    const resRev = await fetch(reversedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const htmlRev = await resRev.text();
    const $rev = cheerio.load(htmlRev);
    console.log('Reversed Title:', $rev('h1').text().trim());
    console.log('--- REVERSED FIRST 5 PARAGRAPHS ---');
    $rev('.entry-content p').slice(0, 5).each((i, el) => {
      console.log(`P[${i}]:`, $rev(el).text().trim().substring(0, 150));
    });

  } catch (error: any) {
    console.error('Error fetching/parsing:', error.message);
  }
}

testCrawl();
