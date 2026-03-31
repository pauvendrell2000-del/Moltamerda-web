import Link from "next/link";
import {
  Sparkles,
  Tractor,
  Factory,
  Building2,
  Beef,
  TreePine,
  Dog,
  ArrowRight,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { getT } from "@/lib/i18n";
import LocaleSwitcher from "./LocaleSwitcher";

const serviceIcons = [Tractor, Factory, Building2, Beef, TreePine, Dog];
const serviceColors = [
  { color: "from-green-50 to-emerald-50", iconColor: "text-emerald-600", iconBg: "bg-emerald-100" },
  { color: "from-blue-50 to-cyan-50", iconColor: "text-blue-600", iconBg: "bg-blue-100" },
  { color: "from-indigo-50 to-blue-50", iconColor: "text-indigo-600", iconBg: "bg-indigo-100" },
  { color: "from-amber-50 to-orange-50", iconColor: "text-amber-600", iconBg: "bg-amber-100" },
  { color: "from-teal-50 to-green-50", iconColor: "text-teal-600", iconBg: "bg-teal-100" },
  { color: "from-purple-50 to-violet-50", iconColor: "text-purple-600", iconBg: "bg-purple-100" },
];

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getT(locale);

  return (
    <div className="min-h-screen flex flex-col">
      {/* HERO */}
      <section className="relative bg-[#1a2535] text-white overflow-hidden">
        {/* Grid "+" pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Crect x='19' y='14' width='2' height='12'/%3E%3Crect x='14' y='19' width='12' height='2'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Locale switcher top-right */}
        <div className="relative z-10 flex justify-end max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <LocaleSwitcher locale={locale} />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-32 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-10 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-white/80" />
            <span className="text-sm font-medium text-white/90">{t.hero.badge}</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display leading-tight mb-6">
            {t.hero.title}{" "}
            <span className="text-[#00A878]">{t.hero.titleAccent}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto">
            {t.hero.subtitle}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${locale}/reservar`}
              className="inline-flex items-center justify-center gap-2 bg-[#00A878] hover:bg-[#009068] text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-[#00A878]/25 hover:scale-[1.02]"
            >
              {t.hero.cta}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#servicios"
              className="inline-flex items-center justify-center gap-2 bg-[#2a3a52] hover:bg-[#334663] text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 border border-white/10"
            >
              {t.hero.ctaSecondary}
            </a>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L1440 80L1440 40C1200 80 960 0 720 20C480 40 240 80 0 40L0 80Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" className="bg-white py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-[#0F1923] mb-4">
              {t.services.title}
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              {t.services.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.services.items.map((servicio, i) => {
              const Icon = serviceIcons[i];
              const style = serviceColors[i];
              return (
                <div
                  key={servicio.titulo}
                  className={`bg-gradient-to-br ${style.color} border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group`}
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 ${style.iconBg} rounded-xl mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`w-6 h-6 ${style.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-semibold font-display text-[#0F1923] mb-2">
                    {servicio.titulo}
                  </h3>
                  <p className="text-slate-500 text-sm mb-4 leading-relaxed">
                    {servicio.descripcion}
                  </p>
                  <ul className="space-y-1.5">
                    {servicio.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-[#00A878] flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* POR QUÉ ELEGIRNOS */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block text-[#00A878] font-semibold text-sm uppercase tracking-widest mb-3">
                {t.why.label}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-display text-[#0F1923] mb-6">
                {t.why.title}
              </h2>
              <p className="text-slate-500 mb-8">{t.why.subtitle}</p>
              <div className="space-y-4">
                {t.why.items.map((v) => (
                  <div key={v.titulo} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#00A878]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-[#00A878]" />
                    </div>
                    <div>
                      <span className="font-semibold text-[#0F1923]">{v.titulo}</span>
                      <span className="text-slate-500"> — {v.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-semibold font-display text-[#0F1923] mb-6">{t.why.contact.title}</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-10 h-10 bg-[#1A2332]/5 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-[#1A2332]" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">{t.why.contact.phone}</div>
                    <div className="font-medium">+34 900 000 000</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-10 h-10 bg-[#1A2332]/5 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-[#1A2332]" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">{t.why.contact.email}</div>
                    <div className="font-medium">info@limpiezaindustrial.es</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="w-10 h-10 bg-[#1A2332]/5 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[#1A2332]" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">{t.why.contact.zone}</div>
                    <div className="font-medium">{t.why.contact.zoneValue}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="bg-[#1A2332] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-[#00A878]/20 border border-[#00A878]/40 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-[#00A878]" />
            <span className="text-sm font-medium text-[#00A878]">{t.cta.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-white mb-4">
            {t.cta.title}
          </h2>
          <p className="text-slate-400 mb-10 text-lg max-w-2xl mx-auto">
            {t.cta.subtitle}
          </p>
          <Link
            href={`/${locale}/reservar`}
            className="inline-flex items-center justify-center gap-2 bg-[#00A878] hover:bg-[#009068] text-white font-semibold px-10 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-[#00A878]/25 hover:scale-[1.02] text-lg"
          >
            {t.cta.button}
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-slate-500 text-sm mt-6">{t.cta.note}</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0F1923] py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-slate-500 text-sm">
            © {new Date().getFullYear()} {t.footer.rights}
          </div>
          <div className="flex gap-6 text-sm">
            <Link href={`/${locale}/admin/login`} className="text-slate-600 hover:text-slate-400 transition-colors">
              {t.footer.admin}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
