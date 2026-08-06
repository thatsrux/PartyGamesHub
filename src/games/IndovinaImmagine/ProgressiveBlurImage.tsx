import { useEffect, useState } from 'react';
import { getServerTime } from '../../utils/serverTime';
import { getImageRevealStyle } from './imageReveal';

export default function ProgressiveBlurImage({ src, startTime, durationMs }: { src: string; startTime: number; durationMs: number }) {
  const [elapsedMs, setElapsedMs] = useState(() => Math.max(0, getServerTime() - startTime));

  useEffect(() => {
    const update = () => setElapsedMs(Math.max(0, getServerTime() - startTime));
    update();
    const interval = window.setInterval(update, 100);
    return () => window.clearInterval(interval);
  }, [src, startTime, durationMs]);

  const reveal = getImageRevealStyle(elapsedMs, durationMs);

  return (
    <img
      src={src}
      alt="Immagine misteriosa"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        filter: `blur(${reveal.blurPx.toFixed(2)}px) brightness(${reveal.brightness.toFixed(3)})`,
        transform: `scale(${reveal.scale.toFixed(4)})`,
        transition: 'filter 120ms linear, transform 120ms linear',
        willChange: 'filter, transform'
      }}
    />
  );
}
