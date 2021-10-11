# My freeCodeCamp Portfolio
This is my portfolio of freeCodeCamp projects.
It is also [a freeCodeCamp project][1] itself.
You can see [all of my FCC certifications][2] on my freeCodeCamp profile.

[1]:https://www.freecodecamp.org/learn/responsive-web-design/responsive-web-design-projects/build-a-personal-portfolio-webpage
[2]:https://www.freecodecamp.org/pahbloo

## Description
This portfolio page is build with the custom `build.ts` deno script.
It gets the `index.html` and `projects.json` files from the `src` folder,
and sends the results to the `public` folder, which is served by GitHub Pages.

The `projects.json` file contains a list of my other freeCodeCamp project repos.
Through the GitHub API, the build script gets all the necessary information
and an updated screenshot for each project.

## Contributing
As this is a personal project, I'm not accepting pull requests.
But I'll feel glad if you open an issue for some bug you found or some new features or suggestion.
