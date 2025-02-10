---
id: introduction
title: Introduction
sidebar_label: Introduction
sidebar_position: 1
slug: /
---

Gesture Handler provides a declarative API exposing the native platform's touch and gesture system to React Native. It's designed to be a replacement of React Native's built in touch system called [Gesture Responder System](http://reactnative.dev/docs/gesture-responder-system). Using native touch handling allows to address the performance limitations of React Native's Gesture Responder System. It also provides more control over the platform's native components that can handle gestures on their own. If you want to learn more, we recommend [this talk](https://www.youtube.com/watch?v=V8maYc4R2G0) by [Krzysztof Magiera](https://twitter.com/kzzzf) in which he explains issues with the responder system.

The main benefits of using React Native Gesture Handler are:

- A way to use a platform's native touch handling system for recognizing gestures (like pinch, rotation, pan and a few others).
- The ability to define relations between gestures to ensure gestures, and possibly native components, will not conflict with each other.
- Mechanisms to use touchable components that run in native thread and follow platform default behavior; e.g. in the event they are in a scrollable component, turning into pressed state is slightly delayed to prevent it from highlighting when you fling.
- Close integration with [`react-native-reanimated`](https://docs.swmansion.com/react-native-reanimated/) to process touch events on the UI thread.
- Support for different input devices like touch screens, pens and mice.
- Ability to include any native component into the Gesture Handler's touch system, making it work alongside your gestures.

:::info
We recommended to use Reanimated to implement gesture-driven animations with Gesture Handler. Its more advanced features rely heavily on worklets and the UI runtime provided by Reanimated.
:::

## Learning resources

### Apps

[Gesture Handler Example App](https://github.com/software-mansion/react-native-gesture-handler/blob/main/example) – official gesture handler "showcase" app.

### Talks and workshops

[Declarative future of gestures and animations in React Native](https://www.youtube.com/watch?v=kdq4z2708VM) by [Krzysztof Magiera](https://twitter.com/kzzzf) - talk that explains motivation behind creating gesture handler library. It also presents [react-native-reanimated](https://github.com/software-mansion/react-native-reanimated) and how and when it can be used with gesture handler.

[React Native workshop with Expo team @ReactEurope 2018](https://youtu.be/JSIoE_ReeDk?t=41m49s) by [Brent Vatne](https://twitter.com/notbrent) – great workshop explaining gesture handler in details and presenting a few exercises that will help get you started.

[Living in an async world of React Native](https://www.youtube.com/watch?v=-Izgons3mec) by [Krzysztof Magiera](https://twitter.com/kzzzf) – talk which highlights some issue with the React Native's touch system Gesture Handler aims to address. Also the motivation for building this library is explained.

[React Native Touch & Gesture](https://www.youtube.com/watch?v=V8maYc4R2G0) by [Krzysztof Magiera](https://twitter.com/kzzzf) - talk explaining JS responder system limitations and points out some of the core features of Gesture Handler.

## Contributing

If you are interested in the project and want to contribute or support it in other ways don't hesitate to contact anyone from the team on Twitter or Bluesky (links below)!

All PRs are welcome, but talk to us before you start working on something big.

The easiest way to get started with contributing code is by:

- Reviewing the list of [open issues](https://github.com/software-mansion/react-native-gesture-handler/issues) and trying to solve the one that seem approachable to you.
- Updating the [documentation](https://github.com/software-mansion/react-native-gesture-handler/blob/main/docs) whenever you see some information is unclear, missing or out of date.

Code is only one way how you can contribute. You may want to consider [replying on issues](https://github.com/software-mansion/react-native-gesture-handler/issues) if you know how to help.

## Community

We are very proud of the community that has been build around this package. We really appreciate all your help regardless of it is a pull request, issue report, helping others by commenting on existing issues or posting some demo or video tutorial on social media.
If you've build something with this library you'd like to share, please contact us as we'd love to help share it with others.

### Gesture Handler Team 🚀

<div className="community-holder-container">

  <div className="community-holder-container-item">
    <div className="community-imageHolder">
      <img src="https://ca.slack-edge.com/T03Q9AMJJ-U02700KC6J1-0c9e18c89e71-512" />
    </div>
    <div>Jakub Piasecki</div>
    <div><a href="https://twitter.com/breskin67">@breskin67</a></div>
    <div><a href="https://bsky.app/profile/jpiasecki.com">@jpiasecki.com</a></div>
  </div>

  <div className="community-holder-container-item">
    <div className="community-imageHolder">
      <img src="https://ca.slack-edge.com/T03Q9AMJJ-U03N3HU2C0M-60a31c54a7d5-512" />
    </div>
    <div>Michał Bert</div>
    <div><a href="https://x.com/Michal3870">@Michal3870</a></div>
  </div>

  <div className="community-holder-container-item">
    <div className="community-imageHolder">
      <img src="https://ca.slack-edge.com/T03Q9AMJJ-U06MQFHEY3V-6535cb89fc75-192" />
    </div>
    <div>Ignacy Łątka</div>
    <div><a href="https://x.com/latekvo">@latekvo</a></div>
  </div>

  <div className="community-holder-container-item">
    <div className="community-imageHolder">
      <img src="https://ca.slack-edge.com/T03Q9AMJJ-U0F40CATS-d0a2e7559a1b-512" />
    </div>
    <div>Krzysztof Magiera</div>
    <div><a href="https://twitter.com/kzzzf">@kzzzf</a></div>
    <div><a href="https://bsky.app/profile/kzzzf.bsky.social">@kzzzf.bsky.social</a></div>
  </div>

</div>

### Sponsors

We really appreciate our sponsors! Thanks to them we can develop our library and make the react-native world a better place. Special thanks for:

<div className="community-holder-container">

  <div className="community-holder-container-item">
    <a href="https://www.shopify.com/">
      <div className="community-imageHolder">
        <img src="https://avatars1.githubusercontent.com/u/8085?v=3&s=100" />
      </div>
      <div>Shopify</div>
    </a>
  </div>

  <div className="community-holder-container-item">
    <a href="https://expo.dev">
      <div className="community-imageHolder">
        <img className="community-imageHolder" src="https://avatars2.githubusercontent.com/u/12504344?v=3&s=100" />
      </div>
      <div>Expo</div>
    </a>
  </div>

</div>
