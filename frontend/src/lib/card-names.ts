// Bộ dịch tên lá bài tự động sang tiếng Việt chuẩn Tarot
export function getVietnameseName(
  slug: string,
  fallbackVi: string,
  fallbackEn: string
): { vi: string; en: string } {
  const majorMap: Record<string, { vi: string; en: string }> = {
    fool: { vi: 'Chàng Khờ (The Fool)', en: 'The Fool' },
    magician: { vi: 'Nhà Ảo Thuật', en: 'The Magician' },
    'high-priestess': { vi: 'Nữ Đại Tư Tế', en: 'The High Priestess' },
    empress: { vi: 'Nữ Hoàng', en: 'The Empress' },
    emperor: { vi: 'Hoàng Đế', en: 'The Emperor' },
    hierophant: { vi: 'Thầy Tư Tế', en: 'The Hierophant' },
    lovers: { vi: 'Tình Nhân', en: 'The Lovers' },
    chariot: { vi: 'Cỗ Xe Chiến Thắng', en: 'The Chariot' },
    strength: { vi: 'Sức Mạnh', en: 'Strength' },
    hermit: { vi: 'Ẩn Sĩ', en: 'The Hermit' },
    'wheel-of-fortune': { vi: 'Vòng Quay Số Phận', en: 'Wheel of Fortune' },
    justice: { vi: 'Công Lý', en: 'Justice' },
    'hanged-man': { vi: 'Người Treo', en: 'The Hanged Man' },
    death: { vi: 'Cái Chết', en: 'Death' },
    temperance: { vi: 'Sự Tiết Độ', en: 'Temperance' },
    devil: { vi: 'Ác Quỷ', en: 'The Devil' },
    tower: { vi: 'Tòa Tháp', en: 'The Tower' },
    star: { vi: 'Ngôi Sao', en: 'The Star' },
    moon: { vi: 'Mặt Trăng', en: 'The Moon' },
    sun: { vi: 'Mặt Trời', en: 'The Sun' },
    judgement: { vi: 'Phán Xét', en: 'Judgement' },
    world: { vi: 'Thế Giới', en: 'The World' },
  };

  if (majorMap[slug]) return majorMap[slug];

  const suits: Record<string, { vi: string; en: string }> = {
    wands: { vi: 'Gậy', en: 'Wands' },
    cups: { vi: 'Cúp', en: 'Cups' },
    swords: { vi: 'Kiếm', en: 'Swords' },
    pentacles: { vi: 'Tiền', en: 'Pentacles' },
  };

  const ranks: Record<string, { vi: string; en: string }> = {
    '1': { vi: 'Ace', en: 'Ace' },
    ace: { vi: 'Ace', en: 'Ace' },
    '2': { vi: '2', en: 'Two' },
    '3': { vi: '3', en: 'Three' },
    '4': { vi: '4', en: 'Four' },
    '5': { vi: '5', en: 'Five' },
    '6': { vi: '6', en: 'Six' },
    '7': { vi: '7', en: 'Seven' },
    '8': { vi: '8', en: 'Eight' },
    '9': { vi: '9', en: 'Nine' },
    '10': { vi: '10', en: 'Ten' },
    page: { vi: 'Hầu Cận', en: 'Page' },
    knight: { vi: 'Hiệp Sĩ', en: 'Knight' },
    queen: { vi: 'Nữ Hoàng', en: 'Queen' },
    king: { vi: 'Vua', en: 'King' },
  };

  const parts = slug.split('-');
  if (parts.length === 2) {
    const rank = ranks[parts[0]];
    const suit = suits[parts[1]];
    if (rank && suit) {
      return {
        vi: `${rank.vi} ${suit.vi}`,
        en: `${rank.en} of ${suit.en}`,
      };
    }
  }

  return { vi: fallbackVi, en: fallbackEn };
}
