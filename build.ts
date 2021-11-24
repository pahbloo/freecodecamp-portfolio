import { copy, emptyDir } from "https://deno.land/std@0.110.0/fs/mod.ts";

async function copyStaticFiles() {
  try {
    for await (const item of Deno.readDir("./static")) {
      if (item.name === "index.html") {
        throw new Error("There is a index.html file in static folder.");
      }
      copy(`./static/${item.name}`, `./dist/${item.name}`);
    }
  } catch (e) {
    await emptyDir(".dist");
    throw e;
  }
}

async function getCache(projectsList: string[]): Promise<false | GitHubRepo[]> {
  try {
    const cache = JSON.parse(
      await Deno.readTextFile(
        "./cache/projects.json",
      ),
    );

    if (projectsList.length !== cache.projectsList.length) return false;
    if (
      !projectsList.every((project) =>
        cache.projectsList.indexOf(project) !== -1
      )
    ) {
      return false;
    }

    const now = new Date().valueOf();
    const createdAt = new Date(cache.createdAt).valueOf();
    if (now - createdAt > 60 * 60 * 1000) return false;

    console.log("Data retrieved from cache.");
    return cache.projects;
  } catch (_) {
    return false;
  }
}

async function fetchRepoData(projectsList: string[]) {
  const projectsResponses = await Promise.all(
    projectsList.map((repo) =>
      fetch(`https://api.github.com/repos/pahbloo/${repo}`)
    ),
  );
  const projects = await Promise.all(
    projectsResponses.map((response) => response.json()),
  );
  if (projects[projects.length - 1].message?.startsWith("API rate limit")) {
    throw new Error("GitHub API rate limit exceeded.");
  }
  await emptyDir("./cache");
  const cache = {
    createdAt: new Date(),
    projectsList,
    projects,
  };
  await Deno.writeTextFile("./cache/projects.json", JSON.stringify(cache));

  console.log("Data retrieved from GitHub. (Cache updated.)");
  return projects;
}

interface GitHubRepo {
  "html_url": string;
  name: string;
  description: string;
}

async function buildPage(projects: Array<GitHubRepo>) {
  let projectTiles = "";
  const projectTileTemplate = await Deno.readTextFile(
    "./src/project-tile.html",
  );

  for (const project of projects) {
    let projectTile = projectTileTemplate;
    projectTile = projectTile.replace("{{project-link}}", project.html_url);
    projectTile = projectTile.replace("{{project-title}}", project.name);
    projectTile = projectTile.replace("{{description}}", project.description);
    projectTiles += projectTile;
  }

  let index = await Deno.readTextFile("./src/index.html");
  index = index.replace("{{project-tiles}}", projectTiles);
  await Deno.writeTextFile("./dist/index.html", index);
}

await emptyDir("./dist");

console.log("Copying static files...");
await copyStaticFiles();
console.log("Static files copied.");

const projectsFile = await Deno.readTextFile("./src/projects.json");
const projectsList: string[] = JSON.parse(projectsFile);

console.log("Getting projects data...");
const projects = await getCache(projectsList) ||
  await fetchRepoData(projectsList);

console.log("Building index.html...");
await buildPage(projects);
console.log("index.html built.");

console.log("THE END.");
