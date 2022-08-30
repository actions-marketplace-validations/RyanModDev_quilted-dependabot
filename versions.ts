import { XMLParser } from "fast-xml-parser";

type MappingsResponse = {
  gameVersion: string;
  separator: string;
  build: number;
  maven: string;
  version: string;
  hashed: string;
}[];

export const getMappings = async (v: string) => {
  const res = await fetch(
    "https://meta.quiltmc.org/v3/versions/quilt-mappings/" + v,
  );

  if (!res.ok) {
    return null;
  }

  const a = await (res.json() as Promise<MappingsResponse>).then((b) => b[0]);

  return a.version;
};

type LoaderResponse = {
  loader: {
    separator: string;
    build: number;
    maven: string;
    version: string;
  };
}[];

export const getLoader = async (v: string) => {
  const res = await fetch("https://meta.quiltmc.org/v3/versions/loader/" + v);

  if (!res.ok) {
    return null;
  }

  const a = await (res.json() as Promise<LoaderResponse>).then((b) => b[0]);

  return a.loader.version;
};

interface MavenXML {
  metadata: {
    versioning: {
      latest: string;
      release: string;
      versions: { version: string[] };
    };
  };
}

export const getQFAPI = async (v: string) => {
  const res = await fetch(
    "https://maven.quiltmc.org/repository/release/org/quiltmc/quilted-fabric-api/quilted-fabric-api/maven-metadata.xml",
  );

  if (!res.ok) {
    return null;
  }

  const mavenxml = await (res.text() as Promise<string>).then((b) => {
    return new XMLParser().parse(b) as unknown as MavenXML;
  });

  const goodVersions = mavenxml.metadata.versioning.versions.version.filter(
    (a) => a.includes("-" + v),
  );

  if (!goodVersions.length) {
    return null;
  }

  return goodVersions[0];
};
