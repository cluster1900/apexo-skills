#!/usr/bin/env bun
import { createHash } from "node:crypto"
import { chmod, cp, lstat, mkdir, mkdtemp, readdir, rename, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { pathToFileURL } from "node:url"

const [checkout, destination, archives] = process.argv.slice(2)
if (!checkout || !destination || process.argv.length > 5)
  throw new Error("Usage: bun build.mjs <apexo-checkout> <new-output-directory> [verified-archive-directory]")

const source = resolve(checkout)
const output = resolve(destination)
const git = (args) => {
  const result = Bun.spawnSync(["git", "-C", source, ...args])
  if (result.exitCode !== 0) throw new Error(result.stderr.toString().trim() || "Git command failed")
  return result.stdout.toString().trim()
}
const commit = git(["rev-parse", "HEAD"])
git(["diff", "--quiet", "HEAD", "--", "plugins/computer-use", "LICENSE"])
const { build, artifacts, version } = await import(pathToFileURL(join(source, "plugins/computer-use/script/build.mjs")).href)

const work = await mkdtemp(join(tmpdir(), "apexo-computer-use-platforms-"))
await mkdir(dirname(output), { recursive: true })
const staging = await mkdtemp(join(dirname(output), ".computer-use-publish-"))
try {
  const platforms = ["arm64", "x64"]
  const bundles = await Promise.all(
    platforms.map(async (arch) => {
      const folder = await build({
        arch,
        output: join(work, arch),
        ...(archives
          ? { archive: join(resolve(archives), "agent-desktop-v" + version + "-" + artifacts[arch].target + ".tar.gz") }
          : {}),
      })
      return { arch, folder, upstream: await Bun.file(join(folder, "UPSTREAM.json")).json() }
    }),
  )
  for (const file of [".claude-plugin", ".mcp.json", "licenses", "permissions.json", "permissions-v1.json", "skills"])
    await cp(join(bundles[0].folder, file), join(staging, file), { recursive: true })
  await cp(join(source, "LICENSE"), join(staging, "licenses/apexo-LICENSE"))
  await cp(join(import.meta.dir, "README.md"), join(staging, "README.md"))
  await mkdir(join(staging, "bin"))
  await cp(join(import.meta.dir, "bin/mcp"), join(staging, "bin/mcp"))
  await chmod(join(staging, "bin/mcp"), 0o755)
  for (const bundle of bundles)
    await cp(join(bundle.folder, "bin"), join(staging, "bin", bundle.arch), { recursive: true })

  await Bun.write(
    join(staging, "UPSTREAM.json"),
    JSON.stringify({ apexoCommit: commit, artifacts: bundles.map((bundle) => bundle.upstream) }, null, 2) + "\n",
  )
  const checksums = []
  for (const file of (await readdir(staging, { recursive: true })).toSorted()) {
    const item = await lstat(join(staging, file))
    if (item.isDirectory()) continue
    if (!item.isFile() || item.size > 20_000_000) throw new Error("Unsupported bundle entry: " + file)
    const digest = createHash("sha256").update(await Bun.file(join(staging, file)).bytes()).digest("hex")
    checksums.push({ file, digest, bytes: item.size })
  }
  if (checksums.length + 1 > 20_000 || checksums.reduce((sum, item) => sum + item.bytes, 0) > 199_900_000)
    throw new Error("Bundle exceeds Apexo's plugin limits")
  await Bun.write(join(staging, "SHA256SUMS"), checksums.map((entry) => entry.digest + "  " + entry.file).join("\n") + "\n")
  await rename(staging, output)
  console.log(output)
} finally {
  await Promise.all([staging, work].map((directory) => rm(directory, { recursive: true, force: true })))
}
