#!/usr/bin/env bun
import { resolve } from "node:path"

const [checkout, destination, archives] = process.argv.slice(2)
if (!checkout || !destination || process.argv.length > 5)
  throw new Error("Usage: bun build.mjs <apexo-checkout> <new-output-directory> [verified-archive-directory]")

const child = Bun.spawn(
  [
    process.execPath,
    resolve(checkout, "plugins/computer-use/script/build-catalog.mjs"),
    destination,
    ...(archives ? [archives] : []),
  ],
  { stdio: ["inherit", "inherit", "inherit"] },
)
process.exit(await child.exited)
