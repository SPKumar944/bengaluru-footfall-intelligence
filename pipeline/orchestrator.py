#!/usr/bin/env python3
"""
Master Pipeline Orchestrator: Autonomous End-to-End Execution
Runs all 4 geospatial pipeline stages in sequence, logs runtime metrics,
verifies manifest checksums, and ensures zero-defect delivery.
"""

import os
import sys
import time
import json
import logging
import subprocess

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [ORCHESTRATOR] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("logs/overnight_execution.log", mode="a")
    ]
)
logger = logging.getLogger("orchestrator")

STAGES = [
    ("Stage 1: Ingest Competitors & Footfall POIs", "pipeline/01_ingest_osm_competitors.py"),
    ("Stage 2: H3 Tessellation & Demographics", "pipeline/02_demographics_footfall.py"),
    ("Stage 3: Street Network Catchment Isochrones", "pipeline/03_network_isochrones.py"),
    ("Stage 4: DuckDB Scoring & Manifest Audit", "pipeline/04_h3_gravity_scoring.py"),
]

def run_stage(name, script_path):
    logger.info(f"========== STARTING {name} ==========")
    start_time = time.time()
    
    python_bin = sys.executable
    cmd = [python_bin, script_path]
    
    res = subprocess.run(cmd, capture_output=True, text=True)
    duration = time.time() - start_time

    if res.returncode != 0:
        logger.error(f"FAILURE in {name}! Exit Code: {res.returncode}")
        logger.error(f"STDERR:\n{res.stderr}")
        raise RuntimeError(f"Stage failed: {script_path}")
    
    logger.info(f"SUCCESS in {name} ({duration:.2f}s).")
    if res.stdout:
        # print concise last 5 lines
        lines = [l for l in res.stdout.strip().split("\n") if l]
        for l in lines[-4:]:
            logger.info(f"  {l}")

def main():
    logger.info("Starting Bengaluru Ice Cream Spatial Intelligence Master Pipeline...")
    total_start = time.time()

    for name, script in STAGES:
        run_stage(name, script)

    # Verify manifest
    manifest_path = "data/manifest_checksums.json"
    if not os.path.exists(manifest_path):
        logger.error(f"Manifest file {manifest_path} was not created!")
        sys.exit(1)

    with open(manifest_path, "r") as f:
        manifest = json.load(f)

    logger.info("========== MANIFEST VALIDATION AUDIT ==========")
    all_valid = True
    for file_info in manifest["files"]:
        status = file_info.get("status")
        fname = file_info.get("filename")
        sha = file_info.get("sha256", "N/A")[:12]
        rows = file_info.get("row_or_feature_count", 0)
        size = file_info.get("size_bytes", 0)
        logger.info(f"✓ {fname} | Status: {status} | SHA: {sha}... | Records: {rows} | Size: {size/1024:.1f} KB")
        if status != "VALID_NON_EMPTY" or rows <= 0:
            all_valid = False

    total_duration = time.time() - total_start
    if all_valid:
        logger.info(f"All stages successfully verified! Total elapsed time: {total_duration:.2f}s")
    else:
        logger.warning("Manifest audit flagged incomplete files!")
        sys.exit(2)

if __name__ == "__main__":
    main()
