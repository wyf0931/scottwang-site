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
  if [[ -z "${VERCEL_TOKEN:-}" ]]; then
    echo "VERCEL_TOKEN is required. Create a token in Vercel and export it before deploy."
    return 1
  fi

  echo "Running release checks..."
  (cd "$ROOT_DIR" && npm run lint && npm run typecheck && npm test && npm run build)
  echo "Deploying to Vercel production..."
  local scope_args=()
  [[ -n "${VERCEL_SCOPE:-}" ]] && scope_args+=(--scope "$VERCEL_SCOPE")
  (cd "$ROOT_DIR" && npx vercel --prod --yes --token "$VERCEL_TOKEN" "${scope_args[@]}")
}

usage() {
  echo "Usage: ./bin/ops.sh {start|stop|restart|status|deploy}"
}

case "${1:-}" in
  start) start ;;
  stop) stop ;;
  restart) stop || true; start ;;
  status) status ;;
  deploy) deploy ;;
  *) usage; exit 2 ;;
esac
