# Demo Dataset

This directory contains a **small curated subset** of navigation episodes designed for quick iteration and local testing without requiring the full RxR download.

## Contents

```
demo/
├── scans/              # Matterport scan IDs used in demo episodes
├── connectivity/       # Graph JSON files for each scan
├── images/             # Pre-extracted panoramic features (compressed)
├── episodes/
│   ├── train.jsonl     # ~200 training episodes (en/hi)
│   ├── val_seen.jsonl  # ~50 val-seen episodes
│   └── val_unseen.jsonl# ~50 val-unseen episodes
└── features/
    └── CLIP_ViT-B-32_rgb_features.hdf5
```

## Usage

Set in `.env`:
```
DEMO_DATASET_PATH=./datasets/demo
```

The backend loads demo data automatically in `APP_ENV=development`.

## Episode Format

Each `.jsonl` line:
```json
{
  "episode_id": "demo_0001",
  "scan": "mJXqzFtmKg4",
  "language": "en-IN",
  "instruction": "Walk past the kitchen island and stop at the dining table.",
  "path": ["startViewpointId", "...", "goalViewpointId"],
  "heading": 0.0,
  "distance": 12.4
}
```
