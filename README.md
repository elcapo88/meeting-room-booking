# Meeting Room: NotebookLM Integration

This workspace integrates Google NotebookLM to manage meeting recordings, transcripts, and notes.

---

## 1. One-Time Authentication

Google NotebookLM requires logging into your Google account once. In your terminal, run:

```powershell
python meeting_helper.py login
```

*(This automatically uses the dedicated local directory `.notebooklm_data` in this folder, avoiding any Windows permission restrictions on `~/.notebooklm-mcp-cli`)*

To check your login status:
```powershell
python meeting_helper.py check
```

---

## 2. Using Antigravity MCP Integration

Antigravity is configured with the **NotebookLM MCP Server** at:
- `~/.gemini/antigravity/mcp_config.json`
- `~/.gemini/config/mcp_config.json`

Once authenticated and Antigravity is restarted, you can ask the agent in chat:
- *"List my NotebookLM notebooks"*
- *"Create a notebook called 'Weekly Sync' and upload sample_notes.md"*
- *"Summarize the action items from my latest meeting notebook"*
- *"Generate an audio overview (podcast) for this notebook"*

---

## 3. Using the CLI Helper (`meeting_helper.py`)

You can also manage notebooks directly from the terminal:

```powershell
# 1. Check login
python meeting_helper.py check

# 2. List notebooks
python meeting_helper.py list

# 3. Create a notebook for a meeting
python meeting_helper.py create "Meeting-2026-11-22"

# 4. Upload meeting transcript or notes
python meeting_helper.py add <notebook_id> sample_notes.md

# 5. Query the meeting notebook
python meeting_helper.py query <notebook_id> "What were the key decisions?"
```
