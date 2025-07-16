// app/page.tsx
import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirige simplement vers le tableau de bord principal
  redirect('/administration');
}