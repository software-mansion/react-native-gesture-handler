/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');
const MarkdownBlock = CompLibrary.MarkdownBlock; /* Used to read markdown */
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

const siteConfig = require(process.cwd() + '/siteConfig.js');

function imgUrl(img) {
  return siteConfig.baseUrl + 'img/' + img;
}

function docUrl(doc, language) {
  return siteConfig.baseUrl + 'docs/' + (language ? language + '/' : '') + doc;
}

function pageUrl(page, language) {
  return siteConfig.baseUrl + (language ? language + '/' : '') + page;
}

class Button extends React.Component {
  render() {
    return (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={this.props.href} target={this.props.target}>
          {this.props.children}
        </a>
      </div>
    );
  }
}

Button.defaultProps = {
  target: '_self',
};

const SplashContainer = props => (
  <div className="homeContainer">
    <div className="homeSplashFade">
      <div className="wrapper homeWrapper">{props.children}</div>
    </div>
  </div>
);

const Logo = props => (
  <div className="projectLogo">
    <img src={props.img_src} />
  </div>
);

const ProjectTitle = props => (
  <h2 className="projectTitle">
    {siteConfig.title}
    <small>{siteConfig.tagline}</small>
  </h2>
);

const PromoSection = props => (
  <div className="section promoSection">
    <div className="promoRow">
      <div className="pluginRowBlock">{props.children}</div>
    </div>
  </div>
);

class HomeSplash extends React.Component {
  render() {
    let language = this.props.language || '';
    return (
      <SplashContainer>
        <div className="inner">
          <ProjectTitle />
          <PromoSection>
            <Button href={docUrl('getting-started.html', language)}>
              Read the docs
            </Button>
            <Button href="https://expo.io/@sauzy3450/react-native-gesture-handler-demo">
              Try demo app on Expo
            </Button>
          </PromoSection>
          <a
            className="github-button"
            href={siteConfig.repoUrl}
            data-icon="octicon-star"
            data-count-href="/software-mansion/react-native-gesture-handler"
            data-show-count={true}
            data-count-aria-label="# stargazers on GitHub"
            aria-label="Star this project on GitHub">
            Star
          </a>
        </div>
      </SplashContainer>
    );
  }
}

const Block = props => (
  <Container
    padding={['bottom', 'top']}
    id={props.id}
    background={props.background}>
    <GridBlock contents={props.children} layout={props.layout} />
  </Container>
);

const Features = props => (
  <Block layout="fourColumn">
    {[
      {
        content:
          'With Gesture Handler touch stream handling happens on the UI thread and uses APIs native to each platform.',
        title: 'Use platform native gesture recognizers',
      },
      {
        content:
          "Pass and process gesture specific data to React Native's [Animated library](http://facebook.github.io/react-native/docs/animated.html) and build smooth gesture based experiences with `useNativeDriver` flag.",
        title: 'Works with Animated API',
      },
      {
        content:
          'Gesture Handler library ships with a set of components that aims to provide the best possible interactions such as SwipeableRow or Drawer. More components to come!',
        title: 'Use cross platform components built with Gesture Handler',
      },
      {
        content:
          'Gesture Handler is available for you to use with [Expo](https://expo.io) and to play with on [Snack](https://snack.expo.io/).',
        title: 'Available in Expo.io',
      },
    ]}
  </Block>
);

const TryOut = props => (
  <Block id="try">
    {[
      {
        content: `Check out the [documentation](docs/getting-started.html) and learn how to quickly get up and running with Gesture Handler. Take a look at our API guides to get familiarize with the API. \n\n Try our showcase app or [get it here using Expo](https://expo.io/@sauzy3450/react-native-gesture-handler-demo). Or just [go to this page](docs/example.html) to see how you can run it locally with React Native on both Android and iOS.`,
        image: imgUrl('sampleswipeable.gif'),
        imageAlign: 'left',
        title: 'Try it Out',
      },
    ]}
  </Block>
);

const Description = props => (
  <Block background="light" id="description">
    {[
      {
        content: `React Native Gesture Handler provides native-driven gesture management APIs for building best possible touch-based experiences in React Native. With this library gestures are no longer controlled by the JS responder system, but instead are recognized and tracked in the UI thread. It makes touch interactions and gesture tracking not only smooth, but also dependable and deterministic.. [Continue here to the getting started guide](docs/getting-started.html) to learn more about the library`,
        image: imgUrl('ghlogo.svg'),
        imageAlign: 'right',
        title: 'About this project',
      },
    ]}
  </Block>
);

class Index extends React.Component {
  render() {
    let language = this.props.language || '';

    return (
      <div>
        <HomeSplash language={language} />
        <div className="mainContainer">
          <Features />
          <Description />
          <TryOut />
        </div>
      </div>
    );
  }
}

module.exports = Index;
