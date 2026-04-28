#!/bin/bash
set -e

export DISPLAY=:99

echo "[GUI] Cleaning old X lock files..."
rm -rf /tmp/.X99-lock /tmp/.X11-unix/X99 || true

echo "[GUI] Starting Xvfb on :99..."
Xvfb :99 -screen 0 1280x720x24 &
sleep 2

echo "[GUI] Starting x11vnc on 5900..."
x11vnc -display :99 -forever -nopw -shared -rfbport 5900 &
sleep 2

echo "[GUI] Locating noVNC..."
if [ -x /usr/share/novnc/utils/novnc_proxy ]; then
  NOVNC_PROXY=/usr/share/novnc/utils/novnc_proxy
elif [ -x /usr/share/novnc/utils/launch.sh ]; then
  NOVNC_PROXY=/usr/share/novnc/utils/launch.sh
elif [ -x /opt/novnc/utils/novnc_proxy ]; then
  NOVNC_PROXY=/opt/novnc/utils/novnc_proxy
else
  echo "[GUI] noVNC launcher not found"
  find / -name "novnc_proxy" 2>/dev/null || true
  find / -name "launch.sh" 2>/dev/null || true
  exit 1
fi

echo "[GUI] Using noVNC launcher: $NOVNC_PROXY"
"$NOVNC_PROXY" --vnc localhost:5900 --listen 6080 &
sleep 3

echo "[GUI] Checking ports..."
which netstat >/dev/null 2>&1 && netstat -tlnp || true
which ss >/dev/null 2>&1 && ss -tlnp || true

echo "[GUI] Checking mounted code..."
ls -la /app
ls -la /app/usercode

cd /app/usercode

echo "[GUI] Compiling Main.java..."
javac Main.java

echo "[GUI] Running Java GUI application..."
java Main &
JAVA_PID=$!

echo "[GUI] Java GUI started with PID $JAVA_PID"

wait $JAVA_PID || true
echo "[GUI] Java app exited. Keeping container alive for inspection..."
tail -f /dev/null