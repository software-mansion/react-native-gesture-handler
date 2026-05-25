import { flingTests } from '../suites/fling';
import { longPressTests } from '../suites/long_press';
import { panTests } from '../suites/pan';
import { pinchTests } from '../suites/pinch';
import { rotationTests } from '../suites/rotation';
import { tapTests } from '../suites/tap';

tapTests();
pinchTests();
flingTests();
longPressTests();
rotationTests();
panTests();
