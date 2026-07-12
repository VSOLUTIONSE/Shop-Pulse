---
name: Gemini model naming
description: Dated Gemini model ids can be rejected for new API keys/projects even though they still appear in the models list.
---

Calling the Generative Language API's `generateContent` with a specific dated model id (e.g. `models/gemini-2.5-flash`) can return a 404 with "this model is no longer available to new users," even though that same model id still shows up when listing `models` for that key.

**Why:** Google appears to restrict some older/dated model ids from new API keys or projects while leaving them visible in the catalog for existing users.

**How to apply:** when wiring a direct (non-integration) Gemini API call with a user-supplied `GEMINI_API_KEY`, prefer an evergreen `-latest` alias (e.g. `gemini-flash-latest`, `gemini-pro-latest`) over a dated model id, so the integration keeps working as Google rotates default models.
