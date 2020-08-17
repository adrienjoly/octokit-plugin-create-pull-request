import { Octokit as Core } from "@octokit/core";

import { createPullRequest } from "../src";
const Octokit = Core.plugin(createPullRequest);

test("invalid auth", async () => {
  const fixtures = require("./fixtures/missing-authentication");
  const fixturePr = fixtures[fixtures.length - 1].response;
  const octokit = new Octokit();

  octokit.hook.wrap("request", (_, options) => {
    const currentFixtures = fixtures.shift();
    const {
      baseUrl,
      method,
      url,
      request,
      headers,
      mediaType,
      draft,
      ...params
    } = options;

    expect(currentFixtures.request.method).toEqual(options.method);
    expect(currentFixtures.request.url).toEqual(options.url);

    Object.keys(params).forEach((paramName) => {
      expect(currentFixtures.request[paramName]).toStrictEqual(
        params[paramName]
      );
    });
    return currentFixtures.response;
  });

  try {
    await octokit.createPullRequest({
      owner: "gr2m",
      repo: "pull-request-test",
      title: "One comes, one goes",
      body: "because",
      head: "patch",
      changes: {
        files: {
          "path/to/file1.txt": "Content for file1",
          "path/to/file2.txt": "Content for file2",
        },
        commit: "why",
      },
    });
    throw new Error("Should not resolve");
  } catch (error) {
    expect(error.message).toEqual(
      "[octokit-plugin-create-pull-request] Missing authentication"
    );
  }
});
