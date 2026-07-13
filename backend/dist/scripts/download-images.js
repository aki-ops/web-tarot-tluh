"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio = __importStar(require("cheerio"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const OUTPUT_DIR = path.join(__dirname, '../../frontend/public/images/cards');
function extractSlug(url) {
    const match = url.match(/\/y-nghia-la-bai-([a-z0-9-]+)-trong-tarot\/?$/);
    if (match)
        return match[1];
    return '';
}
async function downloadImage(url, destPath) {
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    });
    if (!res.ok)
        throw new Error(`Failed to fetch image: ${res.statusText}`);
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
        if (!res.ok)
            throw new Error(`HTTP error! status: ${res.status}`);
        const html = await res.text();
        const $ = cheerio.load(html);
        const downloads = [];
        $('a[href*="y-nghia-la-bai-"]').each((i, el) => {
            const href = $(el).attr('href');
            if (!href)
                return;
            const slug = extractSlug(href);
            if (!slug)
                return;
            let imgUrl = $(el).find('img').attr('src');
            if (!imgUrl) {
                const next = $(el).next('img');
                if (next.length)
                    imgUrl = next.attr('src');
            }
            if (!imgUrl) {
                const parent = $(el).parent();
                const siblingImg = parent.find(`img[src*="${slug}-icon"]`);
                if (siblingImg.length) {
                    imgUrl = siblingImg.attr('src');
                }
                else {
                    const anyImg = parent.find('img').first();
                    if (anyImg.length)
                        imgUrl = anyImg.attr('src');
                }
            }
            if (imgUrl && !downloads.some(d => d.slug === slug)) {
                downloads.push({ imageUrl: imgUrl, slug });
            }
        });
        console.log(`Identified ${downloads.length} card images to download.`);
        let successCount = 0;
        for (let i = 0; i < downloads.length; i++) {
            const { imageUrl, slug } = downloads[i];
            const ext = path.extname(imageUrl.split('?')[0]) || '.png';
            const destPath = path.join(OUTPUT_DIR, `${slug}${ext}`);
            if (fs.existsSync(destPath)) {
                const stats = fs.statSync(destPath);
                if (stats.size > 1000) {
                    console.log(`[${i + 1}/${downloads.length}] Skipping ${slug}${ext} (already exists)`);
                    successCount++;
                    continue;
                }
            }
            console.log(`[${i + 1}/${downloads.length}] Downloading image for ${slug} from ${imageUrl}...`);
            try {
                await sleep(1500);
                await downloadImage(imageUrl, destPath);
                successCount++;
            }
            catch (err) {
                console.error(`  Error downloading ${slug}:`, err.message);
            }
        }
        console.log(`\nSuccessfully downloaded ${successCount}/${downloads.length} images.`);
        console.log('--- IMAGE DOWNLOADER FINISHED ---');
    }
    catch (error) {
        console.error('Error fetching/downloading:', error.message);
    }
}
downloadImages();
//# sourceMappingURL=download-images.js.map