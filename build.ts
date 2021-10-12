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
//TODO
console.log("Data from GitHub fetched.");
