import { type MutableRefObject, type Ref,useCallback } from 'react';

/** Merges several refs (forwarded or local) into a single ref callback. */
export function useComposedRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return useCallback(
    (node: T | null) => {
      for (const ref of refs) {
        if (typeof ref === 'function') ref(node);
        else if (ref && 'current' in ref) (ref as MutableRefObject<T | null>).current = node;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs
  );
}
