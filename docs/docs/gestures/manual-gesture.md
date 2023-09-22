---
id: manual-gesture
title: Manual gesture
sidebar_label: Manual gesture
sidebar_position: 12
---

import BaseEventData from './\_shared/base-gesture-event-data.md';
import BaseEventConfig from './\_shared/base-gesture-config.md';
import BaseEventCallbacks from './\_shared/base-gesture-callbacks.md';
import BaseContinousEventCallbacks from './\_shared/base-continous-gesture-callbacks.md';

A plain gesture that has no specific activation criteria nor event data set. Its state has to be controlled manually using a [state manager](./state-manager.md). It will not fail when all the pointers are lifted from the screen.

## Config

<BaseEventConfig />

## Callbacks

<BaseEventCallbacks />
<BaseContinousEventCallbacks />

## Event data

<BaseEventData />
