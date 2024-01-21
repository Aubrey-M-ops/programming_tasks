// collection of common methods
import { commonAPIs } from "./apis.js";
import { octoRequest } from "./request.js";

export const getAllRepos = async () => {
  const repos = await octoRequest(commonAPIs.ALL_REPOS);
  return repos;
};

export const getTotalNumber = (allData) => {
  let result = {};
  Object.keys(allData).forEach((repoKey) => {
    const repoData = allData[repoKey];
    Object.keys(repoData).forEach((key) => {
      const isExist = Object.keys(result).indexOf(key) !== -1;
      result = {
        ...result,
        [key]: isExist ? repoData[key] + result[key] : repoData[key],
      };
    });
  });
  return result;
};

export const getMedianNumber = (allData) => {
  let result = {};
  Object.keys(allData).forEach((repoKey) => {
    const repoData = allData[repoKey];
    Object.keys(repoData).forEach((key) => {
      const isExist = Object.keys(result).indexOf(key) !== -1;
      result = {
        ...result,
        [key]: isExist ? [...result[key], repoData[key]] : [repoData[key]],
      };
    });
  });
  Object.keys(result).forEach((key) => {
    result = { ...result, [key]: getArrayMedian(result[key]) };
  });
  return result;
};

const getArrayMedian = (arr) => {
  if (arr.length === 0) {
    return null;
  }
  const sortedArr = arr.slice().sort((a, b) => a - b);
  const middleIndex = Math.floor(sortedArr.length / 2);
  if (sortedArr.length % 2 === 0) {
    // If the array length is an even number, take the average of the two middle numbers.
    return (sortedArr[middleIndex - 1] + sortedArr[middleIndex]) / 2;
  } else {
    // If the array length is an odd number, just take the middle number
    return sortedArr[middleIndex];
  }
};
