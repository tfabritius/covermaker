import sharp from "npm:sharp@0.33.0";

export async function mergeImages(
  inputFilePaths: [string, string, string, string],
  outputFilePath: string,
) {
  // read the images and their dimensions
  const images = inputFilePaths.map((inputFilePath) => sharp(inputFilePath));
  const imagesMetadata = await Promise.all(
    images.map((image) => image.metadata()),
  );

  // check if all images have width and height
  if (!imagesMetadata.every((md) => md.width && md.height)) {
    console.error("Cannot read image dimensions");
    Deno.exit(1);
  }

  // check if all images have the same aspect ratio (within some tolerance)
  const aspectRatios = imagesMetadata.map(
    (md) => md.width! / md.height!,
  );
  if (
    !aspectRatios.every((ratio) => Math.abs(ratio - aspectRatios[0]) < 0.01)
  ) {
    console.error("Images do not have the same aspect ratio: " + aspectRatios);
    Deno.exit(1);
  }

  // get the largest image dimensions
  const maxWidth = Math.max(...imagesMetadata.map((md) => md.width!));
  const maxHeight = Math.max(...imagesMetadata.map((md) => md.height!));

  // resize all images to the largest dimensions
  const resizedImages = images.map((image) =>
    image.resize(maxWidth, maxHeight)
  );

  // merge the images
  const mergedImage = await sharp({
    create: {
      width: maxWidth * 2,
      height: maxHeight * 2,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  });
  mergedImage.composite([
    { input: await resizedImages[0].toBuffer(), left: 0, top: 0 },
    { input: await resizedImages[1].toBuffer(), left: maxWidth, top: 0 },
    { input: await resizedImages[2].toBuffer(), left: 0, top: maxHeight },
    {
      input: await resizedImages[3].toBuffer(),
      left: maxWidth,
      top: maxHeight,
    },
  ]);

  // write the result to disk
  mergedImage.toFile(outputFilePath);
}
