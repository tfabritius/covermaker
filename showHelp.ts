export function showHelp() {
  console.log(`
  Usage: deno run -A main.ts <COMMAND> [OPTIONS] [FILES]
  
  Commands:
    enlarge              Enlarge images to a given aspect ratio
  
  Options for command "enlarge":
    -b, --blur <value>   Set the blur factor (default: 1.0)
    -r, --ratio <value>  Set the target aspect ratio value (default: 3/2 or 1.5)
    --rotate on|off|auto Rotate the image by 90° (default: auto)
    -h, --help           Show this help message and exit
  
  Example:
    deno run -A main.ts enlarge -r 75/50 image1.png image2.jpg
    `);
}
