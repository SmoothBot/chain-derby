// packages/app/src/lib/oklch-to-rgb.ts
import { converter, formatRgb, oklch } from 'culori';

/**
 * Walks the element tree and converts any inline style or attribute value that
 * starts with `oklch(` into an equivalent `rgb()` string so that html-to-image
 * / html2canvas won't crash.
 */
export function normaliseOklch(node: HTMLElement): void {
  const toRgb = converter('rgb');

  const walk = (el: HTMLElement) => {
    Array.from(el.style).forEach((prop) => {
      const value = el.style.getPropertyValue(prop).trim();
      if (value.startsWith('oklch(')) {
        const rgb = toRgb(oklch(value as unknown as string));
        el.style.setProperty(prop, formatRgb(rgb));
      }
    });

    // attributes such as <svg fill="oklch(...)"> …
    ['fill', 'stroke', 'color'].forEach((attr) => {
      const val = el.getAttribute(attr);
      if (val?.startsWith('oklch(')) {
        const rgb = toRgb(oklch(val));
        el.setAttribute(attr, formatRgb(rgb));
      }
    });

    Array.from(el.children).forEach((c) => walk(c as HTMLElement));
  };

  walk(node);
}