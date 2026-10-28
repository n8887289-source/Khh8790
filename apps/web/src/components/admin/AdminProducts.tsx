import { useEffect, useState } from 'react';
import type { Category, Product } from '../../lib/types';
import { AdminError, adminApi } from '../../lib/adminApi';
import { AdminProductForm } from './AdminProductForm';
import { Button } from '../ui/Button';
import { formatPrice } from '../../lib/format';
import { PlusIcon, TrashIcon } from '../../lib/icons';

type Props = { categories: Category[] };

/** Catalogue management: create, edit and delete products. */
export function AdminProducts({ categories }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const result = await adminApi.products();
      setProducts(result.products);
      setError('');
    } catch (cause) {
      setError(cause instanceof AdminError ? cause.message : 'Products could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const remove = async (product: Product) => {
    if (!window.confirm(`Delete ${product.name}? This cannot be undone.`)) return;
    try {
      await adminApi.deleteProduct(product.id);
      setProducts((current) => current.filter((item) => item.id !== product.id));
    } catch (cause) {
      setError(cause instanceof AdminError ? cause.message : 'The product could not be deleted.');
    }
  };

  const visible = products.filter((product) =>
    `${product.name} ${product.categoryName} ${product.slug}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );

  return (
    <div className="space-y-5">
      {creating || editing ? (
        <AdminProductForm
          product={editing}
          categories={categories}
          onCancel={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSaved={async () => {
            setEditing(null);
            setCreating(false);
            await load();
          }}
        />
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find a product"
            aria-label="Find a product"
            className="field max-w-[240px]"
          />
          <p className="text-[12.5px] text-mute">
            {loading ? 'Loading…' : `${visible.length} of ${products.length}`}
          </p>
        </div>
        {!creating && !editing ? (
          <Button size="sm" onClick={() => setCreating(true)}>
            <PlusIcon size={14} />
            Add product
          </Button>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="text-[12.5px] text-[#ff8b8b]">
          {error}
        </p>
      ) : null}

      <div className="surface overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-line text-[10.5px] uppercase tracking-[0.16em] text-mute">
              <th scope="col" className="px-4 py-3 font-medium">
                Product
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Category
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Price
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Stock
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((product) => (
              <tr key={product.id} className="border-b border-line/60 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt=""
                        className="h-10 w-10 rounded-md object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="h-10 w-10 rounded-md bg-navy" aria-hidden="true" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-medium">{product.name}</p>
                      <p className="truncate text-[11.5px] text-mute">/{product.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-mute">{product.categoryName}</td>
                <td className="px-4 py-3 tabular-nums">{formatPrice(product.price)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] ${
                      product.inStock
                        ? 'border-emerald-400/30 text-emerald-300'
                        : 'border-[#ff8b8b]/30 text-[#ff8b8b]'
                    }`}
                  >
                    {product.inStock ? 'In stock' : 'Out of stock'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setCreating(false);
                        setEditing(product);
                      }}
                      className="text-[12px] text-brand-soft transition hover:text-paper"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(product)}
                      aria-label={`Delete ${product.name}`}
                      className="text-mute transition hover:text-[#ff8b8b]"
                    >
                      <TrashIcon size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && !visible.length ? (
          <p className="px-4 py-8 text-center text-[13px] text-mute">No products match that search.</p>
        ) : null}
      </div>
    </div>
  );
}
