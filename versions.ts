import { got } from 'got';
import { XMLParser } from 'fast-xml-parser';

type MappingsResponse = {
  gameVersion: string;
  separator: string;
  build: number;
  maven: string;
  version: string;
  hashed: string;
}[];

export const getMappings = async (v: string) => {
  const res = (await got(
    'https://meta.quiltmc.org/v3/versions/quilt-mappings/' + v
  ).json()) as MappingsResponse;

  const a = res[0];

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
  const res = (await got(
    'https://meta.quiltmc.org/v3/versions/loader/' + v
  ).json()) as LoaderResponse;

  const a = res[0];

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

const getMaven = async (v: string) => {
  const res = await got(
    'https://maven.quiltmc.org/repository/release/' +
      v.split(/[:.]/).join('/') +
      '/maven-metadata.xml'
  ).text();

  const mavenxml = new XMLParser().parse(res) as unknown as MavenXML;

  return mavenxml.metadata.versioning.versions.version;
};

export const getQFAPI = async (v: string) => {
  const goodVersions = await getMaven(
    'org.quiltmc.quilted-fabric-api:quilted-fabric-api'
  ).then((a) => a.filter((a) => a.includes('-' + v)));

  return goodVersions[0];
};
