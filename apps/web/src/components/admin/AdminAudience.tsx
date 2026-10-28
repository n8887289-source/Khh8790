import { useEffect, useState } from 'react';
import {
  AdminError,
  adminApi,
  type AdminMessage,
  type AdminSubscriber,
} from '../../lib/adminApi';

/** Newsletter subscribers and contact messages captured by the store. */
export function AdminAudience() {
  const [subscribers, setSubscribers] = useState<AdminSubscriber[]>([]);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [audience, inbox] = await Promise.all([adminApi.subscribers(), adminApi.messages()]);
        setSubscribers(audience.subscribers);
        setMessages(inbox.messages);
      } catch (cause) {
        setError(cause instanceof AdminError ? cause.message : 'The list could not be loaded.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p className="text-[13px] text-mute">Loading…</p>;

  return (
    <div className="space-y-6">
      {error ? (
        <p role="alert" className="text-[12.5px] text-[#ff8b8b]">
          {error}
        </p>
      ) : null}

      <section aria-labelledby="subs-title">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="subs-title" className="text-lg font-semibold">
            Newsletter subscribers
          </h2>
          <p className="text-[12px] text-mute">{subscribers.length} total</p>
        </div>
        <div className="surface mt-3 divide-y divide-line/60">
          {subscribers.length ? (
            subscribers.map((subscriber) => (
              <div
                key={subscriber.email}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-[13px]"
              >
                <span>{subscriber.email}</span>
                <span className="text-[11.5px] text-mute">
                  {new Date(subscriber.joinedAt).toLocaleDateString()}
                </span>
              </div>
            ))
          ) : (
            <p className="px-4 py-6 text-center text-[13px] text-mute">
              No subscribers yet.
            </p>
          )}
        </div>
      </section>

      <section aria-labelledby="msgs-title">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="msgs-title" className="text-lg font-semibold">
            Contact messages
          </h2>
          <p className="text-[12px] text-mute">{messages.length} total</p>
        </div>
        <div className="mt-3 space-y-3">
          {messages.length ? (
            messages.map((message) => (
              <article key={`${message.email}-${message.sentAt}`} className="surface p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-mute">
                  <span className="font-medium text-paper">
                    {message.name} · {message.topic}
                  </span>
                  <span>{new Date(message.sentAt).toLocaleDateString()}</span>
                </div>
                <p className="mt-1 text-[12px] text-mute">{message.email}</p>
                <p className="mt-2 whitespace-pre-line text-[13px] leading-relaxed">
                  {message.message}
                </p>
              </article>
            ))
          ) : (
            <div className="surface p-6 text-center">
              <p className="text-[13px] text-mute">No messages yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
