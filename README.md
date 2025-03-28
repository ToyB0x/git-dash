# git-dash

## Motivation

Please see [slides](https://slides.git-dash.com/) for details.

## Concept

Peter Drucker said, "If you can't measure it, you can't improve it."  

Amazingly, once you measure, your organization automatically start improving.  
When the analysis results are made public within the organization, people make improvements on their own.

So this app provides insights into your Git repositories.

## Milestones

- [ ] rethink and update concepts (current concept is not stable, we are still thinking about it)
- [ ] update github action to support working without app install
- [ ] update app to support working on local environment
- [ ] Github enterprise server support
- [ ] Gitlab support
- [ ] Gitlab enterprise server support
- [ ] Bitbucket support
- [ ] Bitbucket enterprise server support
- [ ] Slack integration
- [ ] Permission management
- [ ] User management
- [ ] Organization management
- [ ] Report management
- [ ] Overwork detection (eg, via heatmap)
- [ ] Code review analysis (eg, via code review comments length, code review comments frequency, natural language processing, etc...)  
  (some milestones are generated by AI, but we will review them)

## Project Status

Currently, the sample implementation as Proof of Concept has been completed.  
We are working on the practical implementation.  
(This project also offers a free service as a proof of concept.)

## Github Actions

We currently provide [Github Actions](https://github.com/marketplace/actions/git-dash-com) with the following features:  

- Collect git / github activity
- Report to backend server (and report can view on [our web site](https://v0.git-dash.com)) 

Please run above actions on your repository.

## How to Setup

### Local mode  

#### Mac
```bash
# Setup Github CLI (widely known as gh command)
brew install gh
gh auth login

# Install pnpm (if you don't have it)
brew install pnpm

# Clone and build this repository
git clone https://github.com/ToyB0x/git-dash.git

# Install dependencies
cd git-dash
pnpm install

# build 
pnpm build --filter @git-dash/cli

# Run app
cd apps/cli
pnpm jobs:sample:interactive
```

# Architecture

WIP
