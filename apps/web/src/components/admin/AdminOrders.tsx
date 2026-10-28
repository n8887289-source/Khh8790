import { useEffect, useState } from 'react';
import { AdminError, adminApi, ORDER_STATUSES, type AdminOrder } from '../../lib/adminApi';
import { formatPrice } from '../../lib/format';

const STATUS_LABELS: Record<string, string> = {
  demo_unpaid: 'Awaiting payment (demo)',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

/** Orders placed through the store, with status updates that customers see in tracking. */
export function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const result = await adminApi.orders();
        setOrders(result.orders);
      } catch (cause) {
        setError(cause instanceof AdminError ? cause.message : 'Orders could not be loaded.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const update = async (orderNumber: string, status: string) => {
    const previous = orders;
    setOrders((current) =>
      current.map((order) => (order.orderNumber === orderNumber ? { ...order, status } : order)),
    );
    try {
      await adminApi.setOrderStatus(orderNumber, status);
      setError('');
    } catch (cause) {
      setOrders(previous);
      setError(cause instanceof AdminError ? cause.message : 'That status could not be saved.');
    }
  };

  if (loading) return <p className="text-[13px] text-mute">Loading orders…</p>;

  return (
    <div className="space-y-4">
      <p className="text-[12.5px] text-mute">
        No payment provider is connected, so every order is recorded as unpaid. Changing a status
        here is what the customer sees on their order tracking page.
      </p>

      {error ? (
        <p role="alert" className="text-[12.5px] text-[#ff8b8b]">
          {error}
        </p>
      ) : null}

      {orders.length ? (
        <div className="surface overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-line text-[10.5px] uppercase tracking-[0.16em] text-mute">
                <th scope="col" className="px-4 py-3 font-medium">
                  Order
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Customer
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Items
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Total
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.orderNumber} className="border-b border-line/60 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-mono text-[12px]">{order.orderNumber}</p>
                    <p className="mt-0.5 text-[11.5px] text-mute">
                      {new Date(order.placedAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{order.name}</p>
                    <p className="text-[11.5px] text-mute">{order.email}</p>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-mute">{order.itemCount}</td>
                  <td className="px-4 py-3 tabular-nums">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <label className="sr-only" htmlFor={`status-${order.orderNumber}`}>
                      Status for {order.orderNumber}
                    </label>
                    <select
                      id={`status-${order.orderNumber}`}
                      value={order.status}
                      onChange={(event) => void update(order.orderNumber, event.target.value)}
                      className="field py-1.5 text-[12.5px]"
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status} className="bg-navy">
                          {STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="surface p-8 text-center">
          <p className="text-[13.5px] text-mute">
            No orders yet. Orders placed through the checkout appear here.
          </p>
        </div>
      )}
    </div>
  );
}
