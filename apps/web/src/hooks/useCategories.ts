import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Category } from '../lib/types';

let cached: Category[] | null = null;
let inFlight: Promise<Category[]> | null = null;

function loadCategories(): Promise<Category[]> {
  if (cached) return Promise.resolve(cached);
  inFlight ??= api
    .categories()
    .then((data) => {
      cached = data.categories;
      return cached;
    })
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}

/** Categories change rarely, so they are fetched once per page load. */
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(cached ?? []);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cached) return;
    let active = true;
    loadCategories()
      .then((data) => {
        if (active) setCategories(data);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Could not load categories.');
      });
    return () => {
      active = false;
    };
  }, []);

  return { categories, error };
}
