import { type JsonMap, parse, stringify } from "@iarna/toml";

import { getLoader, getMappings, getQFAPI } from "./versions";
import { error, success } from "./logger";
import { readFile, writeFile } from "fs/promises";

interface VersionsTOML {
  versions: { [key: string]: string };
  libraries: {
    [key: string]: { module: string; version: { ref: string } | string };
  };
  bundles: { [key: string]: string[] };
  plugins: { [key: string]: { id: string; version: string } };
}

(async () => {
  const textToml = await readFile("./gradle/libs.versions.toml", "utf8");
  const original = parse(textToml) as unknown as VersionsTOML;

  const mcVersion = original.versions.minecraft;

  for (const lib in original.libraries) {
    const libObj = original.libraries[lib];

    if (libObj.module === "org.quiltmc:quilt-mappings") {
      const mappings = await getMappings(mcVersion);

      if (typeof libObj.version === "string") {
        original.libraries[lib].version = mappings;
      } else {
        // @ts-expect-error typescript did a oopsie here
        original.versions[original.libraries[lib].version.ref] = mappings;
      }

      success(`Updated Quilt Mappings to ${mappings}`);
    } else if (libObj.module === "org.quiltmc:quilt-loader") {
      const loader = await getLoader(mcVersion);

      if (typeof libObj.version === "string") {
        original.libraries[lib].version = loader;
      } else {
        // @ts-expect-error typescript did a oopsie here
        original.versions[original.libraries[lib].version.ref] = loader;
      }

      success(`Updated Quilt Loader to ${loader}`);
    } else if (
      libObj.module === "org.quiltmc.quilted-fabric-api:quilted-fabric-api"
    ) {
      const qfapi = await getQFAPI(mcVersion);

      if (typeof libObj.version === "string") {
        original.libraries[lib].version = qfapi;
      } else {
        // @ts-expect-error typescript did a oopsie here
        original.versions[original.libraries[lib].version.ref] = qfapi;
      }

      success(`Updated Quilted Fabric API to ${qfapi}`);
    }
  }

  await writeFile(
    "./gradle/libs.versions.toml",
    `${stringify(original as unknown as JsonMap)}\n`,
  );
})().catch((e) => {
  error(e);
  process.exit(1);
});
