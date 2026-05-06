# Phase 2: Semantic Sweep

Work through each area. Do not skip.
See [fix-reference.md](fix-reference.md) for concrete fix patterns per finding.

## Checklist

### Memoization

Check every exported function component: is it rendered in a list, a frequently-updating parent, or a context consumer? If yes and props are stable, wrap in `React.memo`. Check context providers for unstable `value` props. Skip `React.memo` if React Compiler is active.

### List rendering

Check all list-like rendering: ScrollView+map, manually iterated arrays, deeply nested FlatLists. Verify lists use virtualization (`FlatList`/`FlashList`), stable keys, and proper item sizing.

### Animations

Check all animation code against current library best practices. Prefer Reanimated over the Animated API. Check for JS-thread animation bottlenecks (`requestAnimationFrame` loops, state-driven animations).

### Async patterns

Check for sequential `await` calls that could be `Promise.all`. Check for missing `AbortController` / cancellation on unmount. Check for fetch waterfalls (parent fetches → child fetches → grandchild fetches).

### Effect cleanup

Check all `useEffect` hooks that create timers, listeners, or subscriptions. Verify each returns a cleanup function. Check for effects missing dependency arrays (runs every render).

### State hygiene

Check for unused state (set but never rendered), unbounded state growth (arrays/objects that grow without cap), and derived state that should be computed with `useMemo` instead.

### Monolithic context

Flag but do NOT auto-fix. Report as architectural recommendation.
