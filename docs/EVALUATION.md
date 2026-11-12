# Navigate AI — Evaluation Metrics & Benchmarking

## 1. Metric Definitions

Navigate AI implements the standard evaluation suite used across the Vision-and-Language Navigation literature:

### 1.1 Navigation Success Rate (SR)
Binary success flag defined as stopping within threshold distance $d_{\text{th}} = 3.0\text{m}$ of the ground-truth destination:
$$\text{SR} = \frac{1}{N} \sum_{i=1}^N \mathbb{I}(d(v_{\text{final}}^{(i)}, g^{(i)}) \le 3.0)$$

### 1.2 Success Weighted by Path Length (SPL)
Measures trajectory efficiency, penalizing unnecessary wandering:
$$\text{SPL} = \frac{1}{N} \sum_{i=1}^N S_i \frac{L_{\text{opt}}^{(i)}}{\max(L_{\text{opt}}^{(i)}, L_{\text{agent}}^{(i)})}$$
Where $S_i \in \{0, 1\}$ is the success indicator.

### 1.3 Navigation Error (NE)
Mean Euclidean distance in meters between the final agent stopping position and the intended goal node:
$$\text{NE} = \frac{1}{N} \sum_{i=1}^N \|p_{\text{agent}}^{(i)} - p_{\text{goal}}^{(i)}\|_2$$

### 1.4 Normalized Dynamic Time Warping (nDTW)
Quantifies path fidelity along the full continuous trajectory:
$$\text{nDTW} = \exp\left(-\frac{\text{DTW}(P_{\text{agent}}, P_{\text{ref}})}{|P_{\text{ref}}| \cdot d_{\text{th}}}\right)$$

### 1.5 Success Weighted nDTW (SDTW)
Strict metric rewarding high path fidelity only upon task completion:
$$\text{SDTW} = S_i \cdot \text{nDTW}$$

---

## 2. Cross-Lingual Evaluation Protocol

To benchmark language generalization, equivalent routes are evaluated across languages:
1. **Route Consistency**: Verifies that the agent selects identical topological trajectories regardless of whether prompted in English or Hindi.
2. **Landmark Grounding**: Measures whether Hindi entities (e.g. `रिसेप्शन`, `सीढ़ी`) ground to identical nodes as their English counterparts (`reception`, `staircase`).
3. **Decision Latency**: Measures inference execution time per decision step (ms).
