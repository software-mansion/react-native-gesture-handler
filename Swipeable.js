/*

This is terrible hack to ensure that every user of RNGH can import Swipeable and DrawerLayout
via scoped import like "import Swipeable from 'react-native-gesture-handler/Swipeable';".

Even if you set main file to be in dist directory, this doesn't mean that scoped file resolution
will be performed in that director, actually node will search in <root>/Swipeable (which doesn't exist with .js extension)

This can be mitigated via "exports" key in package.json but it's supported since Node 14 which is quite new.

Please remove this file when we stop supporting node versions lower than 14.

*/
import Swipeable from './dist/Swipeable';
export default Swipeable;
