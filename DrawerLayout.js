/*

This is a terrible hack to ensure that every user of RNGH can import Swipeable and DrawerLayout
via scoped import like "import Swipeable from 'react-native-gesture-handler/Swipeable';".

Even if you set main file to be in the dist/ directory it doesn't mean that scoped file resolution
will be performed in that director. Actually node will search in <root>/Swipeable (which doesn't exist with .js extension)

This behavior can be mitigated via "exports" key in package.json but it's supported since Node 14 which is quite new.

Please remove this file when we stop supporting node versions lower than 14.

*/
import DrawerLayout from './dist/DrawerLayout';
export default DrawerLayout;
