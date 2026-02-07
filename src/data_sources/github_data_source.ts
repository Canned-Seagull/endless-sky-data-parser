import { DataFile } from "../data_file.ts";
import type { DataSource } from "../data_source.ts";
import { Sprite } from "../sprite.ts";

import { Octokit } from "octokit";

export class GitHubDataSource implements DataSource {
  public readonly owner: string;
  public readonly repo: string;
  public readonly ref: string;

  /**
   * Whether or not the data has been loaded from the GitHub repository.
   */
  public loaded: boolean = false;

  public readonly dataFiles: Map<string, DataFile> = new Map<
    string,
    DataFile
  >();

  /**
   * Sprites in this GitHub repository.
   */
  public readonly sprites: Map<string, Sprite> = new Map<
    string,
    Sprite
  >();

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
  public get name(): string {
    return `${this.owner}/${this.repo}/${this.ref}`;
  }

  /**
   * Loads the data from GitHub.
   */
  public async load(): Promise<void> {
    const octokit = new Octokit();

    const rootTree = await octokit.rest.git.getTree({
      owner: this.owner,
      repo: this.repo,
      tree_sha: this.ref,
      recursive: "true",
    });

    // Load data
    const dataDir = rootTree.data.tree.find((file) => file.path === "data");
    if (dataDir) {
      await Promise.all(
        rootTree.data.tree
          .filter((file) =>
            file.path.startsWith("data/") && file.type === "blob"
          )
          .map(async (file) => {
            const content = await fetch(
              this.pathToUrl(file.path),
            )
              .then((response) => response.text());
            this.dataFiles.set(
              file.path,
              new DataFile(file.path, content, this),
            );
          }),
      );
    }

    // Load images
    const imagesDir = rootTree.data.tree.find((file) => file.path === "images");
    if (imagesDir) {
      rootTree.data.tree
        .filter((file) =>
          file.path.startsWith("images/") && file.type === "blob"
        )
        .forEach((file) => {
          // Reverse the name for easier processing
          const match = file.path.slice(7).split("").toReversed().join("")
            .match(
              /^(?<extension>\w+)\.(?<size>(x(1|2)@)?)(?<swizzleMaskFlag>(ws@)?)(?<frameNumber>(\d+(?=[-+^~]))?)(?<blendingMode>[-+^~]?)(?<name>.+)$/,
            );

          const groups = match?.groups;

          if (!match || !groups) {
            throw new Error(`Invalid sprite path: ${file.path}`);
          }

          // Reverse all the matches back to the original
          Object.keys(groups)
            .forEach((key) => {
              if (groups[key]) {
                groups[key] = groups[key].split("").toReversed().join("");
              }
            });

          if (!this.sprites.get(groups.name)) {
            this.sprites.set(groups.name, new Sprite(groups.name));
          }

          const sprite = this.sprites.get(groups.name)!;

          sprite.addFrame(
            this,
            {
              path: file.path,
              name: groups.name,
              blendingMode: groups.blendingMode,
              frameNumber: groups.frameNumber,
              swizzleMaskFlag: groups.swizzleMaskFlag,
              size: groups.size,
              extension: groups.extension,
            },
          );
        });
    }

    this.loaded = true;
  }

  /**
   * Converts a path within this repository to a GitHub URL from which the resource at the path can be loaded.
   *
   * @param {string} path - Path of the resource within the data source without the leading slash
   * @returns {string} - URL at which the resource can be found
   */
  public pathToUrl(path: string): string {
    return encodeURI(
      `https://raw.githubusercontent.com/${this.owner}/${this.repo}/${this.ref}/${path}`,
    );
  }
}
