import { copy, emptyDir } from "https://deno.land/std@0.110.0/fs/mod.ts";

await emptyDir("./dist");

console.log("Copying static files...");
try {
  for await (const item of Deno.readDir("./static")) {
    if (item.name === "index.html") {
      throw new Error("There is a index.html file in static folder.");
    }
    copy(`./static/${item.name}`, `./dist/${item.name}`);
  }
  console.log("Static files copied.");
} catch (e) {
  await emptyDir(".dist");
  throw e;
}

console.log("Fetching data from GitHub...");
const projectsFile = await Deno.readTextFile("./src/projects.json");
const projectsList: string[] = JSON.parse(projectsFile);
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
console.log("Data from GitHub fetched.");

console.log("Building index.html...");
let projectTiles = "";
const projectTileTemplate = await Deno.readTextFile("./src/project-tile.html");

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
console.log("index.html built.");
console.log("THE END.");
