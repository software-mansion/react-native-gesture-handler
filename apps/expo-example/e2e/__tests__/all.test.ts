import { flingTests } from '../suites/gestures/fling';
import { longPressTests } from '../suites/gestures/long_press';
import { panTests } from '../suites/gestures/pan';
import { pinchTests } from '../suites/gestures/pinch';
import { rotationTests } from '../suites/gestures/rotation';
import { tapTests } from '../suites/gestures/tap';
import { competingTests } from '../suites/relations/competing';
import { exclusiveTests } from '../suites/relations/exclusive';
import { simultaneousTests } from '../suites/relations/simultaneous';

tapTests();
pinchTests();
flingTests();
longPressTests();
rotationTests();
panTests();
competingTests();
exclusiveTests();
simultaneousTests();
