---
id: quickstart
title: Quick start
sidebar_label: Quick start
sidebar_position: 1
---

import Step, { Divider } from '@site/src/theme/Step';
import Step1 from './\_steps/step1.md';
import Step2 from './\_steps/step2.md';
import Step3 from './\_steps/step3.md';
import Step4 from './\_steps/step4.md';
import Step5 from './\_steps/step5.md';

RNGH2 provides much simpler way to add gestures to your app. All you need to do is wrap the view that you want your gesture to work on with [`GestureDetector`](/docs/fundamentals/gesture-detectors#gesture-detector), define the gesture and pass it to detector. That's all!

To demonstrate how you would use the new API, let's make a simple app where you can drag a ball around. You will need to add `react-native-gesture-handler` (for gestures) and `react-native-reanimated` (for animations) modules.

<Step title="Step 1">
  <div>First let's define styles we will need to make the app:</div>
  <Step1 />
</Step>

<Step title="Step 2">
  <div>Then we can start writing our <code>Ball</code> component:</div>
  <Step2 />
</Step>

<Step title="Step 3">
  <div>
    We also need to define{' '}
    <a href="https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/glossary#shared-value">
      shared values
    </a>{' '}
    to keep track of the ball position and create animated styles in order to be
    able to position the ball on the screen:
  </div>
  <Step3 />
</Step>

<Step title="Step 4">
  <div>And add it to the ball's styles:</div>
  <Step4 />
</Step>

<Step title="Step 5">
  <div>
    The only thing left is to define the pan gesture and assign it to the
    detector:
  </div>
  <Step5 />
</Step>

Note the `start` shared value. We need it to store the position of the ball at the moment we grab it to be able to correctly position it later, because we only have access to translation relative to the starting point of the gesture.

Now you can just add `Ball` component to some view in the app and see the results! (Or you can just check the code [here](https://github.com/software-mansion/react-native-gesture-handler/blob/main/example/src/new_api/velocityTest/index.tsx) and see it in action in the Example app.)
