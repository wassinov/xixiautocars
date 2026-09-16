/**
 * Types des données retournées par Supabase pour la table `cars` et ses relations.
 *
 * Important : `models` et `brands` sont des relations plusieurs-vers-un
 * (une voiture appartient à UN modèle, un modèle à UNE marque).
 * Supabase/PostgREST les retourne donc comme des OBJETS UNIQUES, pas des tableaux.
 * `car_images` est une relation un-à-plusieurs : elle est bien un TABLEAU.
 */

export type Brand = {
  id: string;
  name: string;
};

export type Model = {
  id: string;
  name: string;
  body_type: string | null;
  brand_id: string;
};

export type CarImage = {
  id: string;
  image_url: string;
  is_primary: boolean;
  order_index?: number;
};

export type CarWithRelations = {
  id: string;
  is_new: boolean;
  is_featured: boolean;
  year: number;
  mileage: number | null;
  price: number;
  currency: string;
  color: string | null;
  gearbox: string | null;
  fuel_type: string | null;
  is_available?: boolean;
  description?: string | null;
  features?: Record<string, unknown> | null;
  created_at?: string;
  /** Objet unique — ne JAMAIS appeler .map() dessus. */
  models: (Model & { brands: Brand }) | null;
  /** Tableau — .map() est valide ici. */
  car_images: CarImage[];
};
