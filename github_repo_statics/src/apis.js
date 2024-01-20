import { OWNER } from "./constant.js";
export const keyAPIS = (repo) => ({
  commits: `/repos/${OWNER}/${repo}/commits`,
  stars: `/repos/${OWNER}/${repo}`,
  contributors: `/repos/${OWNER}/${repo}/contributors`,
  branches: `/repos/${OWNER}/${repo}/branches`,
  tags: `/repos/${OWNER}/${repo}/tags`,
  forks: `/repos/${OWNER}/${repo}/forks`,
  releases: `/repos/${OWNER}/${repo}/releases`,
  closedIssues: `/repos/${OWNER}/${repo}/issues?state=closed`,
  environments: `/repos/${OWNER}/${repo}/environments`,
});

export const commonAPIs = {
  ALL_REPOS: `/users/${OWNER}/repos`,
};
