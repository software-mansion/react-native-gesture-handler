import { Gestures } from './gestures';

// Server component: prerendered HTML hosts the client gesture surface below —
// the SSR half of the zero-config consumption story.
export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>react-gesture-handler Next example</h1>
      <Gestures />
    </main>
  );
}
