// enarva-nextjs-dashboard-app/app/administration/components/skeletons/InitialLoader.tsx
import Image from 'next/image';

export function InitialLoader() {
  return (
    // Un conteneur qui prend tout l'écran avec la couleur de fond appropriée
    <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-dark-background">
      {/* L'animation de pulsation est appliquée ici */}
      <div className="animate-pulse">
        {/* Logo pour le mode clair */}
        <Image
          src="/images/light-logo.png"
          alt="Logo Enarva"
          width={180}
          height={50}
          className="dark:hidden" // Caché en mode sombre
          priority
        />
        {/* Logo pour le mode sombre */}
        <Image
          src="/images/dark-logo.png"
          alt="Logo Enarva"
          width={180}
          height={50}
          className="hidden dark:block" // Caché en mode clair
          priority
        />
      </div>
    </div>
  );
}