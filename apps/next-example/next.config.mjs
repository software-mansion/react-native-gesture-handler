/** @type {import('next').NextConfig} */
const nextConfig = {
  // The workspace packages ship TypeScript sources; Next compiles them into
  // the consumer program (same setup a source-consuming user would need).
  transpilePackages: [
    'react-gesture-handler',
    '@swmansion/gesture-handler-core',
    '@swmansion/gesture-handler-dom-engine',
  ],
};

export default nextConfig;
