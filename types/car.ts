/**
 * Types des données retournées par Supabase pour la table `cars` et ses relations.
 *
 * Convention PostgREST pour les embeds imbriqués (BUG-07) :
 * - relation TO-ONE (FK sur la table interrogée, ex. cars.model_id → models) : OBJET
 * - relation TO-MANY (FK inverse, ex. car_images.car_id → cars) : TABLEAU
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
  brands: Brand; // to-one : models.brand_id → brands
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
  models: Model | null; // to-one : cars.model_id → models
  car_images: CarImage[]; // to-many : car_images.car_id → cars
};
