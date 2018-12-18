/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

const siteConfig = require(process.cwd() + '/siteConfig.js');

function docUrl(doc, language) {
  return siteConfig.baseUrl + 'docs/' + (language ? language + '/' : '') + doc;
}

class Help extends React.Component {
  render() {
    let language = this.props.language || '';
    const supportLinks = [
      {
        content: `Docs can help you [get your project setup to use Gesture Handler](${docUrl(
          'getting-started.html#installation',
          language
        )}). They also discuss some [low level topics](${docUrl(
          'about-handlers.html',
          language
        )}) that may help you understand how handlers work. On top of that all the parameters of the API are documented there.`,
        title: 'Browse Docs',
      },
      {
        content: `Check our ["Resources" section](${docUrl(
          'resources.html'
        )}) for a list of open-source apps using Gesture Handler and a video recordings from conferences and workshops.`,
        title: 'Projects and talks',
      },
      {
        content: `Ask questions about Gesture Handler on [Expo Developers Slack channel](https://slack.expo.io/). Or just [create an issue on Github](${docUrl(
          'troubleshooting.html#reporting-issues',
          language
        )})`,
        title: 'Join the community',
      },
    ];

    return (
      <div className="docMainWrapper wrapper">
        <Container className="mainContainer documentContainer postContainer">
          <div className="post">
            <header className="postHeader">
              <h2>Need help?</h2>
            </header>
            <p>
              If you need help with Gesture Handler try one of the following
              channels.
            </p>
            <GridBlock contents={supportLinks} layout="threeColumn" />
          </div>
        </Container>
      </div>
    );
  }
}

module.exports = Help;
