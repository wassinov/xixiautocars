import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { Link } from '@/i18n';
import { Truck, MapPin, Phone, Mail, Clock, Users, Award, Wrench, Calendar, Shield, CheckCircle, Star, ArrowRight } from 'lucide-react';
import { cn, formatPrice, magazineContainer, revealDelay } from '@/lib/utils';
import { languagesAlternates } from '@/lib/seo';
import { GARAGE_INFO_ID } from '@/lib/constants';
import { getLocale, getTranslations } from 'next-intl/server';
import Image from 'next/image';

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
  const { data: garageInfo } = await supabase
    .from('garage_infos')
    .select('*')
    .eq('id', GARAGE_INFO_ID)
    .single();

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

  return (
    <>
      <section className="py-20 lg:py-28 bg-ink-50" aria-labelledby="about-hero">
        <div className={magazineContainer()}>
          <div className="max-w-3xl mx-auto text-center">
            <h1 id="about-hero" className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-ink-900 animate-reveal">
              {t('hero.title')}
            </h1>
            <p className="mt-6 text-body-lg text-ink-600 animate-reveal delay-100 max-w-2xl mx-auto">
              {t('hero.subtitle')}
            </p>
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
        </div>
      </section>

      {/* Notre Histoire */}
      <section className="py-12 lg:py-16 bg-white" aria-labelledby="history-title">
        <div className={magazineContainer()}>
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className={revealDelay(0)}>
              <h2 id="history-title" className="text-3xl sm:text-4xl font-display font-bold text-ink-900">{t('history.title')}</h2>
              <div className="mt-6 space-y-4 text-base text-ink-600 leading-relaxed">
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
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-ink-400">
                    <Truck className="h-24 w-24" />
                  </div>
                )}
              </div>
            </div>
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
            {TEAM_MEMBERS.map((member, i) => (
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

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <article className="p-6 bg-ink-50 rounded-2xl border border-ink-200 hover:border-accent-300 transition-all duration-300 ease-in-out">
              <div className="w-12 h-12 rounded-xl bg-sage-100 flex items-center justify-center text-sage-600">
                <MapPin className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-xl font-display font-semibold text-ink-900">{t('info.address.title')}</h3>
              <address className="mt-2 not-italic text-ink-600 whitespace-pre-line">
                {garageInfo?.address || '2M-2 Zhongchuang incubator, Kangcheng North Road, Xianglushan Street, Shapingba District, Chongqing'}
              </address>
            </article>

            <article className="p-6 bg-ink-50 rounded-2xl border border-ink-200 hover:border-accent-300 transition-all duration-300 ease-in-out">
              <div className="w-12 h-12 rounded-xl bg-sage-100 flex items-center justify-center text-sage-600">
                <Phone className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-xl font-display font-semibold text-ink-900">{t('info.phone.title')}</h3>
              <p className="mt-2 text-ink-600">
                <a href={`tel:${garageInfo?.phone?.replace(/\s/g, '') || '+8619112816914'}`} className="hover:text-accent-600 transition-colors">
                  {garageInfo?.phone || '+86 191 1281 6914'}
                </a>
              </p>
            </article>

            <article className="p-6 bg-ink-50 rounded-2xl border border-ink-200 hover:border-accent-300 transition-all duration-300 ease-in-out">
              <div className="w-12 h-12 rounded-xl bg-sage-100 flex items-center justify-center text-sage-600">
                <Mail className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-xl font-display font-semibold text-ink-900">{t('info.email.title')}</h3>
              <p className="mt-2 text-ink-600">
                <a href="mailto:contact@xixiautocars.com" className="hover:text-accent-600 transition-colors">
                  contact@xixiautocars.com
                </a>
              </p>
            </article>

            <article className="p-6 bg-ink-50 rounded-2xl border border-ink-200 hover:border-accent-300 transition-all duration-300 ease-in-out">
              <div className="w-12 h-12 rounded-xl bg-sage-100 flex items-center justify-center text-sage-600">
                <Clock className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-xl font-display font-semibold text-ink-900">{t('info.hours.title')}</h3>
              <p className="mt-2 text-ink-600 whitespace-pre-line">{t('info.hours.value')}</p>
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

// Équipe - données statiques pour l'instant
const TEAM_MEMBERS = [
  { name: 'Xixi', role: 'Fondateur & Directeur', bio: 'Passionné d\'automobile depuis 30 ans, il a fondé Xixi Autocars en 1980.' },
  { name: 'Li Wei', role: 'Responsable Ventes', bio: 'Expert en véhicules neufs et occasions, il accompagne chaque client avec transparence.' },
  { name: 'Chen Hong', role: 'Responsable Atelier', bio: 'Technicien certifié, il veille à ce que chaque véhicule soit parfait avant la livraison.' },
];

// Réutiliser TRUST_REASONS de la page d'accueil
import { MessageCircle, MessageSquare } from 'lucide-react';
const TRUST_REASONS = [
  { icon: Star, key: 'inspection' },
  { icon: Star, key: 'network' },
  { icon: Star, key: 'documents' },
  { icon: Star, key: 'payment' },
];