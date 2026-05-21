# src/hooks/CLAUDE.md

Custom React hooks shared across the application. Always use hooks from here instead of duplicating logic.

## Available Hooks

| Hook                        | Purpose                                                                                                                          |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `usePrefersReducedMotion()` | Detects if user prefers reduced motion (accessibility). Returns boolean. Pass to animated components as `disableAnimation` prop. |
| `useToastNotifications()`   | Toast notification system. Returns `{ show, hide, showSuccess, showError }`. Use for user feedback on async operations.          |
| `useDebounce()`             | Debounce hook for search/filter inputs. Returns debounced value after delay (default 300ms).                                     |
| `use-mobile()`              | Mobile device detection. Returns boolean `isMobile`. Use for responsive behavior decisions.                                      |

## Usage Patterns

### useToastNotifications

```ts
const { showSuccess, showError } = useToastNotifications();

// On success
showSuccess('Item saved!');

// On error
showError('Failed to save', 'Please try again');
```

### useDebounce

```ts
const [searchTerm, setSearchTerm] = useState('');
const debouncedTerm = useDebounce(searchTerm);

// debouncedTerm updates 300ms after user stops typing
useEffect(() => {
  if (debouncedTerm) {
    fetchResults(debouncedTerm);
  }
}, [debouncedTerm]);
```

### usePrefersReducedMotion

```ts
const prefersReducedMotion = usePrefersReducedMotion()

// Pass to animated components
<AnimatedCard disableAnimation={prefersReducedMotion}>...</AnimatedCard>
```

## Adding a New Hook

1. Create file: `src/hooks/useFeature.ts`
2. Export hook function
3. Document in this CLAUDE.md
4. Do not export from a barrel — import directly: `import { useFeature } from '@/hooks/useFeature'`
