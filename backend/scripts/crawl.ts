import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const RAW_DATA_PATH = path.join(__dirname, '../prisma/cards-raw.json');

interface CardData {
  slug: string;
  nameVi: string;
  nameEn: string;
  arcanaType: string;
  suit: string | null;
  number: string;
  imageUrl: string;
  keywords: string[];
  actionGroups: { title: string; items: string[] }[];
  quickMeaning: string;
  detailedDescription: string;
  uprightMeaning: string;
  reversedMeaning: string;
  opposingCardSlugs: string[];
  supportingCardSlugs: string[];
  sourceUrl: string;
}

// Map slug to metadata
function parseCardMetadata(slug: string) {
  const suits = ['wands', 'cups', 'swords', 'pentacles'];
  let suit: string | null = null;
  for (const s of suits) {
    if (slug.includes(s)) {
      suit = s;
      break;
    }
  }

  if (suit) {
    const parts = slug.split('-');
    const rank = parts[0];
    const rankMap: Record<string, { num: string; en: string }> = {
      ace: { num: 'Ace', en: 'Ace' },
      '2': { num: '2', en: 'Two' },
      '3': { num: '3', en: 'Three' },
      '4': { num: '4', en: 'Four' },
      '5': { num: '5', en: 'Five' },
      '6': { num: '6', en: 'Six' },
      '7': { num: '7', en: 'Seven' },
      '8': { num: '8', en: 'Eight' },
      '9': { num: '9', en: 'Nine' },
      '10': { num: '10', en: 'Ten' },
      page: { num: 'Page', en: 'Page' },
      knight: { num: 'Knight', en: 'Knight' },
      queen: { num: 'Queen', en: 'Queen' },
      king: { num: 'King', en: 'King' },
    };
    const suitDisplay = suit.charAt(0).toUpperCase() + suit.slice(1);
    const rankInfo = rankMap[rank] || { num: rank, en: rank };
    return {
      arcanaType: 'minor',
      suit,
      number: rankInfo.num,
      nameEn: `${rankInfo.en} of ${suitDisplay}`,
    };
  } else {
    // Major Arcana
    const majorArcanaNames: Record<string, { num: string; en: string }> = {
      fool: { num: '0', en: 'The Fool' },
      magician: { num: '1', en: 'The Magician' },
      'high-priestess': { num: '2', en: 'The High Priestess' },
      empress: { num: '3', en: 'The Empress' },
      emperor: { num: '4', en: 'The Emperor' },
      hierophant: { num: '5', en: 'The Hierophant' },
      lovers: { num: '6', en: 'The Lovers' },
      chariot: { num: '7', en: 'The Chariot' },
      strength: { num: '8', en: 'Strength' },
      hermit: { num: '9', en: 'The Hermit' },
      'wheel-of-fortune': { num: '10', en: 'The Wheel of Fortune' },
      justice: { num: '11', en: 'Justice' },
      'hanged-man': { num: '12', en: 'The Hanged Man' },
      death: { num: '13', en: 'Death' },
      temperance: { num: '14', en: 'Temperance' },
      devil: { num: '15', en: 'The Devil' },
      tower: { num: '16', en: 'The Tower' },
      star: { num: '17', en: 'The Star' },
      moon: { num: '18', en: 'The Moon' },
      sun: { num: '19', en: 'The Sun' },
      judgement: { num: '20', en: 'Judgement' },
      world: { num: '21', en: 'The World' },
    };
    const major = majorArcanaNames[slug] || { num: '?', en: slug };
    return {
      arcanaType: 'major',
      suit: null,
      number: major.num,
      nameEn: major.en,
    };
  }
}

// Extract slug from tarot.vn URL
function extractSlug(url: string): string {
  // Pattern: https://tarot.vn/y-nghia-la-bai-{slug}-trong-tarot/
  const match = url.match(/\/y-nghia-la-bai-([a-z0-9-]+)-trong-tarot\/?$/);
  if (match) return match[1];
  return '';
}

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return await res.text();
}

