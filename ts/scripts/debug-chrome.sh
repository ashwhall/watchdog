#!/bin/bash

echo "🔍 Chrome/Puppeteer Debug Information"
echo "======================================"

echo ""
echo "📍 Environment Variables:"
echo "  NODE_VERSION: $NODE_VERSION"
echo "  PUPPETEER_EXECUTABLE_PATH: $PUPPETEER_EXECUTABLE_PATH"
echo "  CHROME_BIN: $CHROME_BIN"
echo "  PWD: $PWD"
echo "  USER: $USER"
echo "  UID: $(id -u)"
echo "  GID: $(id -g)"

echo ""
echo "📁 Chrome/Chromium Files:"
ls -la /usr/bin/ | grep -E "(chrome|chromium)" || echo "  No Chrome/Chromium found in /usr/bin/"

echo ""
echo "🧪 Chrome Version Test:"
if [ ! -z "$PUPPETEER_EXECUTABLE_PATH" ] && [ -f "$PUPPETEER_EXECUTABLE_PATH" ]; then
    echo "  Testing: $PUPPETEER_EXECUTABLE_PATH --version"
    timeout 10s $PUPPETEER_EXECUTABLE_PATH --version --no-sandbox --disable-gpu || echo "  Version test failed"
else
    echo "  No executable path set or file not found"
fi

echo ""
echo "🧪 Chrome Basic Launch Test:"
if [ ! -z "$PUPPETEER_EXECUTABLE_PATH" ] && [ -f "$PUPPETEER_EXECUTABLE_PATH" ]; then
    echo "  Testing basic Chrome launch..."
    timeout 15s $PUPPETEER_EXECUTABLE_PATH \
        --headless \
        --no-sandbox \
        --disable-setuid-sandbox \
        --disable-dev-shm-usage \
        --disable-gpu \
        --no-first-run \
        --dump-dom about:blank >/tmp/chrome-test.html 2>/tmp/chrome-test.err

    if [ $? -eq 0 ]; then
        echo "  ✅ Chrome launch test PASSED"
        echo "  Output size: $(wc -c </tmp/chrome-test.html) bytes"
    else
        echo "  ❌ Chrome launch test FAILED"
        echo "  Error output:"
        cat /tmp/chrome-test.err | head -20
    fi

    # Clean up
    rm -f /tmp/chrome-test.html /tmp/chrome-test.err
else
    echo "  No executable path set or file not found"
fi

echo ""
echo "📁 Directory Permissions:"
echo "  /app permissions: $(ls -ld /app 2>/dev/null || echo 'not found')"
echo "  /app/.chrome-data permissions: $(ls -ld /app/.chrome-data 2>/dev/null || echo 'not found')"

echo ""
echo "🔧 Process Information:"
echo "  Running processes with 'chrome' in name:"
ps aux | grep chrome | grep -v grep || echo "  No Chrome processes running"

echo ""
echo "🌐 Network Information:"
echo "  Listening ports:"
netstat -tlnp 2>/dev/null | grep ":92" || echo "  No ports in 92xx range listening"

echo ""
echo "💾 Memory and Storage:"
echo "  Memory usage:"
free -h
echo "  Disk usage:"
df -h /app /tmp

echo ""
echo "======================================"
echo "🔍 Debug information collection complete"
