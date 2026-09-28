"use client";

import type { Route } from "next";
import Image from "next/image";
import { useRef, useState, useSyncExternalStore } from "react";
import clsx from "clsx";
import { ButtonLink, Icon, IconButton } from "@/components/ui";
import s from "./HeroCarousel.module.scss";

export type HeroSlide = {
  id: string;
  image: { url: string; alt: string; position?: string };
  eyebrow: string;
  title: string;
  text: string;
  cta: { label: string; href: Route };
  /** Entrance animation for the image, text and ornaments. Give each slide a different one. */
  effect: "zoom" | "curtain" | "iris" | "rise";
};

const SWIPE_PX = 50;

const REDUCED = "(prefers-reduced-motion: reduce)";
const reducedMotion = {
  subscribe(cb: () => void) {
    const mq = window.matchMedia(REDUCED);
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
  },
  get: () => window.matchMedia(REDUCED).matches,
  getServer: () => false,
};

/**
 * Auto-rotating Home hero. The timer IS the active dot's CSS progress animation: `animationend` advances the
 * slide, and pausing (hover, focus, pause button) just pauses that animation, so the visual progress and the
 * real timing can never drift apart. With reduced motion there is no animation, hence no autoplay.
 */
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [held, setHeld] = useState(false); // hovered or focused: reading, don't move
  const reduced = useSyncExternalStore(reducedMotion.subscribe, reducedMotion.get, reducedMotion.getServer);
  const pointerX = useRef<number | null>(null);

  const count = slides.length;
  const autoplay = count > 1 && !reduced && !userPaused;
  const running = autoplay && !held;

  const go = (i: number) => setIndex(((i % count) + count) % count);

  return (
    <section
      className={s.carousel}
      aria-roledescription="carousel"
      aria-label="Featured collections"
      data-running={running || undefined}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      // Keyboard focus only: a mouse click on Play/dots must not immediately re-pause the slideshow.
      onFocus={(e) => {
        if (e.target.matches(":focus-visible")) setHeld(true);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setHeld(false);
      }}
      onPointerDown={(e) => {
        pointerX.current = e.clientX;
      }}
      onPointerUp={(e) => {
        if (pointerX.current == null) return;
        const dx = e.clientX - pointerX.current;
        pointerX.current = null;
        if (Math.abs(dx) > SWIPE_PX) go(index + (dx < 0 ? 1 : -1));
      }}
    >
      {/* Announce slide changes only when the user drives them, not every few seconds. */}
      <div className={s.viewport} aria-live={autoplay ? "off" : "polite"}>
        {slides.map((slide, i) => {
          const active = i === index;
          const Title = i === 0 ? "h1" : "h2";
          return (
            <div
              key={slide.id}
              className={clsx(s.slide, s[slide.effect])}
              data-active={active || undefined}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              inert={!active}
            >
              <div className={s.media}>
                <Image
                  src={slide.image.url}
                  alt={slide.image.alt}
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  className={s.image}
                  style={slide.image.position ? { objectPosition: slide.image.position } : undefined}
                />
              </div>
              <div className={s.content}>
                <p className={s.eyebrow}>{slide.eyebrow}</p>
                <Title className={s.title}>{slide.title}</Title>
                <p className={s.text}>{slide.text}</p>
                <ButtonLink
                  href={slide.cta.href}
                  size="lg"
                  iconEnd={<Icon name="arrowRight" size={20} />}
                  className={s.cta}
                >
                  {slide.cta.label}
                </ButtonLink>
              </div>
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <div className={s.controls}>
          <div className={s.dots}>
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                className={s.dot}
                aria-label={`Show slide ${i + 1}: ${slide.title}`}
                aria-current={i === index || undefined}
                onClick={() => go(i)}
              >
                {i === index && (
                  // key restarts the fill for every slide; its end is what advances the carousel.
                  <span key={index} className={s.progress} onAnimationEnd={() => go(index + 1)} />
                )}
              </button>
            ))}
          </div>
          {!reduced && (
            <IconButton
              icon={userPaused ? "play" : "pause"}
              label={userPaused ? "Play slideshow" : "Pause slideshow"}
              onClick={() => setUserPaused((p) => !p)}
              className={s.toggle}
            />
          )}
        </div>
      )}
    </section>
  );
}
