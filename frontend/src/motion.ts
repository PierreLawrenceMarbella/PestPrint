import type { CSSProperties } from "react";

/** Zero-based position for a direct child of .motion-stagger. CSS caps the delay. */
export function staggerStyle(index: number): CSSProperties {
  return {
    "--motion-index": Number.isFinite(index) ? Math.max(0, Math.floor(index)) : 0,
  } as CSSProperties;
}
