import React from 'react';
import classnames from 'classnames';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

const heroImageUrl = 'img/pinch-reworked.svg';
const sectionImageUrl = 'img/swm-react-native-reanimated-illu-kon-06.svg';
const screenshotUrl = 'gifs/sampleswipeable.gif';

const boxes = [
  {
    title: <>Use platform native gesture recognizers👍</>,
    description: (
      <>
        With Gesture Handler touch stream handling happens on the UI thread and uses APIs native to each platform.
      </>
    ),
  },
  {
    title: <>Works with Animated API</>,
    description: (
      <>
        Pass and process gesture specific data to React Native's Animated library and build smooth gesture based experiences with useNativeDriver flag.
      </>
    ),
  },
  {
    title: <>Use cross platform components built with Gesture Handler</>,
    description: (
      <>
        Gesture Handler library ships with a set of components that aims to provide best possible interations such as SwipeableRow or Drawer. More components to come!
      </>
    ),
  },
  {
    title: <>Available in Expo.io</>,
    description: (
      <>
        Gesture Handler is available for you to use with <a href="https://expo.io/">Expo</a> and to play with on <a href="https://snack.expo.io/">Snack</a>.
      </>
    ),
  },
];

const bannerTitle =
  'React Native Gesture Handler provides native-driven gesture management APIs for building best possible touch-based experiences in React Native.';
const bannerDescription =
  'eact Native Reanimated provides a more comprehensive, low level abstraction for the Animated library API to be built on top of and hence allow for much greater flexibility especially when it comes to gesture based interactions.';
const blogUrl =
  'https://blog.swmansion.com/introducing-reanimated-2-752b913af8b3';
const exampleUrl =
  'https://github.com/software-mansion/react-native-reanimated/tree/master/Example';
const playgroundUrl =
  'https://github.com/software-mansion-labs/reanimated-2-playground';
const tryItOutDecription =
  'Check out the documentation and learn how to quickly get up and running with Gesture Handler. Take a look at our API guides to get familiarize with it.';

function InfoBox({ title, description }) {
  return (
    <div className="col col--6 info-box">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Hero() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;

  return (
    <header className={classnames('hero hero--secondary', styles.heroBanner)}>
      <div className="container">
        <div className="row row-hero">
          <div className="col col--5 hero-content">
            <h1 className="hero__title">{siteConfig.title}</h1>
            <p className="hero__p">{siteConfig.tagline}</p>
            <div className={classnames('hero-buttons', styles.buttons)}>
              <Link
                className={classnames(
                  'button button--primary button--lg',
                  styles.getStarted
                )}
                to={useBaseUrl('docs/')}>
                View Docs
              </Link>
              <Link
                className={classnames(
                  'button button--primary button--lg',
                  styles.getStarted
                )}
                to="https://expo.io/@sauzy3450/react-native-gesture-handler-demo">
                Try demo app on Expo
              </Link>
            </div>
          </div>
          <div
            className="col col--7 hero-image"
            style={{
              backgroundImage: `url(${heroImageUrl})`,
            }}
          />
        </div>
      </div>
    </header>
  );
}
function SectionImage() {
  return (
    <div
      className="col col--4 section-image"
      style={{
        backgroundImage: `url(${sectionImageUrl})`,
        backgroundSize: 'contain',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
      }}
    />
  );
}

function SectionBoxes() {
  return (
    <div className="col col--12 section-boxes">
      {boxes &&
        boxes.length > 0 && (
          <div className="row box-container">
            {boxes.map((props, idx) => <InfoBox key={idx} {...props} />)}
          </div>
        )}
    </div>
  );
}

function BannerSection() {
  return (
    <section>
      <div className="container">
        <div className="row">
          <div
            className="col col--4 section-image"
            style={{
              backgroundImage: `url(${sectionImageUrl})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
            }}
          />
          <div className="col col--8">
            <h1>{bannerTitle}</h1>
            <p className="hero__p">{bannerDescription}</p>
            <div className={classnames('hero-buttons', styles.buttons)}>
              <Link
                className={classnames(
                  'button button--primary button--lg',
                  styles.getStarted
                )}
                to={useBaseUrl('docs/installation')}>
                Getting Started Guide
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;

  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <Hero />

      <main>
        <section>
          <div className="container">
            <div className="row row--box-section">
              <SectionBoxes />
            </div>
          </div>
        </section>
        {/* <BannerSection /> */}
        <section>
          <div className="container container--center">
            <div className="row row--center">
              <div className="col col--7 text--center col--bottom-section">
                <h2>Try it out</h2>
                <p>{tryItOutDecription}</p>
                <p>
                  Try our showcase app or <a href="https://expo.io/@sauzy3450/react-native-gesture-handler-demo">get it here using Expo</a>.
                  Or just <a href="/react-native-gesture-handler/docs/example">go to this page</a> to see how you can run it
                  locally with React Native on both Android and iOS.
                </p>
                <div class="item screenshot-container">
                  <img src={screenshotUrl} alt="Gesture handler screenshot" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default Home;
