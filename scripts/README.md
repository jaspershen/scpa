# SCPA gallery asset tools

The published gallery contains web-optimized copies of the 51 images in the shared Google Drive folder. Source images stay outside the repository.

## Rebuild

Requirements: Node.js, npm, `jq`, `curl`, and `heif-convert` (for HEIC sources).

```sh
cd scripts
npm ci
./download_gallery_drive.sh /absolute/path/to/SCPA_Gallery_Originals_20260817
npm run build -- /absolute/path/to/SCPA_Gallery_Originals_20260817
npm run validate
```

Generate optional visual QA contact sheets with:

```sh
npm run contact-sheets -- /absolute/path/to/output-directory
```

The build rotates source pixels into their intended orientation, limits the long edge to 1600px, converts to sRGB WebP at quality 76, and strips EXIF/GPS/XMP/ICC metadata.
