import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="shell flex min-h-[60vh] flex-col justify-center py-20">
      <p className="label-xs">404</p>
      <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">That page is not here</h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-mist">
        The link may be out of date. Everything the store has to offer is one step away.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/shop" className="btn-primary">
          Browse products <ArrowRight size={16} />
        </Link>
        <Link to="/" className="btn-outline">
          Back home
        </Link>
        <Link to="/contact" className="btn-ghost">
          Contact support
        </Link>
      </div>
    </div>
  );
}
