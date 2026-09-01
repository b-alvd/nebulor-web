import { redirect } from 'next/navigation';

export default function OldNouveauPage({ params }) {
  redirect('/forum/nouveau');
}
