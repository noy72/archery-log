import { getCurrentUser } from '@/lib/auth';
import Header from '@/components/Header';
import NewRoundClient from './NewRoundClient';

export const dynamic = 'force-dynamic';

export default async function NewRoundPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="新しい記録" user={user || undefined} />
      <NewRoundClient />
    </div>
  );
}