async function crawl() {
  console.log('--- STARTING CRAWLER ---');

  // Ensure output dir exists
  const dir = path.dirname(RAW_DATA_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Load existing checkpoint data
  let crawledCards: Record<string, CardData> = {};
  if (fs.existsSync(RAW_DATA_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(RAW_DATA_PATH, 'utf-8'));
      if (Array.isArray(data)) {
        for (const c of data) {
          crawledCards[c.slug] = c;
        }
      } else {
        crawledCards = data;
      }
      console.log(`Loaded ${Object.keys(crawledCards).length} cards from checkpoint.`);
    } catch (e) {
      console.log('Failed to parse existing checkpoint, starting fresh.');
    }
  }

  // 1. Fetch index page to get 78 URLs
  const indexUrl = 'https://tarot.vn/Giai-Y-Nghia-78-La-Bai-Tarot/';
  console.log(`Fetching index page: ${indexUrl}...`);
  const indexHtml = await fetchPage(indexUrl);
  const $index = cheerio.load(indexHtml);

  const cardUrls: string[] = [];
  $index('a[href*="y-nghia-la-bai-"]').each((i, el) => {
    const href = $index(el).attr('href');
    if (href && !cardUrls.includes(href)) {
      cardUrls.push(href);
    }
  });

  console.log(`Found ${cardUrls.length} card URLs in index page.`);
  if (cardUrls.length !== 78) {
    console.log('Warning: Did not find exactly 78 card links. Found:', cardUrls.length);
  }

  // Process cards one by one
  for (let idx = 0; idx < cardUrls.length; idx++) {
    const url = cardUrls[idx];
    const slug = extractSlug(url);
    if (!slug) {
      console.log(`Could not extract slug from URL: ${url}, skipping.`);
      continue;
    }

    // Skip if already crawled
    if (crawledCards[slug] && crawledCards[slug].uprightMeaning && crawledCards[slug].reversedMeaning) {
      console.log(`[${idx + 1}/78] Skipping ${slug} (already crawled)`);
      continue;
    }

    console.log(`\n[${idx + 1}/78] Crawling ${slug}...`);
    try {
      // Crawl main page
      await sleep(2000);
      const html = await fetchPage(url);
      const $ = cheerio.load(html);

      const content = $('.entry-content');

      // Title/Name
      const title = $('h1').text().trim() || $('.entry-title').text().trim();
      const nameVi = title.replace('Ý Nghĩa Lá Bài ', '').replace(' Trong Tarot', '').trim();

      // Keywords
      const keywords: string[] = [];
      content.find('ul').first().find('li').each((i, el) => {
        keywords.push($(el).text().trim());
      });

      // Metadata
      const meta = parseCardMetadata(slug);

      // Action Groups
      const actionGroups: { title: string; items: string[] }[] = [];
      let currentGroupTitle = '';
      let currentItems: string[] = [];

      content.find('p, h2, h3, h4, h5, h6, ul').each((i, el) => {
        const tagName = $(el).prop('tagName');
        const text = $(el).text().trim();

        if (tagName === 'UL') {
          // If we have a current group, grab its list items
          if (currentGroupTitle && currentGroupTitle !== 'Một Vài Lá Bài Đối Lập' && currentGroupTitle !== 'Một Vài Lá Bài Hỗ Trợ') {
            const items: string[] = [];
            $(el).find('li').each((j, li) => {
              items.push($(li).text().trim());
            });
            actionGroups.push({ title: currentGroupTitle, items });
            currentGroupTitle = '';
          }
        } else if (text) {
          currentGroupTitle = text;
        }
      });

      // Opposing & Supporting cards
      const opposingCardSlugs: string[] = [];
      const supportingCardSlugs: string[] = [];

      content.find('p, h2, h3, h4, h5, h6').each((i, el) => {
        const text = $(el).text().trim();
        if (text.includes('Một Vài Lá Bài Đối Lập') || text.includes('Một Vài Lá Bài Hỗ Trợ')) {
          const isOpposing = text.includes('Một Vài Lá Bài Đối Lập');
          let next = $(el).next();
          while (next.length && next.prop('tagName') !== 'UL') {
            next = next.next();
          }
          if (next.length) {
            next.find('li').each((j, li) => {
              const href = $(li).find('a').attr('href');
              if (href) {
                const s = extractSlug(href);
                if (s) {
                  if (isOpposing) opposingCardSlugs.push(s);
                  else supportingCardSlugs.push(s);
                }
              }
            });
          }
        }
      });

      // Detailed Description: Get first 2 paragraphs
      let descStart = false;
      const descParas: string[] = [];
      content.find('p, h2, h3, h4, h5, h6').each((i, el) => {
        const text = $(el).text().trim();
        if (text.startsWith('Mô Tả Chi Tiết:')) {
          descStart = true;
          return;
        }
        if (descStart) {
          if ($(el).find('a').length && (text.includes('Ý Nghĩa Xuôi') || text.includes('Ý Nghĩa Ngược'))) {
            descStart = false;
            return;
          }
          if (text) {
            descParas.push(text);
          }
        }
      });
      const detailedDescription = descParas.slice(0, 2).join('\n\n');
      
      // Use the first paragraph as quick meaning (1-2 sentences)
      const quickMeaning = descParas[0] || 'Chưa có tóm tắt ý nghĩa.';

      // Get Upright & Reversed page links
      const uprightUrl = content.find('a[href*="dien-giai-xuoi"]').attr('href');
      const reversedUrl = content.find('a[href*="dien-giai-nguoc"]').attr('href');

      let uprightMeaning = 'Chưa có giải nghĩa xuôi.';
      let reversedMeaning = 'Chưa có giải nghĩa ngược.';

      // Fetch Upright meaning
      if (uprightUrl) {
        console.log(`  Fetching Upright meaning...`);
        await sleep(2000);
        const upHtml = await fetchPage(uprightUrl);
        const $up = cheerio.load(upHtml);
        
        // Find the "Dẫn nhập" paragraph
        $up('.entry-content p').each((i, el) => {
          const text = $up(el).text().trim();
          if (text.startsWith('Dẫn nhập:')) {
            uprightMeaning = text;
            return false; // Break loop
          }
        });
        // Fallback
        if (uprightMeaning === 'Chưa có giải nghĩa xuôi.') {
          uprightMeaning = $up('.entry-content p').slice(2, 4).text().trim() || 'Chưa có giải nghĩa xuôi.';
        }
      }

      // Fetch Reversed meaning
      if (reversedUrl) {
        console.log(`  Fetching Reversed meaning...`);
        await sleep(2000);
        const revHtml = await fetchPage(reversedUrl);
        const $rev = cheerio.load(revHtml);
        
        // Find the "Dẫn nhập" paragraph
        $rev('.entry-content p').each((i, el) => {
          const text = $rev(el).text().trim();
          if (text.startsWith('Dẫn nhập:')) {
            reversedMeaning = text;
            return false; // Break loop
          }
        });
        // Fallback
        if (reversedMeaning === 'Chưa có giải nghĩa ngược.') {
          reversedMeaning = $rev('.entry-content p').slice(2, 4).text().trim() || 'Chưa có giải nghĩa ngược.';
        }
      }

      // Build card object
      const card: CardData = {
        slug,
        nameVi,
        nameEn: meta.nameEn,
        arcanaType: meta.arcanaType,
        suit: meta.suit,
        number: meta.number,
        imageUrl: `/images/cards/${slug}.webp`,
        keywords,
        actionGroups,
        quickMeaning,
        detailedDescription,
        uprightMeaning,
        reversedMeaning,
        opposingCardSlugs,
        supportingCardSlugs,
        sourceUrl: url
      };

      // Save to checkpoint
      crawledCards[slug] = card;
      fs.writeFileSync(RAW_DATA_PATH, JSON.stringify(Object.values(crawledCards), null, 2), 'utf-8');
      console.log(`  Successfully crawled and saved ${slug}!`);

    } catch (e: any) {
      console.error(`  Error crawling ${slug}:`, e.message);
      // Wait longer on error before next request
      await sleep(5000);
    }
  }

  console.log('\n--- CRAWLER FINISHED ---');
  console.log(`Total crawled cards: ${Object.keys(crawledCards).length}/78`);
}

crawl();
