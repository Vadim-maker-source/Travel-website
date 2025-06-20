export const COUNTRIES = [
    'Россия',
    'США',
    'Германия',
    'Франция',
    'Италия',
    'Испания',
    'Великобритания',
    'Китай',
    'Япония',
    'Южная Корея',
    'Турция',
    'Таиланд',
    'ОАЭ',
    'Греция',
    'Чехия',
    'Австрия',
    'Швейцария',
    'Канада',
    'Мексика',
    'Бразилия'
  ] as const;
  
  export type Country = typeof COUNTRIES[number];

  export const COUNTRIES_LANG = [
    'Россия',                 // Россия
    'United States',          // США
    'Deutschland',            // Германия
    'France',                 // Франция
    'Italia',                 // Италия
    'España',                 // Испания
    'United Kingdom',         // Великобритания
    '中国',                    // Китай
    '日本',                    // Япония
    '대한민국',                // Южная Корея
    'Türkiye',                // Турция
    'ประเทศไทย',              // Таиланд
    'الإمارات العربية المتحدة', // ОАЭ
    'Ελλάδα',                 // Греция
    'Česko',                  // Чехия
    'Österreich',             // Австрия
    'Schweiz',                // Швейцария
    'Canada',                 // Канада
    'México',                 // Мексика
    'Brasil'                  // Бразилия
  ] as const;
  
  export type Country_Lang = typeof COUNTRIES_LANG[number];