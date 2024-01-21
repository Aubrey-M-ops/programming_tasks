import fs from "fs";
import { keyAPIS } from "../apis.js";
import { octoRequest } from "../request.js";
import _ from "lodash";

export const DEFAULT_STATICS = {
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

// ----------------- get data of each keys/repos ----------------------------//
// key can be 'commits'/'tags'/'branches'/...
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
    Object.keys(DEFAULT_STATICS).map(async (key) => {
      const keyData = await getKeyData(repoName, key);
      currentRepoData[key] = keyData;
    })
  );
  return currentRepoData;
};

// get Repo information
export const getAllRepoData = async (repos) => {
  let allData = {};
  for (const repo of repos) {
    const repoName = repo.name;
    const repoData = await getRepoData(repoName);
    console.log(`⌛️ Analyzing repo attributes =====> ${repoName}`)
    // print the intermediate results
    fs.writeFile(
      `log/${repo.name}.json`,
      JSON.stringify(repoData),
      (err) => err && console.log(err)
    );
    allData = { ...allData, [repo.name]: _.cloneDeep(repoData) };
  }
  return allData;
};
