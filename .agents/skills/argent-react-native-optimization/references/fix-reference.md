# Fix Reference

Match profiler findings and semantic sweep results to concrete fixes.

| Finding                                      | Fix                                                                           | Detail                                                                                             |
| -------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Re-renders with same props                   | `React.memo(Comp)`                                                            | **Skip if React Compiler active** — `react-profiler-analyze` reports compiler status per component |
| Expensive recomputation / unstable callbacks | `useMemo(fn, [deps])` / `useCallback(fn, [deps])`                             | `useCallback` must pair with `React.memo` on child — alone it has no effect                        |
| Inline objects/arrays in JSX                 | `StyleSheet.create()` / module-level const                                    | New reference every render breaks shallow equality                                                 |
| List jank                                    | `removeClippedSubviews`, `maxToRenderPerBatch`, `windowSize`, `getItemLayout` | Or migrate to `@shopify/flash-list` with `estimatedItemSize`                                       |
| JS-thread animation jank                     | `useNativeDriver: true` or `react-native-reanimated`                          | `useNativeDriver` only works for `transform` and `opacity` properties                              |
| Heavy work during transitions                | `InteractionManager.runAfterInteractions()`                                   | Defers execution until active animations complete                                                  |
| Slow startup                                 | Hermes + inline requires in `metro.config.js`                                 | Lazy `require()` defers loading heavy modules until first use                                      |
| Redundant, heavy, or n+1 network calls       | `view-network-logs` → `view-network-request-details`                          | Batch, debounce, or cache at the data layer                                                        |
