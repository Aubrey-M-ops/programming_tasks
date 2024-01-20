import { Octokit } from "octokit";
export const ACCESS_TOKEN =
  "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"; // 替换为你的个人访问令牌

const octokit = new Octokit({
  auth: ACCESS_TOKEN,
});

const commonHeader = {
  owner: "Kaggle",
  per_page: 100,
  headers: {
    "X-GitHub-Api-Version": "2022-11-28",
  },
};

export const octoRequest = async (url, params = {}, isPagination = true) => {
  try {
    const nextPattern = /(?<=<)([\S]*)(?=>; rel="Next")/i;
    let pagesRemaining = true;
    let data = [];

    while (pagesRemaining) {
      const response = await octokit.request(`GET ${url}`, {
        ...commonHeader,
        ...params,
      });
      if (!isPagination) {
        return response.data;
      }
      
      data = [...data, ...(Array.isArray(response.data) ? response.data : [])];
      const linkHeader = response.headers.link;
      pagesRemaining = linkHeader && linkHeader.includes(`rel=\"next\"`);
      if (pagesRemaining) {
        url = linkHeader.match(nextPattern)[0];
      }
    }
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
