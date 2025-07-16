// app/administration/settings/components/AddUserButton.tsx
"use client";

const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;

export function AddUserButton() {
  const handleClick = () => {
    // Appelle la fonction globale pour ouvrir le modal (sera définie dans le composant parent)
    if ((window as any).openUserModal) {
      (window as any).openUserModal();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="bg-blue-800 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
    >
      <PlusIcon />
      Nouvel Utilisateur
    </button>
  );
}