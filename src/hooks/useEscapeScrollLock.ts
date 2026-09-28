import { useCallback, useRef } from 'react';

/**
 * Radix's Dialog/Sheet lock body scroll via `react-remove-scroll`, which
 * attaches a `wheel`/`touchmove` listener on `document` and calls
 * `preventDefault()` on anything it doesn't recognize as scrolling inside
 * the modal. A `Popover`/`DropdownMenu`/`Select` content is portaled
 * straight to `document.body` — outside the Dialog's DOM subtree — so when
 * one of those is opened from inside a modal, the mouse wheel stops working
 * over it: the lock treats it as "scroll outside the modal" and swallows it.
 *
 * The fix is to stop the wheel/touch event from reaching that document-level
 * listener, by stopping propagation on the popover element itself before it
 * bubbles up. This must happen via a **callback ref**, not `useRef` +
 * `useEffect` — an effect runs after Radix has already mounted the content
 * node, so the scroll-lock's own listener (added on mount) would already be
 * registered and would still win the race.
 *
 * See https://github.com/radix-ui/primitives/issues/2028 and
 * https://github.com/radix-ui/primitives/issues/2125.
 */
export function useEscapeScrollLock<T extends HTMLElement>() {
  const cleanupRef = useRef<(() => void) | null>(null);

  return useCallback((node: T | null) => {
    cleanupRef.current?.();
    cleanupRef.current = null;

    if (!node) return;

    const stop = (e: Event) => e.stopPropagation();
    node.addEventListener('wheel', stop, { capture: true });
    node.addEventListener('touchmove', stop, { capture: true });

    cleanupRef.current = () => {
      node.removeEventListener('wheel', stop, { capture: true });
      node.removeEventListener('touchmove', stop, { capture: true });
    };
  }, []);
}
