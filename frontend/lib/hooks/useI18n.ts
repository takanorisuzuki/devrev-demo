import { useRouter, usePathname } from 'next/navigation';
import jaMessages from '@/messages/ja.json';
import enMessages from '@/messages/en.json';

const messages = {
  ja: jaMessages,
  en: enMessages,
};

export function useI18n() {
  const router = useRouter();
  const pathname = usePathname();
  
  // 現在のロケールを取得（URLパスから）
  const getCurrentLocale = () => {
    if (pathname.startsWith('/en')) return 'en';
    return 'ja';
  };
  
  const locale = getCurrentLocale();
  
  const t = (key: string, fallback?: string): string => {
    const keys = key.split('.');
    let value: any = messages[locale as keyof typeof messages];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return fallback || key;
      }
    }
    
    return typeof value === 'string' ? value : fallback || key;
  };

  const changeLanguage = (newLocale: string) => {
    const newPath = newLocale === 'ja' 
      ? pathname.replace(/^\/en/, '') || '/'
      : `/en${pathname}`;
    router.push(newPath);
  };

  return {
    t,
    locale,
    changeLanguage,
    isJapanese: locale === 'ja',
    isEnglish: locale === 'en',
  };
}
