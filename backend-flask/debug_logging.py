import json
import os
import time
from pathlib import Path

# Debug session configuration is injected by the debug harness.
SESSION_ID = "2b84c0"


def _log_path() -> Path:
    """
    Log file is expected at the repo root as `debug-2b84c0.log`.
    We derive it from this file's location to avoid relying on CWD.
    """
    repo_root = Path(__file__).resolve().parents[1]
    return repo_root / "debug-2b84c0.log"


def debug_log(hypothesis_id: str, location: str, message: str, data: dict | None = None, run_id: str = "pre-fix") -> None:
    payload = {
        "sessionId": SESSION_ID,
        "runId": run_id,
        "hypothesisId": hypothesis_id,
        "location": location,
        "message": message,
        "data": data or {},
        "timestamp": int(time.time() * 1000),
    }

    # NDJSON: one JSON object per line.
    log_path = _log_path()
    log_path.parent.mkdir(parents=True, exist_ok=True)
    with open(log_path, "a", encoding="utf-8") as f:
        f.write(json.dumps(payload, ensure_ascii=True) + "\n")

