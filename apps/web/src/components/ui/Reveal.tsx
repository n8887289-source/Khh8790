import { useEffect, useRef, useState, type ReactNode } from 'react';
import { classNames } from '../../lib/format';

type Props = {
  children: ReactNode;
  className?: string;
  /** Delay in ms, used to stagger items in a grid. */
  delay?: number;
  as?: 'div' | 'section' | 'li' | 'article';
};

/** Fades a section in as it scrolls into view. Motion is skipped when the
 * visitor asks for reduced motion (handled in CSS). */
export function Reveal({ children, className, delay = 0, as = 'div' }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const Tag = as as 'div';

  return (
    <Tag
      ref={ref as never}
      className={classNames('reveal', visible && 'is-visible', className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
