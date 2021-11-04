---
id: custom-gesture
title: Custom gesture
sidebar_label: Custom gesture
---

import BaseEventData from './base-gesture-event-data.md';
import BaseEventConfig from './base-gesture-config.md';
import BaseEventCallbacks from './base-gesture-callbacks.md';
import BaseContinousEventCallbacks from './base-continous-gesture-callbacks.md';
import PointerEventData from './pointer-event-data.md';

A plain gesture that has no specific activation criteria nor event data set. Its state has to be controlled manually using a [state manager](./state-manager.md). It will not fail when all the pointers are lifted from the screen.

## Config

<BaseEventConfig />

## Callbacks

<BaseEventCallbacks />
<BaseContinousEventCallbacks />

## Event data

<BaseEventData />

<PointerEventData />
