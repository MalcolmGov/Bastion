import { redirect } from 'next/navigation';

export default function SreRedirectPage() {
  redirect('/admin/incidents');
}
