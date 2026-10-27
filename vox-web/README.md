# vox-web - Multi-Provider AI Chat Web UI

Modern web interface for vox-cli with code copy buttons, syntax highlighting, model switching, and filter toggles.

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- OpenRouter API key (or other provider)

### Backend Setup
```powershell
cd "C:\Users\Lenovo\OneDrive\Documents\vox-cli\vox-web\backend"
pip install fastapi uvicorn aiohttp pydantic
python main.py
```
Runs on `http://localhost:8080`

### Frontend Setup
```powershell
cd "C:\Users\Lenovo\OneDrive\Documents\vox-cli\vox-web\frontend"
npm install
npm start
```
Runs on `http://localhost:3000`

### Configuration
1. Open http://localhost:3000
2. Click **Settings** (gear icon)
3. Enter your **OpenRouter API key** (or other provider)
4. Select model from the dropdown
5. Toggle **Unfiltered/Censored** mode

## Features

| Feature | Description |
|---------|-------------|
| **Multi-Provider** | OpenRouter, Ollama, Grok, OpenAI, Anthropic, llama.cpp |
| **Code Blocks** | Syntax highlighting + copy button + expand/collapse |
| **Comparison Boxes** | Side-by-side code diffs |
| **Model Switcher** | `/switchmodels` style dropdown with free/paid separation |
| **Filter Toggle** | `/togglefilters` - Unfiltered ↔ Censored modes |
| **WebSocket Streaming** | Real-time token streaming |
| **Multi-Provider** | Switch providers without losing context |

## Commands (in chat)

| Command | Action |
|---------|--------|
| `/model_list` | List all models (free/paid, uncensored/regular) |
| `/switchmodels` | Interactive model picker |
| `/togglefilters` | Switch Unfiltered ↔ Censored |
| `/provider` | Show current provider/model/mode |
| `/clear` | Clear conversation |
| `/save` | Export chat to JSON |

## Project Structure

```
vox-web/
├── backend/
│   └── main.py          # FastAPI + WebSocket server
└── frontend/
    ├── src/
    │   ├── components/  # React components
    │   ├── store.js     # Zustand state management
    │   ├── App.js       # Main app
    │   └── index.css    # Tailwind-like CSS
    └── package.json
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/providers` | List providers |
| GET | `/api/models/{provider}` | List models |
| POST | `/api/chat` | Send message |
| WS | `/ws/chat` | Streaming chat |
| POST | `/api/config/oauth` | Set OAuth credentials |
| POST | `/api/auth` | OAuth authenticate |

## Troubleshooting

**npm install stuck?**
```bash
npm install --legacy-peer-deps
```

**Backend can't find vox-cli?**
```powershell
cd "C:\Users\Lenovo\OneDrive\Documents\vox-cli\vox-web\backend"
python main.py
```

**Frontend can't connect to backend?**
- Ensure backend runs on port 8080
- Check CORS settings in `main.py`

**Model not found:**
```bash
# In chat: /model_list
# Pick available model
```