'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Link } from '@/i18n'; // BUG-20 : liens auto-préfixés selon la locale (as-needed)
import { Loader2, Eye, EyeOff, Mail, Lock, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useTranslations, useLocale } from 'next-intl';
import { LanguageSelector } from '@/components/LanguageSelector';

// BUG-17 : ne suivre que les redirections internes — jamais une URL absolue,
// protocole-relative (//) ou avec antislash (\), sinon open redirect.
function isSafeRedirect(path: string | null): path is string {
  return (
    !!path &&
    path.startsWith('/') &&
    !path.startsWith('//') &&
    !path.includes('\\') &&
    !path.includes('://')
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale(); // BUG-18 : la locale vient de la route (/en/login → 'en'), pas d'un ?locale= jamais défini
  const rawRedirect = searchParams.get('redirect');
  const redirect = isSafeRedirect(rawRedirect) ? rawRedirect : `/${locale}/dashboard`;
  const t = useTranslations('admin.login');

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!formData.email) newErrors.email = t('email') + ' ' + 'required';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.password) newErrors.password = t('password') + ' ' + 'required';
    else if (formData.password.length < 8) newErrors.password = 'At least 8 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      toast({ title: t('error'), description: error.message, variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    toast({ title: t('success'), description: t('successDesc') });
    router.push(redirect);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-accent-600 mb-6">
            <Truck className="h-10 w-10 text-white" />
          </Link>
          <h1 className="text-3xl font-bold text-ink-900">{t('title')}</h1>
          <p className="mt-2 text-ink-600">{t('subtitle')}</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>{t('subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400 rtl:right-3 rtl:left-auto" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={cn('pl-10 rtl:pr-10 rtl:pl-0', errors.email && 'border-red-500 focus:border-red-500 focus:ring-red-500')}
                    placeholder="admin@mongarage.fr"
                    disabled={isLoading}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                </div>
                {errors.email && <p id="email-error" className="text-sm text-red-500" role="alert">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400 rtl:right-3 rtl:left-auto" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={cn('pl-10 pr-10 rtl:pr-10 rtl:pl-0', errors.password && 'border-red-500 focus:border-red-500 focus:ring-red-500')}
                    placeholder="••••••••"
                    disabled={isLoading}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 rtl:left-3 rtl:right-auto"
                    aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p id="password-error" className="text-sm text-red-500" role="alert">{errors.password}</p>}
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin rtl:ml-2 rtl:mr-0" />
                    {t('submitting')}
                  </>
                ) : (
                  t('submit')
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-ink-500">
              <Link href="/" className="text-accent-600 hover:text-accent-700 font-medium">
                ← {t('back')}
              </Link>
            </div>

            <div className="mt-4">
              <LanguageSelector />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { LoginForm };