import { DataFile } from "../data_file.ts";
import type { DataSource } from "../data_source.ts";

import { Octokit } from "octokit";

export class GitHubDataSource implements DataSource {
  readonly owner: string;
  readonly repo: string;
  readonly ref: string;

  readonly dataFiles: Map<string, DataFile> = new Map<string, DataFile>();

  /**
   * Constructs a loader that loads files from a GitHub repository.
   *
   * @param {Object} tree - Tree containing the root of the data
   * @param {string} tree.owner - Owner of the repository
   * @param {string} tree.repo - Name of the repository
   * @param {string} tree.ref - SHA-1 value or ref name (branch or tag) of the tree
   */
  constructor(
    { owner, repo, ref }: {
      owner: string;
      repo: string;
      ref: string;
    },
  ) {
    this.owner = owner;
    this.repo = repo;
    this.ref = ref;
  }

  /**
   * Returns an identifier of this repository.
   */
  get name(): string {
    return `${this.owner}/${this.repo}/${this.ref}`;
  }

  /**
   * Loads the data from GitHub.
   *
   * @returns {Promise<Map<string, DataFile>>} Map of paths to data files
   */
  async loadData(): Promise<Map<string, DataFile>> {
    const octokit = new Octokit();

    const rootTree = await octokit.rest.git.getTree({
      owner: this.owner,
      repo: this.repo,
      tree_sha: this.ref,
      recursive: "true",
    });

    const dataDir = rootTree.data.tree.find((file) => file.path === "data");

    if (!dataDir) throw new Error("No data directory found");

    await Promise.all(
      rootTree.data.tree
        .filter((file) => file.path.startsWith("data/") && file.type === "blob")
        .map(async (file) => {
          const content = await fetch(
            `https://raw.githubusercontent.com/${this.owner}/${this.repo}/${this.ref}/${file.path}`,
          )
            .then((response) => response.text());
          this.dataFiles.set(file.path, new DataFile(file.path, content, this));
        }),
    );

    return this.dataFiles;
  }
}
