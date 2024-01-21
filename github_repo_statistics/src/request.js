import { Octokit } from "octokit";
// Replace with your personal access token
export const ACCESS_TOKEN =
"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";

const octokit = new Octokit({
  auth: ACCESS_TOKEN,
});

const commonHeader = {
  owner: process.env.Owner,
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
    throw error;
  }
};
