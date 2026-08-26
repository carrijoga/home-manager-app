# src/lib/CLAUDE.md

Shared utility functions and configuration modules. Organized by concern.

## Files

| File                         | Purpose                                                                                             |
| ---------------------------- | --------------------------------------------------------------------------------------------------- |
| `animations.ts`              | Framer Motion variants for consistent motion across the app. Import and use in animated components. |
| `avatarUtils.ts`             | Avatar name → initial color mapping and utilities. Used by `ProfileMenu`, user cards.               |
| `nestIcons.tsx`              | Maps nest IDs to icon identifiers and renders React components. Used by sidebar, nest selector.    |
| `notificationPreferences.ts` | Reads/writes notification preferences from localStorage.                                            |
| `weatherPreferences.ts`      | Reads/writes weather display preferences from localStorage.                                         |
| `utils.ts`                   | Generic Tailwind/UI utilities (e.g., `cn()` for classname merging).                                 |

## animations.ts

Framer Motion variants for reusable animations:

```ts
import { fadeIn, slideUp, staggerChildren } from '@/lib/animations';

// Use in motion.div, motion.ul, etc.
const variants = { initial: fadeIn.initial, animate: fadeIn.animate };
```

**Key variants:**

- `fadeIn` — opacity entrance
- `slideUp` — slide up + fade
- `slideDown` — slide down + fade
- `scaleIn` — scale + fade
- `staggerChildren` — container for staggered child animations

Add new variants here instead of inline objects in components.

## avatarUtils & nestIcons

These map identifiers to visual properties:

```ts
import { getAvatarColor } from '@/lib/avatarUtils';
import { getNestIcon } from '@/lib/nestIcons';

const color = getAvatarColor('John Doe'); // Returns consistent color based on name
const icon = getNestIcon(nestId); // Returns icon component
```

## Preference utilities (notificationPreferences, weatherPreferences)

Manage user preferences stored in localStorage:

```ts
import {
  getNotificationPreferences,
  setNotificationPreferences,
} from '@/lib/notificationPreferences';

const prefs = getNotificationPreferences();
setNotificationPreferences({ sound: true, vibration: false });
```

Used by Settings modal panels and preference UI.

## Adding a New Utility

1. If it's a **Framer Motion variant** → add to `animations.ts`
2. If it's a **localStorage preference** → create new file or extend existing preference module
3. If it's a **mapping utility** → add to the relevant `*Utils.ts` or `*Icons.tsx` file
4. If it's a **generic helper** → consider if it belongs in `utils.ts` or a new focused module
