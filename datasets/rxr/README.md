# RxR Dataset

The **Room-across-Room (RxR)** dataset is a large-scale multilingual Vision-and-Language Navigation dataset with ~126,000 instructions in **English, Hindi, and Telugu** across 90 Matterport3D environments.

## Citation

```bibtex
@inproceedings{ku2020rxr,
  title     = {Room-Across-Room: Multilingual Vision-and-Language Navigation with Dense Spatiotemporal Grounding},
  author    = {Alexander Ku and Peter Anderson and Roma Patel and Eugene Ie and Jason Baldridge},
  booktitle = {EMNLP},
  year      = {2020}
}
```

## Download

Follow the official instructions at:  
👉 https://github.com/google-research-datasets/RxR

Place downloaded files in this directory:

```
rxr/
├── rxr_train_guide.jsonl.gz        # Training split (guide)
├── rxr_val_seen_guide.jsonl.gz     # Val-seen split
├── rxr_val_unseen_guide.jsonl.gz   # Val-unseen split
├── rxr_test_std_public_guide.jsonl.gz
├── connectivity/                   # Matterport graph files
├── poses/                          # Dense pose traces
└── features/
    └── CLIP_ViT-L-14_rgb_features.hdf5
```

## Languages

| Code   | Language  | # Instructions |
|--------|-----------|----------------|
| en-IN  | English   | ~42,000        |
| hi-IN  | Hindi     | ~42,000        |
| te-IN  | Telugu    | ~42,000        |

## Configuration

Set in `.env`:
```
RXR_DATASET_PATH=./datasets/rxr
```

## Preprocessing

```bash
python scripts/preprocess_rxr.py --input ./datasets/rxr --output ./datasets/rxr/processed
```
