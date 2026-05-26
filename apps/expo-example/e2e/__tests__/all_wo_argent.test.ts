import { flingTests } from '../suites/gestures/fling';
import { longPressTests } from '../suites/gestures/long_press';
import { panTests } from '../suites/gestures/pan';
import { tapTests } from '../suites/gestures/tap';
import { competingTests } from '../suites/relations/competing';

tapTests();
flingTests();
longPressTests();
panTests();
competingTests();
