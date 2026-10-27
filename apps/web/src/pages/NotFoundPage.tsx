import { Button } from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="shell flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="mt-4 text-[34px] sm:text-[48px]">This page is out of range</h1>
      <p className="mt-4 max-w-md text-[14.5px] text-mute">
        We could not find the page you were looking for. The link may be out of date, or the address
        may have been mistyped.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button to="/">Back to home</Button>
        <Button to="/shop" variant="outline">
          Shop the collection
        </Button>
      </div>
    </div>
  );
}
