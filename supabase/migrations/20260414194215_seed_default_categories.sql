-- ══════════════════════════════════════════════════════════
-- Migration: seed_default_categories
-- Creates a function that auto-seeds default categories
-- when a new user registers via Supabase Auth trigger.
-- ══════════════════════════════════════════════════════════

-- Function: called by the trigger below on every new user
CREATE OR REPLACE FUNCTION public.handle_new_user_categories()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.categories (user_id, name, color, icon) VALUES
    (NEW.id, 'Еда',          '#FF7056', 'UtensilsCrossed'),
    (NEW.id, 'Транспорт',    '#3BE8D0', 'Car'),
    (NEW.id, 'Развлечения',  '#a78bfa', 'Gamepad2'),
    (NEW.id, 'ЖКХ',          '#4DA3FF', 'Home'),
    (NEW.id, 'Здоровье',     '#34d399', 'Heart'),
    (NEW.id, 'Одежда',       '#f97316', 'ShoppingBag'),
    (NEW.id, 'Зарплата',     '#00D1A0', 'Briefcase'),
    (NEW.id, 'Фриланс',      '#FF9F43', 'Laptop'),
    (NEW.id, 'Прочее',       '#8A9099', 'MoreHorizontal');
  RETURN NEW;
END;
$$;

-- Trigger: fires after a new row is inserted in auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_categories();
