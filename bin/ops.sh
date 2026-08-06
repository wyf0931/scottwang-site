#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNTIME_DIR="$ROOT_DIR/.runtime"
PID_FILE="$RUNTIME_DIR/blog.pid"
LOG_FILE="$RUNTIME_DIR/blog.log"
PORT="${PORT:-3000}"

mkdir -p "$RUNTIME_DIR"

read_pid() {
  [[ -f "$PID_FILE" ]] && tr -d '[:space:]' < "$PID_FILE"
}

is_running() {
  local pid
  pid="$(read_pid || true)"
  [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null
}

start() {
  if is_running; then
    echo "ScottWang site is already running (PID $(read_pid)) at http://localhost:$PORT"
    return 0
  fi

  rm -f "$PID_FILE"
  echo "Starting ScottWang site on http://localhost:$PORT ..."
  (cd "$ROOT_DIR" && nohup npm run dev -- --hostname 0.0.0.0 --port "$PORT" >> "$LOG_FILE" 2>&1 & echo $! > "$PID_FILE")
  sleep 1
  if is_running; then
    echo "Started (PID $(read_pid)). Logs: $LOG_FILE"
  else
    echo "Failed to start. Last log output:"
    tail -20 "$LOG_FILE" 2>/dev/null || true
    rm -f "$PID_FILE"
    return 1
  fi
}

stop() {
  if ! is_running; then
    rm -f "$PID_FILE"
    echo "ScottWang site is not running."
    return 0
  fi

  local pid
  pid="$(read_pid)"
  echo "Stopping ScottWang site (PID $pid) ..."
  kill "$pid" 2>/dev/null || true
  for _ in {1..20}; do
    is_running || break
    sleep 0.25
  done
  if is_running; then
    echo "Process did not stop cleanly; send SIGKILL manually if needed: kill -9 $pid"
    return 1
  fi
  rm -f "$PID_FILE"
  echo "Stopped."
}

status() {
  if is_running; then
    echo "running (PID $(read_pid))"
    echo "url: http://localhost:$PORT"
    echo "log: $LOG_FILE"
  else
    echo "stopped"
    [[ -f "$LOG_FILE" ]] && echo "last log: $LOG_FILE"
    return 1
  fi
}

deploy() {
  local commit_message="${*:-chore: publish site updates}"
  local current_branch
  current_branch="$(cd "$ROOT_DIR" && git branch --show-current)"

  if [[ -z "$current_branch" ]]; then
    echo "Cannot deploy from a detached HEAD."
    return 1
  fi

  echo "Running release checks..."
  (cd "$ROOT_DIR" && npm run lint && npm run typecheck && npm test && npm run build)

  if [[ -n "$(cd "$ROOT_DIR" && git status --porcelain)" ]]; then
    echo "Committing local changes..."
    (cd "$ROOT_DIR" && git add -A && git commit -m "$commit_message")
  else
    echo "No local changes to commit."
  fi

  echo "Pushing $current_branch..."
  (cd "$ROOT_DIR" && git push origin "$current_branch")

  if [[ "$current_branch" == "main" ]]; then
    echo "Changes are on main. GitHub Actions will deploy production."
    return 0
  fi

  echo "Merging $current_branch into main..."
  (cd "$ROOT_DIR" && git switch main && git pull origin main && git merge --no-ff "$current_branch" -m "merge: $commit_message" && git push origin main && git switch "$current_branch")
  echo "Pushed main. GitHub Actions will deploy production."
}

import_obsidian() {
  (cd "$ROOT_DIR" && node scripts/import-obsidian.mjs "$@")
}

usage() {
  echo "Usage: ./bin/ops.sh {start|stop|restart|status|deploy [commit-message]|import-obsidian <vault-or-folder> [options]}"
}

case "${1:-}" in
  start) start ;;
  stop) stop ;;
  restart) stop || true; start ;;
  status) status ;;
  deploy) shift; deploy "$@" ;;
  import-obsidian) shift; import_obsidian "$@" ;;
  *) usage; exit 2 ;;
esac
