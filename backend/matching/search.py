"""
Fuzzy keyword search helpers.

Strategy:
  - Split query into individual terms.
  - For each term, a match fires when:
      (a) the term appears as a substring in the target text (exact/partial), OR
      (b) any whitespace-token in the target text has a SequenceMatcher ratio
          >= FUZZY_THRESHOLD with the query term (handles typos).
  - All terms must match for the record to be included (AND semantics).

Note: semantic synonym matching (e.g. "programmer" → "software engineer")
is not supported without an external NLP service; the threshold is set loose
enough (0.65) to catch common abbreviations and near-synonyms in skill names.
"""

import re
from difflib import SequenceMatcher

FUZZY_THRESHOLD = 0.72


def _tokenize(text: str) -> list[str]:
    return re.findall(r"[a-z0-9#+.]+", text.lower())


def _term_matches(term: str, text_tokens: list[str], full_text: str) -> bool:
    term_lower = term.lower()
    if term_lower in full_text:
        return True
    for token in text_tokens:
        if len(token) >= 3 and SequenceMatcher(None, term_lower, token).ratio() >= FUZZY_THRESHOLD:
            return True
    return False


def fuzzy_match(query: str, searchable_text: str) -> bool:
    """Return True if all query terms fuzzy-match somewhere in searchable_text."""
    terms = _tokenize(query)
    if not terms:
        return True
    full_text = searchable_text.lower()
    text_tokens = _tokenize(searchable_text)
    return all(_term_matches(t, text_tokens, full_text) for t in terms)
