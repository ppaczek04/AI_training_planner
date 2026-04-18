# AI_training_planner
OpenAI powered app to help you prepare workout plan fitted right for you

## Deployment notes
- Frontend calls the API using `VITE_API_BASE_URL` (optional). Leave empty for local dev.
- Azure Function App requires `LLM_trainer` in Application Settings.
- Data files (surveys/output) are written under `DATA_DIR` when set, otherwise defaults to the app root locally.
