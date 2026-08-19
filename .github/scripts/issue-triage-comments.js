// Turns the triage labels applied by CodeRabbit into comments, replacing the
// responses that used to be sent by software-mansion-labs/swmansion-bot.
//
// One comment per label: a run only ever touches the comment belonging to the
// label that triggered it.
//
// Invoked from .github/workflows/issue-triage-comments.yml via actions/github-script.

const greeting = (author) => `Hey @${author}! 👋`;

const RESPONSES = {
  'Missing repro': {
    marker: '<!-- rngh-triage:missing-repro -->',
    body: [
      "The issue doesn't seem to contain a [minimal reproduction](https://stackoverflow.com/help/minimal-reproducible-example).",
      '',
      'Could you provide a [snack](https://snack.expo.dev/), a [gist](https://gist.github.com/) or a link to a GitHub repository that reproduces the problem?',
    ].join('\n'),
  },
  'Missing info': {
    marker: '<!-- rngh-triage:missing-info -->',
    body: [
      'Some of the required information in this issue is missing, incomplete or invalid. Could you take another look at the template and make sure each of these is filled in with something we can act on?',
      '',
      '- **Description** - what happens, and what you expected to happen instead',
      '- **Steps to reproduce** - steps somebody else can follow, not just numbering',
      '- **Gesture Handler version** - the exact version from your `package.json` or lockfile',
      '- **React Native version** - the exact version from your `package.json` or lockfile',
      '- **Versions of related libraries** you mention (Reanimated, Worklets, Screens, Expo) - the versions actually installed',
      '- **Platforms** - the platforms you actually see the bug on',
      '',
      'Once the issue is updated we will take another look. Thanks!',
    ].join('\n'),
  },
};

// Mirrors `check-issues-only-created-after` from the old bot.
const IGNORE_ISSUES_CREATED_BEFORE = '2022-02-01';

// Maintainers apply this when opening an issue and are not nagged about it.
const MAINTAINER_LABEL = 'Maintainer issue';

module.exports = async ({ github, context, core }) => {
  const { issue, label, action } = context.payload;
  const response = RESPONSES[label?.name];

  if (!response) {
    core.notice(`No response configured for "${label?.name}". Skipping.`);
    return;
  }

  if (issue.pull_request) {
    core.notice('Triggered on a pull request. Skipping.');
    return;
  }

  // Retraction runs before the checks below: those decide whether to nag, not
  // whether to clean up. A response must still be removed when the issue was
  // closed or labelled `Maintainer issue` after it was posted.
  if (action === 'unlabeled') {
    const posted = await findResponse({ github, context, issue, marker: response.marker });

    if (!posted) {
      core.notice('No response to retract. Skipping.');
      return;
    }

    await github.rest.issues.deleteComment({ ...context.repo, comment_id: posted.id });
    core.notice(`Retracted "${label.name}" response.`);
    return;
  }

  if (issue.state === 'closed') {
    core.notice('Triggered on a closed issue. Skipping.');
    return;
  }

  if (new Date(issue.created_at) < new Date(IGNORE_ISSUES_CREATED_BEFORE)) {
    core.notice(`Issue predates ${IGNORE_ISSUES_CREATED_BEFORE}. Skipping.`);
    return;
  }

  if (issue.labels.some(({ name }) => name === MAINTAINER_LABEL)) {
    core.notice(`Issue is labelled "${MAINTAINER_LABEL}". Skipping.`);
    return;
  }

  const existing = await findResponse({ github, context, issue, marker: response.marker });

  if (existing) {
    core.notice('Response already posted. Skipping.');
    return;
  }

  await github.rest.issues.createComment({
    ...context.repo,
    issue_number: issue.number,
    body: `${response.marker}\n${greeting(issue.user.login)}\n\n${response.body}`,
  });

  core.notice(`Posted "${label.name}" response.`);
};

async function findResponse({ github, context, issue, marker }) {
  const comments = await github.paginate(github.rest.issues.listComments, {
    ...context.repo,
    issue_number: issue.number,
    per_page: 100,
  });

  return comments.find((comment) => comment.user.type === 'Bot' && comment.body.includes(marker));
}
