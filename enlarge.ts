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

export async function enlargeImage(
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
