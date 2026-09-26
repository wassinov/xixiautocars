import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { Link } from '@/i18n';
import { MapPin, Phone, Mail, Clock, Users, Award, Wrench, Calendar, Shield, CheckCircle, Star, ArrowRight } from 'lucide-react';
import { cn, formatPrice, magazineContainer, revealDelay } from '@/lib/utils';
import { languagesAlternates, SITE_URL } from '@/lib/seo';
import { GARAGE_INFO_ID } from '@/lib/constants';
import { getLocale, getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { BreadcrumbSchema, LocalBusinessSchema } from '@/components/schema';

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('about');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      languages: languagesAlternates('/a-propos'),
    },
  };
};

export default async function AboutPage() {
  const locale = await getLocale();
  const t = await getTranslations('about');
  const tHome = await getTranslations('home');
  const supabase = await createClient();

  // Fetch garage info
  const { data: garageInfo, error: garageError } = await supabase
    .from('garage_infos')
    .select('*')
    .eq('id', GARAGE_INFO_ID)
    .single();

  if (garageError) {
    console.warn('[AboutPage] Erreur garage_infos:', garageError.message);
  }

  // Get team members from translations (3 members: indices 0, 1, 2)
  const teamMembers = [
    {
      name: t('team.members.0.name'),
      role: t('team.members.0.role'),
      bio: t('team.members.0.bio'),
    },
    {
      name: t('team.members.1.name'),
      role: t('team.members.1.role'),
      bio: t('team.members.1.bio'),
    },
    {
      name: t('team.members.2.name'),
      role: t('team.members.2.role'),
      bio: t('team.members.2.bio'),
    },
  ];

  // Parse about_text into structured lines
  function parseGarageInfoLines(text: string) {
    if (!text) return [];
    const normalized = text.replace(/\\n/g, '\n');
    const lines = normalized.split(/\n|\r\n/).map(l => l.trim()).filter(Boolean);
    return lines.map(line => {
      const lower = line.toLowerCase();
      let icon: React.ReactNode = null;
      let label = '';
      let value = line;

      if (lower.includes('wechat') || lower.includes('微信')) {
        icon = <MessageCircle className="h-5 w-5 text-[#07C160] shrink-0" aria-hidden="true" />;
        label = 'WeChat';
        value = line.replace(/^.*(wechat|微信)[:\s]*/i, '').trim();
      } else if (lower.includes('whatsapp')) {
        icon = <MessageSquare className="h-5 w-5 text-[#25D366] shrink-0" aria-hidden="true" />;
        label = 'WhatsApp';
        value = line.replace(/^.*whatsapp[:\s]*/i, '').trim();
      } else if (lower.includes('email') || lower.includes('@')) {
        icon = <Mail className="h-5 w-5 text-accent-600 shrink-0" aria-hidden="true" />;
        label = 'Email';
        value = line.replace(/^.*email[:\s]*/i, '').trim();
      } else if (lower.includes('tel') || lower.includes('phone') || /^[\d\s\+\-\(\)]{10,}$/.test(line)) {
        icon = <Phone className="h-5 w-5 text-accent-600 shrink-0" aria-hidden="true" />;
        label = 'Téléphone';
        value = line.replace(/^.*(tel|phone)[:\s]*/i, '').trim();
      } else if (lower.includes('adresse') || lower.includes('address') || lower.includes('chongqing')) {
        icon = <MapPin className="h-5 w-5 text-accent-600 shrink-0" aria-hidden="true" />;
        label = 'Adresse';
        value = line.replace(/^.*(adresse|address)[:\s]*/i, '').trim();
      }

      return { raw: line, icon, label, value };
    });
  }

  const garageLines = garageInfo?.about_text ? parseGarageInfoLines(garageInfo.about_text) : [];

  // Parse opening_hours from DB into formatted lines
  function parseOpeningHours(text: string) {
    if (!text) return [];
    // Try multiple separators: comma, semicolon, newline
    const parts = text.split(/[,;\n]/).map(p => p.trim()).filter(Boolean);
    const result = [];
    for (const part of parts) {
      // Find first colon to split days/hours (handles colons in time like "9h-19h:30")
      const colonIdx = part.indexOf(':');
      if (colonIdx > 0) {
        const days = part.slice(0, colonIdx).trim();
        const hours = part.slice(colonIdx + 1).trim();
        if (days && hours) result.push({ days, hours });
      }
    }
    return result;
  }

  const openingHours = garageInfo?.opening_hours ? parseOpeningHours(garageInfo.opening_hours) : [];

  return (
    <>
      <BreadcrumbSchema
        locale={locale}
        items={[
          { name: 'Accueil', href: '/' },
          { name: 'À propos', href: '/a-propos' },
        ]}
      />
      <LocalBusinessSchema
        name="Xixi Autocars"
        description={garageInfo?.about_text || 'Garage familial spécialisé dans la vente de véhicules neufs et d\'occasion, import/export, financement et services après-vente.'}
        address={{
          streetAddress: '2M-2 Zhongchuang incubator, Kangcheng North Road',
          addressLocality: 'Chongqing',
          addressRegion: 'Shapingba District',
          postalCode: '400000',
          addressCountry: 'CN',
        }}
        telephone="+86 23 1234 5678"
        email="contact@xixiautocars.com"
        url={SITE_URL}
        logo={`${SITE_URL}/logo.jpg`}
        image={`${SITE_URL}/og-image.jpg`}
        openingHours={['Monday 09:00-19:00', 'Tuesday 09:00-19:00', 'Wednesday 09:00-19:00', 'Thursday 09:00-19:00', 'Friday 09:00-19:00', 'Saturday 09:00-18:00']}
        priceRange="€€"
        currenciesAccepted="EUR, CNY"
        paymentAccepted="Cash, Credit Card, Bank Transfer, Financing"
        areaServed={['France', 'China', 'Europe', 'International']}
        geo={{ latitude: 29.5630, longitude: 106.5516 }}
      />
      <section className="py-12 lg:py-16 bg-ink-50" aria-labelledby="about-hero">
        <div className={magazineContainer()}>
          <h1 id="about-hero" className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-ink-900 animate-reveal text-center mb-8">
            {t('hero.title')}
          </h1>
          <div className="grid gap-12 lg:grid-cols-2 items-start">
            <div className={revealDelay(0)}>

              <div className="space-y-4 text-base text-ink-600 leading-relaxed">
                <p>{t('history.paragraph1')}</p>
                <p>{t('history.paragraph2')}</p>
                <p>{t('history.paragraph3')}</p>
              </div>
            </div>
            <div className={revealDelay(1)} style={{ aspectRatio: '4/3' }}>
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-ink-100">
                {garageInfo?.logo_url ? (
                  <Image
                    src={garageInfo.logo_url}
                    alt={garageInfo.name}
                    fill
                    className="object-cover"
                    sizes="50vw"
                    priority
                  />
                ) : (
                  <Image
                    src="/logo.jpg"
                    alt="Xixi Autocars"
                    width={400}
                    height={300}
                    className="object-contain mx-auto my-auto"
                    priority
                  />
                )}
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-reveal delay-200">
            <Link href="/contact" className={cn(
              'inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-medium text-ink-900',
              'bg-white rounded-lg hover:bg-ink-100 active:bg-ink-200',
              'hover:border-accent-300 transition-all duration-300 ease-in-out'
            )}>
              {t('hero.ctaContact')}
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/catalogue" className={cn(
              'inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-medium text-white',
              'bg-accent-600 rounded-lg hover:bg-accent-700 active:bg-accent-800',
              'hover:border-accent-300 transition-all duration-300 ease-in-out'
            )}>
              {t('hero.ctaCatalog')}
            </Link>
          </div>
        </div>
      </section>

      {/* Nos Valeurs */}
      <section className="py-12 lg:py-16 bg-ink-50" aria-labelledby="values-title">
        <div className={magazineContainer()}>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 id="values-title" className="text-3xl sm:text-4xl font-display font-bold text-ink-900 animate-reveal">{t('values.title')}</h2>
            <p className="mt-3 text-body-lg text-ink-600 animate-reveal delay-100">{t('values.subtitle')}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value, i) => (
              <article key={value.key} className={cn(
                'p-6 bg-white rounded-2xl border border-ink-200',
                'hover:border-accent-300 transition-all duration-300 ease-in-out',
                revealDelay(i)
              )}>
                <div className="w-12 h-12 rounded-xl bg-sage-100 flex items-center justify-center text-sage-600">
                  <value.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-xl font-display font-semibold text-ink-900">{t(`values.items.${value.key}.title`)}</h3>
                <p className="mt-2 text-base text-ink-600">{t(`values.items.${value.key}.desc`)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Notre Équipe */}
      <section className="py-12 lg:py-16 bg-white" aria-labelledby="team-title">
        <div className={magazineContainer()}>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 id="team-title" className="text-3xl sm:text-4xl font-display font-bold text-ink-900 animate-reveal">{t('team.title')}</h2>
            <p className="mt-3 text-body-lg text-ink-600 animate-reveal delay-100">{t('team.subtitle')}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member, i) => (
              <article key={member.name} className={cn(
                'p-6 bg-ink-50 rounded-2xl border border-ink-200 text-center',
                'hover:border-accent-300 transition-all duration-300 ease-in-out',
                revealDelay(i)
              )}>
                <div className="w-24 h-24 rounded-full bg-accent-100 flex items-center justify-center text-accent-600 font-bold text-2xl mx-auto">
                  {member.name.charAt(0)}
                </div>
                <h3 className="mt-4 text-xl font-display font-semibold text-ink-900">{member.name}</h3>
                <p className="mt-1 text-base text-accent-600 font-medium">{member.role}</p>
                <p className="mt-3 text-base text-ink-600">{member.bio}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Pourquoi nous choisir - Réutilise la section trust */}
      <section className="py-12 lg:py-16 bg-ink-50" aria-labelledby="trust-title">
        <div className={magazineContainer()}>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 id="trust-title" className="text-3xl sm:text-4xl font-display font-bold text-ink-900 animate-reveal">{t('trust.title')}</h2>
            <p className="mt-3 text-body-lg text-ink-600 animate-reveal delay-100">{t('trust.subtitle')}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_REASONS.map((reason, i) => (
              <article key={reason.key} className={cn(
                'p-6 bg-white rounded-2xl border border-ink-200',
                'hover:border-accent-300 transition-all duration-300 ease-in-out',
                revealDelay(i)
              )}>
                <div className="w-12 h-12 rounded-xl bg-sage-100 flex items-center justify-center text-sage-600">
                  <reason.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-xl font-display font-semibold text-ink-900">{t(`trust.items.${reason.key}.title`)}</h3>
                <p className="mt-2 text-base text-ink-600">{t(`trust.items.${reason.key}.desc`)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Informations Pratiques */}
      <section className="py-12 lg:py-16 bg-white" aria-labelledby="info-title">
        <div className={magazineContainer()}>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 id="info-title" className="text-3xl sm:text-4xl font-display font-bold text-ink-900 animate-reveal">{t('info.title')}</h2>
            <p className="mt-3 text-body-lg text-ink-600 animate-reveal delay-100">{t('info.subtitle')}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Col 1: Adresse + Email (empilés) */}
            <article className="p-6 bg-ink-50 rounded-2xl border border-ink-200 hover:border-accent-300 transition-all duration-300 ease-in-out">
              <div className="w-12 h-12 rounded-xl bg-sage-100 flex items-center justify-center text-sage-600">
                <MapPin className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-xl font-display font-semibold text-ink-900">{t('info.address.title')}</h3>
              <address className="mt-2 not-italic text-ink-600 whitespace-pre-line">
                {garageInfo?.address || '2M-2 Zhongchuang incubator, Kangcheng North Road, Xianglushan Street, Shapingba District, Chongqing'}
              </address>
              {/* Email */}
              <div className="mt-6 flex items-center gap-3">
                <Mail className="h-5 w-5 text-accent-600 shrink-0" aria-hidden="true" />
                <a href="mailto:contact@xixiautocars.com" className="text-ink-600 hover:text-accent-600 transition-colors">
                  contact@xixiautocars.com
                </a>
              </div>
            </article>

            {/* Col 2: Téléphone, WeChat, WhatsApp (empilés) */}
            <article className="p-6 bg-ink-50 rounded-2xl border border-ink-200 hover:border-accent-300 transition-all duration-300 ease-in-out">
              <div className="w-12 h-12 rounded-xl bg-sage-100 flex items-center justify-center text-sage-600">
                <Phone className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-xl font-display font-semibold text-ink-900">{t('info.contact.title')}</h3>
              <div className="mt-4 space-y-4">
                {/* Téléphone */}
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-accent-600 shrink-0" aria-hidden="true" />
                  <a href={`tel:${garageInfo?.phone?.replace(/\s/g, '') || '+8619112816914'}`} className="text-ink-600 hover:text-accent-600 transition-colors">
                    {garageInfo?.phone || '+86 191 1281 6914'}
                  </a>
                </div>
                {/* WeChat */}
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-[#07C160] shrink-0" aria-hidden="true" />
                  <span className="text-ink-600">WeChat: XX827378447</span>
                </div>
                {/* WhatsApp */}
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-[#25D366] shrink-0" aria-hidden="true" />
                  <a href="https://wa.me/8619112816914" target="_blank" rel="noopener noreferrer" className="text-ink-600 hover:text-accent-600 transition-colors">
                    WhatsApp: +86 191 1281 6914
                  </a>
                </div>
              </div>
            </article>

            {/* Col 3: Horaires */}
            <article className="p-6 bg-ink-50 rounded-2xl border border-ink-200 hover:border-accent-300 transition-all duration-300 ease-in-out">
              <div className="w-12 h-12 rounded-xl bg-sage-100 flex items-center justify-center text-sage-600">
                <Clock className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-xl font-display font-semibold text-ink-900">{t('info.hours.title')}</h3>
              <div className="mt-2 text-ink-600 whitespace-pre-line">
                {openingHours.length > 0 ? (
                  openingHours.map((oh, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="font-medium shrink-0">{oh.days} :</span>
                      <span>{oh.hours}</span>
                    </div>
                  ))
                ) : garageInfo?.opening_hours ? (
                  // Fallback: afficher le texte brut si parsing échoue
                  garageInfo.opening_hours
                ) : (
                  t('info.hours.value')
                )}
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 lg:py-24 bg-ink-950" aria-labelledby="cta-title">
        <div className={magazineContainer()}>
          <div className="text-center max-w-3xl mx-auto">
            <h2 id="cta-title" className="text-3xl sm:text-4xl font-display font-bold text-white animate-reveal">{t('cta.title')}</h2>
            <p className="mt-4 text-body-lg text-ink-400 animate-reveal delay-100">{t('cta.description')}</p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-reveal delay-200">
              <Link href="/contact" className={cn(
                'inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-medium text-ink-900',
                'bg-white rounded-lg hover:bg-ink-100 active:bg-ink-200',
                'hover:border-accent-300 transition-all duration-300 ease-in-out'
              )}>
                {t('cta.contact')}
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/catalogue" className={cn(
                'inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-medium text-white',
                'bg-accent-600 rounded-lg hover:bg-accent-700 active:bg-accent-800',
                'hover:border-accent-300 transition-all duration-300 ease-in-out'
              )}>
                {t('cta.catalog')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// Valeurs - réutilisables depuis home/trust + nouvelles
const VALUES = [
  { icon: Star, key: 'quality' },
  { icon: Shield, key: 'transparency' },
  { icon: Users, key: 'service' },
  { icon: Award, key: 'expertise' },
];

// Réutiliser TRUST_REASONS de la page d'accueil
import { MessageCircle, MessageSquare } from 'lucide-react';
const TRUST_REASONS = [
  { icon: Star, key: 'inspection' },
  { icon: Star, key: 'network' },
  { icon: Star, key: 'documents' },
  { icon: Star, key: 'payment' },
];