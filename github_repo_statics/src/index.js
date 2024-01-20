import fs from "fs";
import { commonAPIs, keyAPIS } from "./apis.js";
import { octoRequest } from "./request.js";

const DEFAULT_STATICS = {
  commits: 0,
  stars: 0,
  contributors: 0,
  branches: 0,
  tags: 0,
  forks: 0,
  releases: 0,
  closedIssues: 0,
  environments: 0,
};

const STATIC_KEYS = [
  "commits",
  "stars",
  "contributors",
  "branches",
  "tags",
  "forks",
  "releases",
  "closedIssues",
  "environments",
];

// ----------------- all repos ----------------------------//
const getAllRepos = async () => {
  const repos = await octoRequest(commonAPIs.ALL_REPOS);
  return repos;
};

// ----------------- get data of each keys/repos ----------------------------//
export const getKeyData = async (repoName, key) => {
  const APIS = keyAPIS(repoName);
  let data = await octoRequest(APIS[key]);
  // special case: stars,
  if (key === "stars") {
    data = await octoRequest(APIS[key], {}, false);
    return data?.stargazers_count;
  }
  return data?.length;
};

export const getRepoData = async (repoName) => {
  const currentRepoData = DEFAULT_STATICS;
  // Use Promise.all to wait for all asynchronous operations to complete
  await Promise.all(
    STATIC_KEYS.map(async (key) => {
      const keyData = await getKeyData(repoName, key);
      currentRepoData[key] = keyData;
    })
  );
  return currentRepoData;
};

// get Repo information
export const getAllRepoData = async () => {
  const repos = await getAllRepos();
  let allData = {};
  for (const repo of repos) {
    const repoData = await getRepoData(repo.name);
    fs.writeFile(`log/${repo.name}.json`, JSON.stringify(repoData), (err) =>
      err && console.log(err)
    );
    allData = { ...allData, [repo.name]: repoData };
  }
  return allData;
};
