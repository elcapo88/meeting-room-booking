"""
Meeting Room NotebookLM Helper
Simplifies uploading meeting notes and transcripts to Google NotebookLM.
"""

import os
import subprocess
import sys
from pathlib import Path

PYTHON_EXE = sys.executable
WORKSPACE_DIR = Path(__file__).parent.resolve()
STORAGE_DIR = WORKSPACE_DIR / ".notebooklm_data"
STORAGE_DIR.mkdir(parents=True, exist_ok=True)

def run_nlm(args: list[str]) -> subprocess.CompletedProcess:
    """Run an nlm CLI command using the python module with custom storage directory."""
    env = os.environ.copy()
    env["NOTEBOOKLM_MCP_CLI_PATH"] = str(STORAGE_DIR)
    cmd = [PYTHON_EXE, "-m", "notebooklm_tools.cli.main"] + args
    return subprocess.run(cmd, env=env, capture_output=True, text=True, encoding="utf-8")

def login():
    """Launch interactive login with dedicated storage."""
    env = os.environ.copy()
    env["NOTEBOOKLM_MCP_CLI_PATH"] = str(STORAGE_DIR)
    cmd = [PYTHON_EXE, "-m", "notebooklm_tools.cli.main", "login"]
    subprocess.run(cmd, env=env)

def check_login() -> bool:
    """Check if the user is logged into NotebookLM."""
    res = run_nlm(["login", "--check"])
    if res.returncode == 0 and "Profile" in res.stdout:
        print("✓ Authenticated with NotebookLM.")
        return True
    else:
        print("✗ Not authenticated yet. Please run:")
        print("   python meeting_helper.py login")
        return False

def list_notebooks():
    """List all available notebooks."""
    res = run_nlm(["notebook", "list"])
    print(res.stdout or res.stderr)

def create_meeting_notebook(title: str):
    """Create a new notebook for a meeting."""
    res = run_nlm(["notebook", "create", title])
    print(res.stdout or res.stderr)

def add_meeting_note(notebook_id: str, file_path: str):
    """Upload a meeting note or transcript to a notebook."""
    path = Path(file_path).resolve()
    if not path.exists():
        print(f"Error: File not found at {path}")
        return
    res = run_nlm(["source", "add", notebook_id, str(path)])
    print(res.stdout or res.stderr)

def ask_meeting(notebook_id: str, question: str):
    """Query a notebook (e.g. for action items or key decisions)."""
    res = run_nlm(["notebook", "query", notebook_id, question])
    print(res.stdout or res.stderr)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python meeting_helper.py login                Open browser to sign in")
        print("  python meeting_helper.py check                Check authentication status")
        print("  python meeting_helper.py list                 List all notebooks")
        print("  python meeting_helper.py create <title>       Create a new notebook")
        print("  python meeting_helper.py add <nb_id> <file>   Add a note/transcript to notebook")
        print("  python meeting_helper.py query <nb_id> <q>    Ask questions about the meeting")
        sys.exit(0)

    action = sys.argv[1].lower()
    if action == "login":
        login()
    elif action == "check":
        check_login()
    elif action == "list":
        list_notebooks()
    elif action == "create" and len(sys.argv) > 2:
        create_meeting_notebook(sys.argv[2])
    elif action == "add" and len(sys.argv) > 3:
        add_meeting_note(sys.argv[2], sys.argv[3])
    elif action == "query" and len(sys.argv) > 3:
        ask_meeting(sys.argv[2], sys.argv[3])
    else:
        print(f"Unknown command or missing arguments for '{action}'. Run without arguments for help.")
