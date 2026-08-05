import { View } from 'react-native';

// Runtime stand-in for the codegen native component specs
// (`src/specs/*NativeComponent.ts`). The spec files ship as raw TypeScript —
// React Native's codegen parses them from source — so the untransformed
// `lib/commonjs` build cannot require them under jest.
export default View;
