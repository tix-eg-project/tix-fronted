// Smart search synonyms — shared between Header and Products page
// When user searches for "هاتف", also search for "موبايل", "تليفون", etc.

export const synonymGroups: string[][] = [
  // Phones
  ['هاتف', 'موبايل', 'تليفون', 'تلفون', 'جوال', 'محمول', 'phone', 'mobile', 'smartphone'],
  // Computers
  ['لابتوب', 'لاب توب', 'حاسوب', 'كمبيوتر', 'laptop', 'computer', 'notebook'],
  // Audio
  ['سماعة', 'سماعات', 'هيدفون', 'ايربودز', 'earbuds', 'headphone', 'earphone', 'هيدست'],
  // Chargers
  ['شاحن', 'شواحن', 'charger', 'باور بانك', 'powerbank'],
  // Watches
  ['ساعة', 'ساعات', 'watch', 'سمارت واتش', 'smartwatch'],
  // Tablets
  ['تابلت', 'تاب', 'tablet', 'ipad', 'ايباد'],
  // Screens
  ['شاشة', 'شاشات', 'تلفزيون', 'تليفزيون', 'tv', 'screen', 'monitor'],
  // Cases
  ['جراب', 'كفر', 'case', 'cover', 'حافظة'],
  // Clothes
  ['ملابس', 'هدوم', 'لبس', 'clothes', 'clothing'],
  // Shoes
  ['حذاء', 'جزمة', 'شوز', 'shoes', 'احذية'],
  // Bags
  ['شنطة', 'شنط', 'حقيبة', 'bag', 'backpack', 'باكباك'],
  // Kitchen
  ['مطبخ', 'ادوات منزلية', 'اجهزة منزلية', 'kitchen', 'home appliance'],
  // Brands — common misspellings and Arabic variants
  ['سامسونج', 'سامسونغ', 'samsung'],
  ['ايفون', 'آيفون', 'iphone', 'أيفون'],
  ['هواوي', 'هوواي', 'huawei'],
  ['شاومي', 'شياومي', 'xiaomi', 'ريدمي', 'redmi'],
  ['اوبو', 'أوبو', 'oppo'],
  ['ريلمي', 'realme'],
  ['تكنو', 'tecno'],
  ['انفنكس', 'infinix'],
  ['ايتل', 'itel'],
  ['نوكيا', 'nokia'],
  ['هونر', 'honor', 'هونور'],
  ['لينوفو', 'lenovo'],
  ['اتش بي', 'hp'],
  ['ديل', 'dell'],
  ['ابل', 'آبل', 'apple', 'أبل'],
  ['سوني', 'sony', 'بلايستيشن', 'playstation'],
]

/**
 * Get all synonyms for a search query.
 * Returns the original words + all synonym matches.
 */
export function expandSearchTerms(query: string): string[] {
  const words = query.trim().toLowerCase().split(/\s+/)
  const expandedTerms = new Set<string>()
  expandedTerms.add(query.trim()) // Always include original query

  for (const word of words) {
    for (const group of synonymGroups) {
      if (group.some(s => s === word || s === query.trim().toLowerCase())) {
        // Add each synonym as a replacement in the original query
        for (const synonym of group) {
          if (synonym !== word && synonym !== query.trim().toLowerCase()) {
            // Replace the matched word with the synonym in the full query
            const expanded = query.trim().toLowerCase().replace(word, synonym)
            expandedTerms.add(expanded)
            // Also add the synonym alone
            expandedTerms.add(synonym)
          }
        }
      }
    }
  }

  return Array.from(expandedTerms)
}

/**
 * Get synonyms for a single word (used for suggestions in Header)
 */
export function getSynonymsForWord(word: string): string[] {
  const lower = word.toLowerCase()
  for (const group of synonymGroups) {
    if (group.some(s => s === lower || s === word)) {
      return group.filter(s => s !== lower && s !== word)
    }
  }
  return []
}
