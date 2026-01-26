-- Migration: Add column_config setting
-- Date: 2026-01-26
-- Description: Add missing column_config setting with default compact style

INSERT INTO settings (key, value, description)
VALUES (
  'column_config',
  '{
    "marketLabels": {
      "h2h": "1X2",
      "spreads": "AH",
      "totals": "O/U",
      "double_chance": "DC",
      "btts": "BTTS",
      "draw_no_bet": "DNB"
    },
    "outcomeLabels": {
      "home": "1",
      "draw": "X",
      "away": "2",
      "over": "+",
      "under": "-"
    },
    "variationTemplate": "{{market}} {{point}}"
  }'::jsonb,
  'Column display configuration (compact style by default)'
)
ON CONFLICT (key) DO NOTHING;
