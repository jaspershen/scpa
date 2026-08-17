#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
manifest="${script_dir}/gallery_drive_source.json"
if [[ "$#" -ne 1 ]]; then
  printf 'Usage: %s /absolute/path/to/SCPA_Gallery_Originals_20260817\n' "$0" >&2
  exit 2
fi
destination="$1"

mkdir -p "$destination"

jq -c '.files[]' "$manifest" | while IFS= read -r item; do
  id="$(jq -r '.id' <<<"$item")"
  title="$(jq -r '.title' <<<"$item")"
  folder="$(jq -r '.folder' <<<"$item")"
  expected_size="$(jq -r '.size' <<<"$item")"
  safe_folder="$(printf '%s' "$folder" | tr '/' '_' )"
  target_dir="${destination}/${safe_folder}"
  target="${target_dir}/${id}__${title}"
  partial="${target}.part"

  mkdir -p "$target_dir"
  if [[ -f "$target" ]] && [[ "$(wc -c < "$target" | tr -d ' ')" == "$expected_size" ]]; then
    printf 'skip %s\n' "$target"
    continue
  fi

  printf 'download %s/%s\n' "$folder" "$title"
  curl -L --fail --retry 3 --retry-delay 2 --silent --show-error \
    "https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t" \
    -o "$partial"

  actual_size="$(wc -c < "$partial" | tr -d ' ')"
  if [[ "$actual_size" != "$expected_size" ]]; then
    printf 'size mismatch for %s: expected %s, got %s\n' "$title" "$expected_size" "$actual_size" >&2
    exit 1
  fi
  mv "$partial" "$target"
done

printf 'Downloaded %s source images to %s\n' "$(jq '.total_files' "$manifest")" "$destination"
