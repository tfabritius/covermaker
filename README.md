# Covermaker

Little image manipulation tool to create covers.
 - Resizes images to a different aspect ratio by adding some fuzzy background
 - Merge four images into one for easier printing

## Usage

- Install [deno](https://docs.deno.com/runtime/manual/getting_started/installation)
- Run `deno run -A main.ts -h` to show help
- Example: `deno run -A main.ts enlarge -r 75/50 image1.png image2.jpg`