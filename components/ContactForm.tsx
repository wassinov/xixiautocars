'use client';

import { useState } from 'react';
import { Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { z } from 'zod';

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
}

export function ContactForm({ initialCarId, carName }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [formData, setFormData] = useState<ContactFormData>({
    full_name: '',
    email: '',
    phone: '',
    car_id: initialCarId || '',
    message: carName ? `Bonjour, je suis intéressé par le véhicule : ${carName}.\n\n` : '',
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

      toast({ title: 'Message envoyé', description: 'Nous vous répondrons dans les plus brefs délais.', variant: 'default' });
      setFormData({ full_name: '', email: '', phone: '', car_id: initialCarId || '', message: carName ? `Bonjour, je suis intéressé par le véhicule : ${carName}.\n\n` : '' });
    } catch (err) {
      toast({ title: 'Erreur', description: err instanceof Error ? err.message : 'Impossible d\'envoyer le message', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Label htmlFor="full_name" className="block text-sm font-medium text-neutral-700">
            Nom complet <span className="text-red-500">*</span>
          </Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => handleChange('full_name', e.target.value)}
            className={errors.full_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            aria-invalid={!!errors.full_name}
            aria-describedby={errors.full_name ? 'full_name-error' : undefined}
            placeholder="Jean Dupont"
          />
          {errors.full_name && <p id="full_name-error" className="mt-1 text-sm text-red-500" role="alert">{errors.full_name}</p>}
        </div>

        <div>
          <Label htmlFor="email" className="block text-sm font-medium text-neutral-700">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            placeholder="jean.dupont@email.fr"
          />
          {errors.email && <p id="email-error" className="mt-1 text-sm text-red-500" role="alert">{errors.email}</p>}
        </div>

        <div>
          <Label htmlFor="phone" className="block text-sm font-medium text-neutral-700">
            Téléphone
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
            placeholder="06 12 34 56 78"
          />
          {errors.phone && <p id="phone-error" className="mt-1 text-sm text-red-500" role="alert">{errors.phone}</p>}
        </div>
      </div>

      {initialCarId && (
        <input type="hidden" name="car_id" value={initialCarId} />
      )}

      <div>
        <Label htmlFor="message" className="block text-sm font-medium text-neutral-700">
          Message <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => handleChange('message', e.target.value)}
          rows={5}
          className={errors.message ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'message-error' : undefined}
          placeholder="Décrivez votre demande..."
        />
        {errors.message && <p id="message-error" className="mt-1 text-sm text-red-500" role="alert">{errors.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting} size="lg">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Envoyer le message
          </>
        )}
      </Button>

      <p className="text-center text-sm text-neutral-500">
        Les champs marqués d'un <span className="text-red-500">*</span> sont obligatoires.
      </p>
    </form>
  );
}