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
async function testCrawl() {
    const uprightUrl = 'https://tarot.vn/dien-giai-xuoi-cua-la-bai-the-fool-trong-tarot/';
    const reversedUrl = 'https://tarot.vn/dien-giai-nguoc-cua-la-bai-the-fool-trong-tarot/';
    try {
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
    }
    catch (error) {
        console.error('Error fetching/parsing:', error.message);
    }
}
testCrawl();
//# sourceMappingURL=test-crawl.js.map