import { type JsonMap, parse, stringify } from "@iarna/toml";

import { getLoader, getMappings, getQFAPI } from "./versions";
import { error, success } from "./logger";
import { readFile, writeFile } from "fs/promises";

import { setOutput } from "@actions/core";

interface VersionsTOML {
  versions: { [key: string]: string };
  libraries: {
    [key: string]: { module: string; version: { ref: string } | string };
  };
  bundles: { [key: string]: string[] };
  plugins: { [key: string]: { id: string; version: string } };
}

const upgrade = async (
  name: string,
  lib: string,
  original: VersionsTOML,
  newVersion: string,
): Promise<[string, string] | null> => {
  let actuallyUpgraded = false;

  let versionObjInLib = original.libraries[lib].version;

  if (typeof versionObjInLib === "string") {
    if (versionObjInLib !== newVersion) {
      actuallyUpgraded = true;
      versionObjInLib = newVersion;
    }
  } else {
    if (
      original.versions[versionObjInLib.ref] !==
        newVersion
    ) {
      actuallyUpgraded = true;
      original.versions[versionObjInLib.ref] = newVersion;
    }
  }

  if (actuallyUpgraded) {
    success(`Updated ${name} to ${newVersion}`);
    return [name, newVersion];
  }

  success(`${name} is up to date!`);
  return null;
};

(async () => {
  const textToml = await readFile("./gradle/libs.versions.toml", "utf8");
  const original = parse(textToml) as unknown as VersionsTOML;

  const mcVersion = original.versions.minecraft;

  let updatedStuff: [string, string][] = [];

  for (const lib in original.libraries) {
    if (original.libraries[lib].module === "org.quiltmc:quilt-mappings") {
      const mappings = await getMappings(mcVersion);
      const res = await upgrade("Quilt Mappings", lib, original, mappings);
      if (res) updatedStuff.push(res);
    } else if (original.libraries[lib].module === "org.quiltmc:quilt-loader") {
      const loader = await getLoader(mcVersion);
      const res = await upgrade("Quilt Loader", lib, original, loader);
      if (res) updatedStuff.push(res);
    } else if (
      original.libraries[lib].module ===
        "org.quiltmc.quilted-fabric-api:quilted-fabric-api"
    ) {
      const qfapi = await getQFAPI(mcVersion);
      const res = await upgrade("Quilted Fabric API", lib, original, qfapi);
      if (res) updatedStuff.push(res);
    }
  }

  setOutput(
    "changelog",
    updatedStuff.map(([name, version]) =>
      `- **${name}** was updated to \`${version}\``
    ).join("\n"),
  );

  await writeFile(
    "./gradle/libs.versions.toml",
    `${stringify(original as unknown as JsonMap)}\n`,
  );
})().catch((e) => {
  error(e);
  process.exit(1);
});
