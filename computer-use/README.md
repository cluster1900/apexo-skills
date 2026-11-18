# Computer Use

Computer Use gives Apexo access to the macOS window you select through an installed MCP server. It uses the pinned `agent-desktop` 1.3.1 executable and matching helper. Use native Apexo V2 Sessions on macOS 13 or later. Packaged Apexo Desktop 1.18.35 uses its native sidecar when launched with `APEXO_SIDECAR_V2=1`.

## Install through Apexo

Open **Plugins**, refresh the **Apexo Skills Catalog**, search for `computer-use`, and choose **Install**. Review the trust prompt. Apexo downloads the pinned bundle as part of installation. Open a project and choose **Apply to this project** after adding the permission profile below.

One-time catalog setup for Apexo versions that predate the built-in source:

```sh
apexo plugins add-source https://github.com/cluster1900/apexo-skills.git
apexo plugins refresh
apexo plugins install computer-use --trust
```

## Permissions and first task

Merge the installed bundle's `permissions.json` into the project's native `apexo.json`. For a project with legacy `permission` and `agent` keys, use `permissions-v1.json` with the native V2 Session runtime. The profiles deny unlisted desktop tools and set the selected tools to `ask` for the `build` agent. Start a fresh project runtime after changing configuration.

Grant macOS Accessibility to the identity that launches the plugin. Screen Recording is required for screenshots. Open a disposable app window and ask Apexo to load `computer-use:computer-use`, check `desktop_status` and `desktop_permissions`, then act on the window you name. Run one desktop task at a time. Screenshots and observations can be sent to the configured model.

## Release bundle

The catalog pins the commit of an assembled bundle on the `computer-use-bundles` artifact branch. The bundle includes both Mac architectures and selects the matching executable at startup. The checked source, upstream archive digests, licenses, and per-file checksums are included. See [the Apexo plugin source](https://github.com/cluster1900/apexo-code/pull/209) and [the upstream 1.3.1 release](https://github.com/vercel-labs/agent-desktop/releases/tag/v1.3.1).

From the catalog source branch, assemble a new bundle from a reviewed Apexo checkout:

```sh
bun plugins/computer-use/build.mjs /path/to/apexo /path/to/artifact-checkout/computer-use
```

Verify both upstream archive attestations and the assembled `SHA256SUMS`, commit the generated files on the artifact branch, and update the catalog's Git SHA in a PR. Keep older artifact commits reachable for version-pinned installs.
