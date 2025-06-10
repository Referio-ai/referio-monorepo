import json
import os
from datetime import datetime
from pathlib import Path
from typing import Any, Dict
from uuid import UUID

class UUIDEncoder(json.JSONEncoder):
    def default(self, obj: Any) -> Any:
        if isinstance(obj, UUID):
            return str(obj)
        return super().default(obj)

def log_code_change(
    file_path: str,
    change_type: str,
    description: str,
    changes: Dict[str, Any]
) -> None:
    """
    Log code changes made by AI to a JSON file
    
    Args:
        file_path: Path to the file that was changed
        change_type: Type of change (e.g., 'fix', 'feature', 'refactor')
        description: Description of the change
        changes: Dictionary containing the changes made
    """
    log_dir = Path("log-changes")
    log_dir.mkdir(exist_ok=True)
    
    today = datetime.now().strftime("%Y-%m-%d")
    log_file = log_dir / f"changes-{today}.json"
    
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "file_path": file_path,
        "change_type": change_type,
        "description": description,
        "changes": changes
    }
    
    existing_logs = []
    if log_file.exists():
        with open(log_file, "r") as f:
            try:
                existing_logs = json.load(f)
            except json.JSONDecodeError:
                existing_logs = []
    
    existing_logs.append(log_entry)
    
    with open(log_file, "w") as f:
        json.dump(existing_logs, f, indent=2, cls=UUIDEncoder) 