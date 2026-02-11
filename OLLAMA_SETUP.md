# OpenRouter Setup Guide (Hosted AI)

This app now uses OpenRouter for hosted AI. A local model runtime is no longer
required.

## Quick Setup

1. Create an API key in your OpenRouter dashboard.
2. Add the following to `.env.local`:

```env
OPENROUTER_API_KEY="your-openrouter-api-key"
OPENROUTER_MODEL="openrouter/free"
OPENROUTER_BASE_URL="https://openrouter.ai/api/v1"
```

3. Restart the dev server. Auto-categorization will run after you sign in.

## Notes

- `OPENROUTER_MODEL` can be set to any OpenRouter model ID.
- Auto-categorization runs on sign-in without any extra action.
