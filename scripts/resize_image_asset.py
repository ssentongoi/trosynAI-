#!/usr/bin/env python3
"""
Downscale an image asset to 85% of its original size, in place.

Usage:
  python3 scripts/resize_image_asset.py "/path/to/image.png"
"""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Tuple

from PIL import Image


def resize_asset_in_place(image_path: str) -> Tuple[int, int, int, int]:
    """
    Resize an image to exactly 85% of original width and height.

    Returns:
      (original_width, original_height, new_width, new_height)
    """
    path = Path(image_path)
    if not path.exists():
        raise FileNotFoundError(f"Image not found: {path}")

    with Image.open(path) as img:
        original_width, original_height = img.size

        new_width = max(1, round(original_width * 0.85))
        new_height = max(1, round(original_height * 0.85))

        resized = img.resize((new_width, new_height), resample=Image.Resampling.LANCZOS)

        save_kwargs = {}
        image_format = (img.format or "").upper()

        # Keep quality high for lossy formats.
        if image_format in {"JPEG", "JPG", "WEBP"}:
            save_kwargs["quality"] = 95

        resized.save(path, format=img.format, **save_kwargs)

    return original_width, original_height, new_width, new_height


def main() -> None:
    parser = argparse.ArgumentParser(description="Resize image asset to 85% in place.")
    parser.add_argument("image_path", help="Path to the image file.")
    args = parser.parse_args()

    ow, oh, nw, nh = resize_asset_in_place(args.image_path)
    print(f"Resized in place: {args.image_path}")
    print(f"Original: {ow}x{oh}")
    print(f"New:      {nw}x{nh}")


if __name__ == "__main__":
    main()

