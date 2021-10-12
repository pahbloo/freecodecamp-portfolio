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
const projectsRepos = await Promise.all(
  projectsResponses.map((response) => response.json()),
);
console.log("Data from GitHub fetched.");

let index = await Deno.readTextFile("./src/index.html");
const projectTile = await Deno.readTextFile("./src/project-tile.html");
index = index.replace("{{project-tiles}}", projectTile);
await Deno.writeTextFile("./dist/index.html", index);
