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
        <Logo img_src={imgUrl('docusaurus.svg')} />
        <div className="inner">
          <ProjectTitle />
          <PromoSection>
            <Button href={docUrl('getting-started.html', language)}>
              Read the docs
            </Button>
            <Button href="https://exp.host/@osdnk/gesturehandlerexample">
              Try demo app on Expo
            </Button>
          </PromoSection>
          <a
            className="github-button"
            href={siteConfig.repoUrl}
            data-icon="octicon-star"
            data-count-href="/kmagiera/react-native-gesture-handler"
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
    <GridBlock align="center" contents={props.children} layout={props.layout} />
  </Container>
);

const Features = props => (
  <Block layout="fourColumn">
    {[
      {
        content:
          'Gesture Handler relies on component native to each platform for gesture recognition.',
        title: 'Use platform native gesture recognizers',
      },
      {
        content:
          "Use events with gesture data with React Native's [Animated library](http://facebook.github.io/react-native/docs/animated.html) and build smooth gesture based expiriences with `useNativeDriver` flag.",
        title: 'Works with Animated API',
      },
      {
        content:
          'Gesture Handler library ships with a set of components that aims to provide best possible interations such as SwipeableRow or Drawer. More components to come!',
        title: 'Use cross platform components build with Gesture Handler',
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
        content:
          'Get acquainted with [documentation](docs/getting-started.html) to take a deep look how the' +
          'library API works and how to use it effectively to make your app better. \n You could see ' +
          '[our expo demo](https://exp.host/@osdnk/gesturehandlerexample) and get inspired how powerfully ' +
          'handle gestures and their interactions. \n' +
          'If you wish to use library in your project, read carefully the [installation guide](docs/getting-started.html#installation) and follow exactly the instructions',
        image: imgUrl('docusaurus.svg'),
        imageAlign: 'left',
        title: 'Try it Out',
      },
    ]}
  </Block>
);

const Description = props => (
  <Block background="dark">
    {[
      {
        content:
          'React Native Gesture Handler allows native-based gesture management for lightning and reliable ' +
          'interactions in React Native. Using the library, gestures are no longer control in memory and ' +
          'CPU-expensive JavaScript thread, but the most costable operations (like tracking of finger movement) are ' +
          'executed in a fast native threads. Gesture tracking is not only smooth, which increase user experience of ' +
          'your apps, but also dependable and deterministic.',
        image: imgUrl('docusaurus.svg'),
        imageAlign: 'right',
        title: 'Description',
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
