'use client';

import { useState } from 'react';
import { Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

const contactSchema = z.object({
  full_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().regex(/^[0-9\s\+\-\.\(\)]{10,}$/, 'Numéro de téléphone invalide').optional().or(z.literal('')),
  car_id: z.string().uuid().optional().or(z.literal('')),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactFormProps {
  initialCarId?: string;
  carName?: string;
  className?: string;
}

export function ContactForm({ initialCarId, carName, className }: ContactFormProps) {
  const t = useTranslations('contact.form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [formData, setFormData] = useState<ContactFormData>({
    full_name: '',
    email: '',
    phone: '',
    car_id: initialCarId || '',
    message: carName ? `${t('messagePrefix', { vehicle: carName })}` : '',
  });

  const validateField = (name: keyof ContactFormData, value: string) => {
    const fieldSchema = contactSchema.shape[name];
    const result = fieldSchema.safeParse(value);
    if (!result.success) {
      setErrors((prev) => ({ ...prev, [name]: result.error.errors[0].message }));
    } else {
      setErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
    }
  };

  const handleChange = (name: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Partial<Record<keyof ContactFormData, string>> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) newErrors[err.path[0] as keyof ContactFormData] = err.message;
      });
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Erreur lors de l\'envoi');

      toast({ title: t('success'), description: t('successDesc'), variant: 'success' });
      setFormData({ full_name: '', email: '', phone: '', car_id: initialCarId || '', message: carName ? `Bonjour, je suis intéressé par le véhicule : ${carName}.\n\n` : '' });
    } catch (err) {
      toast({ title: t('error'), description: err instanceof Error ? err.message : t('errorDesc'), variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const FormField = ({ label, required, error, children, id }: { label: string; required?: boolean; error?: string; children: React.ReactNode; id: string }) => (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm text-ink-700 font-body">
        {label} {required && <span className="text-terracotta-600">*</span>}
      </Label>
      {children}
      {error && <p id={`${id}-error`} className="text-sm text-terracotta-600" role="alert">{error}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)} noValidate>
      <div className="grid gap-6 md:grid-cols-2">
        <FormField label={t('name')} required error={errors.full_name} id="full_name">
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => handleChange('full_name', e.target.value)}
            error={!!errors.full_name}
            placeholder={t('placeholders.name')}
          />
        </FormField>

        <FormField label={t('email')} required error={errors.email} id="email">
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={!!errors.email}
            placeholder={t('placeholders.email')}
          />
        </FormField>

        <FormField label={t('phone')} error={errors.phone} id="phone">
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            error={!!errors.phone}
            placeholder={t('placeholders.phone')}
          />
        </FormField>
      </div>

      {initialCarId && (
        <input type="hidden" name="car_id" value={initialCarId} />
      )}

      <FormField label={t('message')} required error={errors.message} id="message">
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => handleChange('message', e.target.value)}
          error={!!errors.message}
          rows={5}
          placeholder={t('placeholders.message')}
        />
      </FormField>

      <Button type="submit" className="w-full" disabled={isSubmitting} size="lg">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('submitting')}
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            {t('submit')}
          </>
        )}
      </Button>

      <p className="text-center text-sm text-ink-500">
        {t('required')}
      </p>
    </form>
  );
}