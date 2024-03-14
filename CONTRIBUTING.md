# Contributing to WebViz Subsurface Components

Welcome and thank you for considering contributing to WebViz Subsurface Compnents. Contributions are welcome in the form of

- Reporting a bug
- Discussing the current state of the code
- Proposing new features
- Submitting a bug fix or a new feature
- Improvements to code, tests or documentation

## Reporting issues

Please report issues using the [issues tracker](https://github.com/equinor/webviz-subsurface-components/issues)

Use this to report bugs or to suggest new features.

## Submitting changes

In order to submit changes to code, documentation or tests, then please submit a pull request.

In general, we follow the ["fork-and-pull" Git workflow](https://github.com/susam/gitpr)

1. Fork the repository to your own Github account
2. Clone the project to your machine
3. Create a branch locally with a succinct but descriptive name
4. Commit changes to the branch
5. Following any formatting and testing guidelines specific to this repo
6. Push changes to your fork
7. Open a PR in our repository and follow the PR template so that we can efficiently review the changes.

### Pull request checklist

- [ ] Code follows conventions. Validate with `npm run validate` in the `typescript` directory.
- [ ] All tests are passing. Validate with `npx nx run-many -t test_correctness` in the `typescript` directory.
- [ ] PR title follows [Conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) convention.
- [ ] New APIs are documented.
- [ ] If fixing a bug or introducing a new feature, a [story](https://storybook.js.org/docs/writing-stories) describing the issue is provided.
- [ ] New code is covered by tests. `jest` is used for unit tests, and `cypress` is used for visual tests.

## Conventions

Contributions are validated through a set of conditions:

- [Conventional commits](https://www.conventionalcommits.org/en/v1.0.0/)
- Code convention - using `eslint`, `prettier` and `black`
- Testing - using `jest` and `cypress`
- Security - using Snyk

## Getting Help

Post questions in [Discussions](https://github.com/equinor/webviz-subsurface-components/discussions)
