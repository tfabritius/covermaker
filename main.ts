import { showHelp } from "./showHelp.ts";
import { parseNumberOrFraction } from "./helpers.ts";
import { enlargeImage } from "./enlarge.ts";

import { parse } from "https://deno.land/std@0.117.0/flags/mod.ts";

const command = Deno.args[0];

if (command === "-h") {
  // show help if no command is given but only -h
  showHelp();
} else if (command === "enlarge") {
  await runCommandEnlarge();
} else {
  console.error(command ? `Unknown command: ${command}` : "No command given.");
  showHelp();
  Deno.exit(1);
}

async function runCommandEnlarge() {
  const args = parse(Deno.args.slice(1), {
    string: [
      "blur",
      "ratio", // -r or --ratio will be treated as a string
      "rotate",
    ],
    alias: {
      b: "blur",
      r: "ratio", // alias -r to --ratio
      h: "help", // alias -h to --help
    },
    default: {
      blur: 1,
      ratio: 1.5,
      rotate: "auto",
      help: false, // default value for --help is false
    },
    unknown: (option) => {
      if (option.startsWith("-")) {
        console.error(`Unknown option: ${option}`);
        showHelp();
        Deno.exit(1);
      }
      return true; // all non-options (file names) are allowed
    },
  });

  if (args.help) {
    showHelp();
    Deno.exit(0);
  }

  const aspectRatio = parseNumberOrFraction(args.ratio);
  if (!aspectRatio) {
    console.error(
      "Invalid aspect ratio, expected number (1.5) or fraction (3/2)",
    );
    Deno.exit(1);
  }

  const blur = parseFloat(args.blur);
  if (isNaN(blur)) {
    console.error(
      "Invalid blur factor, expected number",
    );
    Deno.exit(1);
  }

  const rotate = args.rotate;
  if (rotate !== "auto" && rotate !== "on" && rotate !== "off") {
    console.error(
      "Invalid rotate option, allowed: on, off and auto",
    );
    Deno.exit(1);
  }

  for (const inputFile of args._.map(String)) {
    console.debug(`[DEBUG] Transforming ${inputFile}...`);

    const fileNameParts = /^(.+?)(\.[^.]*$|$)/.exec(inputFile);

    if (!fileNameParts) {
      console.error("Invalid file name format.");
      Deno.exit(1);
    }

    const [, name, extension] = fileNameParts;
    const outputFile = `${name}-converted${extension}`;

    await enlargeImage(inputFile, rotate, aspectRatio, blur, outputFile);

    console.log(`Written ${outputFile}.`);
  }
}
