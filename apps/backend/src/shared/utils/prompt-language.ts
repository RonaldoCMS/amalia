export const PROMPT_LANG_NAMES: Record<string, string> = {
  it: 'italiano',
  en: 'English',
  de: 'Deutsch',
  fr: 'français',
  es: 'español',
  pt: 'português',
  ru: 'русский',
}

export function getLanguageInstruction(lang: string | null | undefined): string {
  const name = PROMPT_LANG_NAMES[lang ?? 'it'] ?? PROMPT_LANG_NAMES['it']
  return `\nIMPORTANT: You MUST write ALL your responses entirely in ${name}. Every word of your output must be in ${name}.`
}
