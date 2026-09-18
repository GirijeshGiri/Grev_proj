import re
import json
import logging
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)


def extract_json_from_text(raw_text: str) -> Optional[Dict[str, Any]]:
    """Safely extracts and parses JSON from raw LLM output, handling markdown fences and extraneous text."""
    if not raw_text or not raw_text.strip():
        return None

    cleaned = raw_text.strip()

    # 1. Direct parse attempt
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # 2. Extract from ```json ... ``` or ``` ... ``` code fence
    fence_pattern = r"```(?:json)?\s*([\s\S]*?)\s*```"
    match = re.search(fence_pattern, cleaned)
    if match:
        candidate = match.group(1).strip()
        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            pass

    # 3. Find outermost curly braces { ... }
    first_brace = cleaned.find("{")
    last_brace = cleaned.rfind("}")
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        candidate = cleaned[first_brace:last_brace + 1]
        try:
            return json.loads(candidate)
        except json.JSONDecodeError as err:
            logger.warning("Failed to parse JSON substring between braces: %s", err)

    return None
