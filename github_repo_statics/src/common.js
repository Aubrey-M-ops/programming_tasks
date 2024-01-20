// collection of common methods
import { commonAPIs } from "./apis.js";
import { octoRequest } from "./request.js";
export const getAllRepos = async () => {
  const repos = await octoRequest(commonAPIs.ALL_REPOS);
  return repos;
};
export const getTotalNumber = () => {};

export const getMediumNumber = () => {};
