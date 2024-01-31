import { showHelp } from "./showHelp.ts";
import { parseNumberOrFraction } from "./helpers.ts";
import { enlargeImage } from "./enlarge.ts";
import { mergeImages } from "./merge.ts";

import { parse } from "https://deno.land/std@0.117.0/flags/mod.ts";
import { basename } from "https://deno.land/std@0.214.0/path/mod.ts";

const command = Deno.args[0];

if (command === "-h") {
  // show help if no command is given but only -h
  showHelp();
} else if (command === "enlarge") {
  await runCommandEnlarge();
} else if (command === "merge") {
  await runCommandMerge();
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

async function runCommandMerge() {
  const args = parse(Deno.args.slice(1), {
    alias: {
      h: "help", // alias -h to --help
    },
    default: {
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

  if (args._.length !== 4) {
    console.error("Expected exactly four input files.");
    Deno.exit(1);
  }

  const inputFilePaths: [string, string, string, string] = [
    String(args._[0]),
    String(args._[1]),
    String(args._[2]),
    String(args._[3]),
  ];
  console.debug(`[DEBUG] Merging ${inputFilePaths}...`);

  // Get filename from path
  const inputFiles = inputFilePaths.map((inputFile) => basename(inputFile));

  const outputFile = `${inputFiles[0]}-${inputFiles[1]}-` +
    `${inputFiles[2]}-${inputFiles[3]}-merged.jpg`;

  await mergeImages(inputFilePaths, outputFile);

  console.log(`Written ${outputFile}.`);
}
