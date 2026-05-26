import { flingTests } from '../suites/gestures/fling';
import { longPressTests } from '../suites/gestures/long_press';
import { panTests } from '../suites/gestures/pan';
import { tapTests } from '../suites/gestures/tap';
import { competingTests } from '../suites/relations/competing';
import { exclusiveTests } from '../suites/relations/exclusive';
import { simultaneousTests } from '../suites/relations/simultaneous';

tapTests();
flingTests();
longPressTests();
panTests();
competingTests();
exclusiveTests();
simultaneousTests();
