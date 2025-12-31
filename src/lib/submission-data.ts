
import type { Submission } from '@/lib/types';
import { JsonStore } from '@/lib/json-store';

export async function getSubmissions(): Promise<Submission[]> {
  const store = new JsonStore<Submission[]>('src/data/submissions.json', []);
  const submissions = await store.read();
  return submissions.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
