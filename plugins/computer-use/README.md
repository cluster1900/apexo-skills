# Computer Use

Computer Use operates the macOS window you select through a local MCP server. It bundles the pinned `agent-desktop` 1.3.1 executable and matching helper for Apple Silicon and Intel Macs running macOS 13 or later. Computer Use needs no Vercel account or OAuth.

## Install or update through Apexo

Open **Plugins**, refresh **Apexo Skills Catalog**, and search for `computer-use`. Choose **Install** or **Update** and confirm trust. Apexo downloads the pinned bundle during installation. Apply the plugin to your project, then check that `computer-use:desktop` shows as connected before prompting your Session.

Use a build with the compatibility plugin data fix for default Desktop or a V1 Web Client. In native V2, apply the bundle through the Plugins runtime controls. [Apexo host compatibility fix](https://github.com/cluster1900/apexo-code/pull/209)

One-time catalog setup for Apexo versions that predate the built-in source:

```sh
apexo plugins add-source https://github.com/cluster1900/apexo-skills.git
apexo plugins refresh
apexo plugins install computer-use --trust
```

## Permissions and first task

Merge `permissions.json` into a native config, or use `permissions-v1.json` with a config that uses `permission` and `agent`. Version 0.1.1 covers both compatibility and migrated native tool names in the V1 profile. The profiles deny unlisted desktop tools and set the selected tools to `ask` for the `build` agent. Reload your config to apply policy changes.

Grant macOS Accessibility to the identity that launches the plugin. Screen Recording is required for screenshots. Open a disposable app window and ask Apexo to load `computer-use:computer-use`, check `desktop_status` and `desktop_permissions`, then act on the window you name. Run one desktop task at a time. Screenshots and observations can be sent to the configured model.

## Installed files

The **Files** path shows the package installed in Apexo's per-user data directory. With the default data root, Apexo normally uses `~/.local/share/apexo/plugins`. An installation reusing legacy OpenCode data may show `~/.local/share/opencode/plugins`. You can install through the catalog from any project directory.

## Release bundle

The catalog pins the commit of an assembled bundle on the `computer-use-bundles` artifact branch. The bundle includes both Mac architectures and selects the matching executable at startup. The checked source, upstream archive digests, licenses, and per-file checksums are included. See [the Apexo plugin source](https://github.com/cluster1900/apexo-code/pull/209) and [the upstream 1.3.1 release](https://github.com/vercel-labs/agent-desktop/releases/tag/v1.3.1).

Assemble a new bundle from a reviewed Apexo checkout. The catalog entry point runs the builder in that checkout.

```sh
bun plugins/computer-use/build.mjs /path/to/apexo /path/to/artifact-checkout/computer-use
```

Verify both upstream archive attestations and the assembled `SHA256SUMS`, commit the generated files on the artifact branch, and update the catalog's Git SHA in a PR. Keep older artifact commits reachable for version-pinned installs.
