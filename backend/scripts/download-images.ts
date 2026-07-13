import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const OUTPUT_DIR = path.join(__dirname, '../../frontend/public/images/cards');

// Extract slug from tarot.vn URL
function extractSlug(url: string): string {
  const match = url.match(/\/y-nghia-la-bai-([a-z0-9-]+)-trong-tarot\/?$/);
  if (match) return match[1];
  return '';
}

async function downloadImage(url: string, destPath: string) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(destPath, buffer);
}

async function downloadImages() {
  console.log('--- STARTING IMAGE DOWNLOADER ---');
  
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created output directory: ${OUTPUT_DIR}`);
  }

  const indexUrl = 'https://tarot.vn/Giai-Y-Nghia-78-La-Bai-Tarot/';
  console.log(`Fetching index page: ${indexUrl}...`);
  
  try {
    const res = await fetch(indexUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    // We want to find all <a> tags that link to cards, and check if they contain an <img>
    const downloads: { imageUrl: string; slug: string }[] = [];

    $('a[href*="y-nghia-la-bai-"]').each((i, el) => {
      const href = $(el).attr('href');
      if (!href) return;
      const slug = extractSlug(href);
      if (!slug) return;

      // Find image inside this link or adjacent
      let imgUrl = $(el).find('img').attr('src');
      
      // If not inside, try next/prev elements or check if this link has an image
      if (!imgUrl) {
        // Look if the link itself is wrapping an image, or adjacent
        const next = $(el).next('img');
        if (next.length) imgUrl = next.attr('src');
      }

      // If still not found, check if there's a matching image inside the same container
      if (!imgUrl) {
        // Sometimes the image is in a separate link next to it
        const parent = $(el).parent();
        const siblingImg = parent.find(`img[src*="${slug}-icon"]`);
        if (siblingImg.length) {
          imgUrl = siblingImg.attr('src');
        } else {
          // Fallback to find any img link that matches the slug
          const anyImg = parent.find('img').first();
          if (anyImg.length) imgUrl = anyImg.attr('src');
        }
      }

      if (imgUrl && !downloads.some(d => d.slug === slug)) {
        downloads.push({ imageUrl: imgUrl, slug });
      }
    });

    console.log(`Identified ${downloads.length} card images to download.`);

    // If some were not found, let's log them
    // Let's download them one by one
    let successCount = 0;
    for (let i = 0; i < downloads.length; i++) {
      const { imageUrl, slug } = downloads[i];
      const ext = path.extname(imageUrl.split('?')[0]) || '.png';
      const destPath = path.join(OUTPUT_DIR, `${slug}${ext}`);

      // Check if file already exists
      if (fs.existsSync(destPath)) {
        // Let's check size
        const stats = fs.statSync(destPath);
        if (stats.size > 1000) {
          console.log(`[${i + 1}/${downloads.length}] Skipping ${slug}${ext} (already exists)`);
          successCount++;
          continue;
        }
      }

      console.log(`[${i + 1}/${downloads.length}] Downloading image for ${slug} from ${imageUrl}...`);
      try {
        await sleep(1500); // 1.5s delay to be polite
        await downloadImage(imageUrl, destPath);
        successCount++;
      } catch (err: any) {
        console.error(`  Error downloading ${slug}:`, err.message);
      }
    }

    console.log(`\nSuccessfully downloaded ${successCount}/${downloads.length} images.`);
    console.log('--- IMAGE DOWNLOADER FINISHED ---');

  } catch (error: any) {
    console.error('Error fetching/downloading:', error.message);
  }
}

downloadImages();
