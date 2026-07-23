Only one of the provided gestures can become active at the same time. The first gesture to become active will cancel the rest of the gestures. It accepts a variable number of arguments.

For example, let's say that you have a component that you want to make draggable but you also want to show additional options on long press. Presumably you would not want the component to move after the long press activates. You can accomplish this using `useCompetingGestures`:
