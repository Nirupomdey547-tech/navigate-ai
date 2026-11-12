#!/usr/bin/env python3
"""
Navigate AI — Dataset preprocessing helper scripts.
Usage:
    python scripts/preprocess_rxr.py --input ./datasets/rxr --output ./datasets/rxr/processed
"""
import argparse
import gzip
import json
import pathlib


def preprocess_rxr(input_dir: pathlib.Path, output_dir: pathlib.Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    for split in ("train", "val_seen", "val_unseen", "test_std_public"):
        src = input_dir / f"rxr_{split}_guide.jsonl.gz"
        if not src.exists():
            print(f"[skip] {src} not found")
            continue
        dst = output_dir / f"{split}.jsonl"
        count = 0
        with gzip.open(src, "rt", encoding="utf-8") as fin, dst.open("w") as fout:
            for line in fin:
                episode = json.loads(line)
                fout.write(json.dumps(episode) + "\n")
                count += 1
        print(f"[ok] {split}: {count} episodes -> {dst}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=pathlib.Path)
    parser.add_argument("--output", required=True, type=pathlib.Path)
    args = parser.parse_args()
    preprocess_rxr(args.input, args.output)
