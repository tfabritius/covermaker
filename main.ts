import sharp from "npm:sharp@0.33.0";

function shouldRotateImage(
  width: number,
  height: number,
  targetAspectRatio: number,
): boolean {
  // Calculate the current aspect ratio
  const currentAspectRatio = width / height;

  // Calculate the difference between the current aspect ratio and the target aspect ratio
  const difference = Math.abs(currentAspectRatio - targetAspectRatio);

  // Calculate the difference if we were to rotate the image (swap width and height)
  const rotatedAspectRatio = height / width;
  const rotatedDifference = Math.abs(rotatedAspectRatio - targetAspectRatio);

  // If the difference is smaller when rotated, we should rotate the image
  return rotatedDifference < difference;
}

function parseNumberOrFraction(input: string): number | null {
  // Check if input is a valid number
  const number = Number(input);
  if (!Number.isNaN(number)) {
    return number;
  }

  // Check if input is a simple fraction of the form "a/b"
  const fractionMatch = input.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch) {
    const numerator = Number(fractionMatch[1]);
    const denominator = Number(fractionMatch[2]);
    if (
      !Number.isNaN(numerator) && !Number.isNaN(denominator) &&
      denominator !== 0
    ) {
      return numerator / denominator;
    }
  }

  // Input is neither a valid number nor a simple fraction
  return null;
}

async function openAndRotate(
  filePath: string,
  rotate: "on" | "off" | "auto",
  aspectRatio: number,
) {
  let image = sharp(filePath);
  let { width, height } = await image.metadata();
  if (!width || !height) {
    console.error("Cannot read image dimensions");
    Deno.exit(1);
  }

  if (
    rotate === "on" ||
    (rotate == "auto" && shouldRotateImage(width, height, aspectRatio))
  ) {
    console.debug("[DEBUG] Rotating image");

    image = image.rotate(90);
    [width, height] = [height, width];
  }

  return { image, height, width };
}

async function processImage(
  filePath: string,
  rotate: "on" | "off" | "auto",
  aspectRatio: number,
  blur: number,
  outputFilePath: string,
) {
  const { image, width: origWidth, height: origHeight } = await openAndRotate(
    filePath,
    rotate,
    aspectRatio,
  );

  const imageBuffer = await image.toBuffer();

  const { width, height } = enlargeToAspectRatio(
    origHeight,
    origWidth,
    aspectRatio,
  );
  console.debug(
    `[DEBUG] Resizing: ${origWidth}/${origHeight} -> ${width}/${height} (w/h)`,
  );

  const sigma = blur * Math.max(width, height) / 100;
  const resizedImage = image.resize(width, height).blur(sigma);

  const offsetX = Math.round((width - origWidth) / 2);
  const offsetY = Math.round((height - origHeight) / 2);

  const finalImageBuffer = await resizedImage.composite([
    {
      input: imageBuffer,
      left: offsetX,
      top: offsetY,
    },
  ]).toBuffer();

  Deno.writeFileSync(outputFilePath, finalImageBuffer);
}

import { parse } from "https://deno.land/std@0.117.0/flags/mod.ts";

const args = parse(Deno.args, {
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

function showHelp() {
  console.log(`
Usage: deno run --allow-read script.ts [OPTIONS] [FILES]

Options:
  -b, --blur <value>   Set the blur factor (default: 1.0)
  -r, --ratio <value>  Set the target aspect ratio value (default: 1.5)
  --rotate on|off|auto Rotate the image by 90°
  -h, --help           Show this help message and exit

Example:
  deno run --allow-read script.ts -r 75/50 file1.txt file2.txt
  `);
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

  await processImage(inputFile, rotate, aspectRatio, blur, outputFile);

  console.log(`Written ${outputFile}.`);
}

function enlargeToAspectRatio(
  height: number,
  width: number,
  aspectRatio: number,
) {
  if (width / height > aspectRatio) {
    // Enlarge the height
    height = Math.round(width / aspectRatio);
  } else {
    // Enlarge the width
    width = Math.round(height * aspectRatio);
  }
  return { width, height };
}
