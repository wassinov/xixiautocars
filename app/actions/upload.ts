'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface CarImage {
  id: string;
  car_id: string;
  image_url: string;
  is_primary: boolean;
  order_index: number;
  created_at: string;
}

interface UploadResult {
  data?: CarImage;
  error?: string;
}

interface DeleteResult {
  success?: boolean;
  error?: string;
}

interface SetPrimaryResult {
  success?: boolean;
  error?: string;
}

/**
 * Upload une image de voiture vers Supabase Storage et insère l'enregistrement dans car_images
 */
export async function uploadCarImage(
  carId: string,
  file: File,
  orderIndex: number
): Promise<UploadResult> {
  try {
    const supabase = await createClient();

    // Validation du fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { error: 'Format non supporté. Utilisez JPG, PNG ou WebP.' };
    }

    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      return { error: 'Fichier trop volumineux. Maximum 5 MB.' };
    }

    // Générer le nom de fichier
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `img_${Date.now()}.${ext}`;
    const filePath = `car-images/${carId}/${fileName}`;

    // Upload vers Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('car-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { error: `Erreur d'upload: ${uploadError.message}` };
    }

    // Obtenir l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from('car-images')
      .getPublicUrl(filePath);

    // Déterminer si c'est la première image (principale)
    const { data: existingImages } = await supabase
      .from('car_images')
      .select('id')
      .eq('car_id', carId);

    const isPrimary = !existingImages || existingImages.length === 0;

    // Insérer dans la table car_images
    const { data: imageData, error: insertError } = await supabase
      .from('car_images')
      .insert({
        car_id: carId,
        image_url: publicUrl,
        is_primary: isPrimary,
        order_index: orderIndex,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      // Nettoyer le fichier uploadé en cas d'erreur
      await supabase.storage.from('car-images').remove([filePath]);
      return { error: `Erreur base de données: ${insertError.message}` };
    }

    revalidatePath(`/dashboard/cars/${carId}`);
    revalidatePath('/dashboard/cars');

    return { data: imageData as CarImage };
  } catch (err) {
    console.error('Unexpected error in uploadCarImage:', err);
    return { error: 'Erreur inattendue lors de l\'upload' };
  }
}

/**
 * Supprime une image de voiture (BDD + Storage)
 */
export async function deleteCarImage(
  imageId: string,
  imageUrl: string
): Promise<DeleteResult> {
  try {
    const supabase = await createClient();

    // Extraire le chemin du fichier depuis l'URL
    // URL format: https://xxx.supabase.co/storage/v1/object/public/car-images/carId/filename.jpg
    const urlParts = imageUrl.split('/car-images/');
    if (urlParts.length < 2) {
      return { error: 'URL d\'image invalide' };
    }
    const filePath = urlParts[1];

    // Supprimer de la base de données
    const { error: dbError } = await supabase
      .from('car_images')
      .delete()
      .eq('id', imageId);

    if (dbError) {
      console.error('DB delete error:', dbError);
      return { error: `Erreur suppression BDD: ${dbError.message}` };
    }

    // Supprimer du Storage
    const { error: storageError } = await supabase.storage
      .from('car-images')
      .remove([filePath]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
      // Ne pas bloquer si le fichier n'existe plus dans le storage
      console.warn('Fichier storage non trouvé ou déjà supprimé:', storageError.message);
    }

    // Extraire le carId depuis l'URL pour revalider la page d'édition
    const carIdFromUrl = urlParts[1]?.split('/')[0];
    if (carIdFromUrl) {
      revalidatePath(`/dashboard/cars/${carIdFromUrl}`);
    }
    revalidatePath('/dashboard/cars');

    return { success: true };
  } catch (err) {
    console.error('Unexpected error in deleteCarImage:', err);
    return { error: 'Erreur inattendue lors de la suppression' };
  }
}

/**
 * Définit une image comme principale (une seule par voiture)
 */
export async function setPrimaryImage(
  carId: string,
  imageId: string
): Promise<SetPrimaryResult> {
  try {
    const supabase = await createClient();

    // 1. Mettre toutes les images de cette voiture à is_primary = false
    const { error: resetError } = await supabase
      .from('car_images')
      .update({ is_primary: false })
      .eq('car_id', carId);

    if (resetError) {
      console.error('Reset primary error:', resetError);
      return { error: `Erreur reset: ${resetError.message}` };
    }

    // 2. Mettre l'image sélectionnée à is_primary = true
    const { error: setError } = await supabase
      .from('car_images')
      .update({ is_primary: true })
      .eq('id', imageId);

    if (setError) {
      console.error('Set primary error:', setError);
      return { error: `Erreur définition principale: ${setError.message}` };
    }

    revalidatePath(`/dashboard/cars/${carId}`);
    revalidatePath('/dashboard/cars');

    return { success: true };
  } catch (err) {
    console.error('Unexpected error in setPrimaryImage:', err);
    return { error: 'Erreur inattendue lors de la définition de l\'image principale' };
  }
}