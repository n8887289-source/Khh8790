import { useState, type FormEvent } from 'react';
import type { Category, Product } from '../../lib/types';
import { AdminError, adminApi, type ProductPayload } from '../../lib/adminApi';
import { Button } from '../ui/Button';

type Props = {
  product: Product | null;
  categories: Category[];
  onSaved: () => void;
  onCancel: () => void;
};

const TABS = [
  { value: 'bestseller', label: 'Best Sellers' },
  { value: 'new', label: 'New Arrivals' },
  { value: 'premium', label: 'Premium' },
];

/** Create or edit a catalogue product. Mirrors the validation done on the server. */
export function AdminProductForm({ product, categories, onSaved, onCancel }: Props) {
  const [name, setName] = useState(product?.name ?? '');
  const [slug, setSlug] = useState(product?.slug ?? '');
  const [categorySlug, setCategorySlug] = useState(product?.categorySlug ?? categories[0]?.slug ?? '');
  const [tagline, setTagline] = useState(product?.tagline ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [price, setPrice] = useState(product ? String(product.price) : '');
  const [compareAtPrice, setCompareAtPrice] = useState(
    product?.compareAtPrice != null ? String(product.compareAtPrice) : '',
  );
  const [badge, setBadge] = useState(product?.badge ?? '');
  const [rating, setRating] = useState(product ? String(product.rating) : '0');
  const [reviewCount, setReviewCount] = useState(product ? String(product.reviewCount) : '0');
  const [inStock, setInStock] = useState(product?.inStock ?? true);
  const [images, setImages] = useState((product?.images ?? []).join('\n'));
  const [colors, setColors] = useState((product?.colors ?? []).join(', '));
  const [specs, setSpecs] = useState(
    (product?.specs ?? []).map((spec) => `${spec.label}: ${spec.value}`).join('\n'),
  );
  const [tabs, setTabs] = useState<string[]>(product?.tabs ?? []);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const toggleTab = (value: string) => {
    setTabs((current) =>
      current.includes(value) ? current.filter((tab) => tab !== value) : [...current, value],
    );
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setFields({});

    const payload: ProductPayload = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      categorySlug,
      tagline: tagline.trim(),
      description: description.trim(),
      price: Number(price),
      compareAtPrice: compareAtPrice.trim() ? Number(compareAtPrice) : null,
      badge: badge.trim() || null,
      rating: Number(rating),
      reviewCount: Number(reviewCount),
      inStock,
      images: images
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      colors: colors
        .split(',')
        .map((color) => color.trim())
        .filter(Boolean),
      specs: specs
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [label, ...rest] = line.split(':');
          return { label: label.trim(), value: rest.join(':').trim() };
        })
        .filter((spec) => spec.label && spec.value),
      tabs,
    };

    setBusy(true);
    try {
      if (product) await adminApi.updateProduct(product.id, payload);
      else await adminApi.createProduct(payload);
      onSaved();
    } catch (cause) {
      if (cause instanceof AdminError) {
        setError(cause.message);
        setFields(cause.fields ?? {});
      } else {
        setError('The product could not be saved.');
      }
    } finally {
      setBusy(false);
    }
  };

  const fieldError = (key: string) =>
    fields[key] ? (
      <p role="alert" className="mt-1 text-[11.5px] text-[#ff8b8b]">
        {fields[key]}
      </p>
    ) : null;

  return (
    <form onSubmit={submit} className="surface p-5 sm:p-6" noValidate>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">
          {product ? `Edit ${product.name}` : 'Add a product'}
        </h2>
        <button type="button" onClick={onCancel} className="btn btn-quiet text-[12.5px]">
          Close
        </button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="p-name" className="eyebrow">
            Name
          </label>
          <input
            id="p-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={`field mt-2 ${fields.name ? 'field-error' : ''}`}
          />
          {fieldError('name')}
        </div>

        <div>
          <label htmlFor="p-slug" className="eyebrow">
            Web address
          </label>
          <input
            id="p-slug"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="sonique-a1"
            className={`field mt-2 ${fields.slug ? 'field-error' : ''}`}
          />
          {fieldError('slug')}
        </div>

        <div>
          <label htmlFor="p-category" className="eyebrow">
            Category
          </label>
          <select
            id="p-category"
            value={categorySlug}
            onChange={(event) => setCategorySlug(event.target.value)}
            className={`field mt-2 ${fields.categorySlug ? 'field-error' : ''}`}
          >
            {categories.map((category) => (
              <option key={category.slug} value={category.slug} className="bg-navy">
                {category.name}
              </option>
            ))}
          </select>
          {fieldError('categorySlug')}
        </div>

        <div>
          <label htmlFor="p-price" className="eyebrow">
            Price (USD)
          </label>
          <input
            id="p-price"
            type="number"
            min={0}
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className={`field mt-2 ${fields.price ? 'field-error' : ''}`}
          />
          {fieldError('price')}
        </div>

        <div>
          <label htmlFor="p-compare" className="eyebrow">
            Compare-at price
          </label>
          <input
            id="p-compare"
            type="number"
            min={0}
            step="0.01"
            value={compareAtPrice}
            onChange={(event) => setCompareAtPrice(event.target.value)}
            placeholder="Optional"
            className="field mt-2"
          />
        </div>

        <div>
          <label htmlFor="p-badge" className="eyebrow">
            Badge
          </label>
          <input
            id="p-badge"
            value={badge}
            onChange={(event) => setBadge(event.target.value)}
            placeholder="Bestseller, New, Limited"
            className="field mt-2"
          />
        </div>

        <div>
          <label htmlFor="p-rating" className="eyebrow">
            Rating (0–5)
          </label>
          <input
            id="p-rating"
            type="number"
            min={0}
            max={5}
            step="0.1"
            value={rating}
            onChange={(event) => setRating(event.target.value)}
            className="field mt-2"
          />
        </div>

        <div>
          <label htmlFor="p-reviews" className="eyebrow">
            Review count
          </label>
          <input
            id="p-reviews"
            type="number"
            min={0}
            step="1"
            value={reviewCount}
            onChange={(event) => setReviewCount(event.target.value)}
            className="field mt-2"
          />
        </div>

        <div>
          <label htmlFor="p-colors" className="eyebrow">
            Colours
          </label>
          <input
            id="p-colors"
            value={colors}
            onChange={(event) => setColors(event.target.value)}
            placeholder="Midnight Black, Arctic White"
            className="field mt-2"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="p-tagline" className="eyebrow">
            Short description
          </label>
          <input
            id="p-tagline"
            value={tagline}
            onChange={(event) => setTagline(event.target.value)}
            placeholder="Wireless Headphones"
            className="field mt-2"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="p-description" className="eyebrow">
            Description
          </label>
          <textarea
            id="p-description"
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="field mt-2 resize-y"
          />
        </div>

        <div>
          <label htmlFor="p-images" className="eyebrow">
            Images (one per line)
          </label>
          <textarea
            id="p-images"
            rows={4}
            value={images}
            onChange={(event) => setImages(event.target.value)}
            placeholder="/images/products/a1-1.jpg"
            className={`field mt-2 resize-y font-mono text-[12px] ${fields.images ? 'field-error' : ''}`}
          />
          {fieldError('images')}
        </div>

        <div>
          <label htmlFor="p-specs" className="eyebrow">
            Specifications (Label: Value)
          </label>
          <textarea
            id="p-specs"
            rows={4}
            value={specs}
            onChange={(event) => setSpecs(event.target.value)}
            placeholder="Driver: 40mm beryllium"
            className="field mt-2 resize-y font-mono text-[12px]"
          />
        </div>

        <fieldset>
          <legend className="eyebrow">Collections</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {TABS.map((tab) => {
              const active = tabs.includes(tab.value);
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => toggleTab(tab.value)}
                  aria-pressed={active}
                  className={`rounded-full border px-3 py-1.5 text-[11.5px] transition ${
                    active
                      ? 'border-brand bg-brand/15 text-paper'
                      : 'border-line text-mute hover:border-white/30 hover:text-paper'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="flex items-center gap-2.5 self-end text-[13px] text-mute">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(event) => setInStock(event.target.checked)}
            className="h-4 w-4 accent-[#6947ff]"
          />
          In stock and available to buy
        </label>
      </div>

      {error ? (
        <p role="alert" className="mt-4 text-[12.5px] text-[#ff8b8b]">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving…' : product ? 'Save changes' : 'Create product'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
