'use client'

import { usePathname, useRouter } from 'next/navigation'

const localeLabels: Record<string, string> = {
  ca: 'CA',
  es: 'ES',
}

export default function LocaleSwitcher({ locale }: { locale: string }) {
  const pathname = usePathname()
  const router = useRouter()

  function switchLocale(newLocale: string) {
    // Replace /ca/ or /es/ at the start of the path
    const newPath = pathname.replace(/^\/(ca|es)/, `/${newLocale}`)
    router.push(newPath)
  }

  return (
    <div className="flex items-center gap-1 bg-white/10 border border-white/20 rounded-lg p-1">
      {Object.keys(localeLabels).map((l) => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          className={`px-3 py-1 rounded-md text-sm font-semibold transition-all duration-200 ${
            locale === l
              ? 'bg-white text-[#1a2535]'
              : 'text-white/70 hover:text-white'
          }`}
        >
          {localeLabels[l]}
        </button>
      ))}
    </div>
  )
}
