"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import s from "./ProductGallery.module.scss";

/** Native scroll-snap swipe gallery; dots follow the scroll position. No carousel library. */
export function ProductGallery({ images }: { images: { url: string; alt: string }[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);

  function onScroll() {
    const el = trackRef.current;
    if (!el) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  function goTo(i: number) {
    const el = trackRef.current;
    el?.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div className={s.gallery}>
      <ul ref={trackRef} className={s.track} onScroll={onScroll} aria-label="Product images">
        {images.map((img, i) => (
          <li key={img.url} className={s.slide} aria-label={`Image ${i + 1} of ${images.length}`}>
            <Image
              src={img.url}
              alt={img.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority={i === 0}
              className={s.image}
            />
          </li>
        ))}
      </ul>
      {images.length > 1 && (
        <div className={s.dots}>
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              className={s.dot}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === index}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
