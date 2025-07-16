// app/administration/components/UserAvatar.tsx
import Image from 'next/image';

const UserIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
    </svg>
);

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: number;
}

export const UserAvatar = ({ src, name, size = 40 }: UserAvatarProps) => {
  // Si une URL de photo est fournie, on affiche l'image
  if (src) {
    return (
      <div className="rounded-full overflow-hidden" style={{ width: size, height: size }}>
        <Image
          src={src}
          alt={name || 'Avatar'}
          width={size}
          height={size}
          className="object-cover w-full h-full"
        />
      </div>
    );
  }

  // Sinon, on affiche l'icône générique
  return (
    <div
      className="rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-dark-subtle"
      style={{ width: size, height: size }}
    >
        <UserIcon />
    </div>
  );
};