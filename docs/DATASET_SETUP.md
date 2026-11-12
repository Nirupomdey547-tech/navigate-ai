# Navigate AI — Dataset Setup & RxR Integration Guide

## 1. Local Operational Dataset (Out-of-the-Box)

Navigate AI provides a built-in operational dataset requiring zero external downloads:
- **5 Multi-room Environments**:
  - `office_floor` (10 nodes, 18 directed edges)
  - `residential_apartment` (9 nodes, 16 directed edges)
  - `hotel_corridor` (9 nodes, 16 directed edges)
  - `university_building` (7 nodes, 12 directed edges)
  - `multi_room_indoor` (8 nodes, 14 directed edges)
- **24 Curated Navigation Instructions**:
  - Multilingual trajectories across English, Hindi, and Spanish.
  - Simple straight routes, multi-turn routes, landmark-constrained routes, ambiguous turn tests, and unreachable goal tests.

---

## 2. Google Research Room-Across-Room (RxR) Integration

The Room-Across-Room (RxR) benchmark is an open multilingual dataset developed by Google Research, featuring human-annotated navigation paths in Matterport3D spaces.

### 2.1 Dataset Licensing & Matterport3D Assets
- RxR instructions and path coordinate sequences are published under the Creative Commons Attribution 4.0 International license.
- Matterport3D visual assets (panoramic RGB and depth scans) require a signed academic research agreement directly with Matterport.

### 2.2 Configuring Authorized RxR Data
1. Request access to Matterport3D at: https://niessner.github.io/Matterport/
2. Clone official RxR benchmark data:
```bash
git clone https://github.com/google-research-datasets/RxR.git datasets/rxr/raw
```
3. Run the built-in preprocessing adapter:
```bash
python scripts/preprocess_rxr.py --input-dir datasets/rxr/raw --output-dir datasets/rxr/processed
```
4. Set `.env`:
```env
RXR_DATASET_PATH=./datasets/rxr/processed
```
Navigate AI will automatically detect the preprocessed benchmark trajectories.
