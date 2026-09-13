import { cn } from '@/lib/cn';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
};

// Palette restreinte à des teintes de la marque plutôt qu'une palette
// arc-en-ciel générique : garde les avatars cohérents avec l'identité
// visuelle de l'application quel que soit le nom de l'utilisateur.
const BACKGROUND_CLASSES = [
  'bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-300',
  'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
  'bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-300',
];

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';

  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return `${first}${last}`.toUpperCase();
};

const hashName = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

/**
 * Avatar utilisateur généré à partir de ses initiales. Le projet ne gère
 * pas l'upload de photo de profil (pas d'infrastructure de stockage de
 * fichiers nécessaire pour un gestionnaire de dépenses personnel) : un
 * avatar déterministe basé sur le nom offre une identification visuelle
 * équivalente sans cette complexité.
 */
export const Avatar = ({ name, size = 'md', className }: AvatarProps) => {
  const backgroundClass =
    BACKGROUND_CLASSES[hashName(name) % BACKGROUND_CLASSES.length] ?? BACKGROUND_CLASSES[0];

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold',
        SIZE_CLASSES[size],
        backgroundClass,
        className,
      )}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  );
};
