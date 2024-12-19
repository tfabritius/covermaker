# Covermaker - Adjust Image Aspect Ratio for Card Covers

Covermaker is a web application designed to easily adjust the aspect ratio of images without cropping or leaving empty spaces. It is primarily used for resizing images to fit RFID cards (credit card size) for projects like [ESPuino](https://forum.espuino.de/) or [TonUINO](https://www.tonuino.de/). However, it can be applied to any image resizing task. You can also merge multiple images into a single layout for printing, making it ideal for printing several card covers on standard photo sizes.

## Key Features

- **Change Aspect Ratio**: Resize your images without cropping or leaving empty spaces, ensuring they fit perfectly.
- **Merge Multiple Images**: Merge several images into a single layout for printing, optimized to fit on a single sheet.
- **Fully Browser-Based**: Built with Nuxt.js, Covermaker runs completely in your browser. No data is uploaded or stored on any server. All processing happens locally.

## How to Use

- **Upload Image(s)**: Drag and drop or select the images you want to adjust.
- **Adjust Settings**: The aspect ratio and other options can be changed under the "Settings" section.
- **Merge Images**: If you have multiple images, merge them into one image suitable for printing.

## No Data Storage

Covermaker operates entirely on your device. No images are uploaded to any server, ensuring that your privacy and data security are maintained.

## Access the App

You can use this app [online](https://covermkr.github.io/) without installation.

## Developing the app

If you want to contribute to the app or run it locally, follow these steps:

- Install Node.js
- Clone the GitHub repository
- Install dependencies with `pnpm install`
- Run the app locally using `pnpm dev -o`
