FROM node:20-slim

# Install system dependencies for Puppeteer and build tools
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    libgconf-2-4 \
    libxrandr2 \
    libasound2 \
    libpangocairo-1.0-0 \
    libatk1.0-0 \
    libcairo-gobject2 \
    libgtk-3-0 \
    libgdk-pixbuf2.0-0 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxi6 \
    libxtst6 \
    libnss3 \
    libcups2 \
    libxrandr2 \
    libasound2 \
    libatk1.0-0 \
    libdrm-common \
    libdrm2 \
    libxss1 \
    libgconf-2-4 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libxss1 \
    libxtst6 \
    libnss3 \
    libxshmfence1 \
    libglu1-mesa \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install Google Chrome instead of Chromium for better compatibility
# Detect architecture and install appropriate browser
RUN ARCH=$(dpkg --print-architecture) && \
    if [ "$ARCH" = "amd64" ]; then \
        wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - && \
        echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list && \
        apt-get update && \
        apt-get install -y google-chrome-stable; \
    else \
        echo "Installing Chromium for non-amd64 architecture ($ARCH)" && \
        apt-get update && \
        apt-get install -y chromium; \
    fi && \
    rm -rf /var/lib/apt/lists/*

# Set Puppeteer to use system-installed Chrome/Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
# The entrypoint script will set PUPPETEER_EXECUTABLE_PATH based on what's available

# Create a user to run Chrome (Chrome doesn't like running as root)
RUN groupadd -r appuser && useradd -r -g appuser -G audio,video appuser \
    && mkdir -p /home/appuser/Downloads \
    && chown -R appuser:appuser /home/appuser

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Clear npm cache and install all dependencies from source
RUN npm cache clean --force && \
    npm ci && \
    npm uninstall better-sqlite3 && \
    npm install better-sqlite3 --build-from-source

# Copy source code
COPY . .

# Ensure Chrome can write to necessary directories
RUN mkdir -p /app/.chrome-data \
    && chown -R appuser:appuser /app \
    && chmod -R 755 /app \
    && chmod +x /app/scripts/debug-chrome.sh \
    && chmod +x /app/scripts/ensure-drizzle-setup.sh

# Create entrypoint script that handles Chrome setup and runs migrations
RUN echo '#!/bin/bash\n\
    set -e\n\
    \n\
    echo "🚀 Starting Watchdog container..."\n\
    \n\
    # Ensure node_modules is properly set up\n\
    if [ ! -d "/app/node_modules" ] || [ ! -f "/app/node_modules/.bin/concurrently" ]; then\n\
    echo "📦 Installing dependencies..."\n\
    npm ci\n\
    npm uninstall better-sqlite3\n\
    npm install better-sqlite3 --build-from-source\n\
    fi\n\
    \n\
    # Set Chrome/Chromium executable path and test it\n\
    echo "🔍 Detecting Chrome/Chromium installation..."\n\
    if [ -f "/usr/bin/google-chrome-stable" ]; then\n\
    export PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable\n\
    echo "✅ Found Google Chrome Stable: $PUPPETEER_EXECUTABLE_PATH"\n\
    elif [ -f "/usr/bin/google-chrome" ]; then\n\
    export PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome\n\
    echo "✅ Found Google Chrome: $PUPPETEER_EXECUTABLE_PATH"\n\
    elif [ -f "/usr/bin/chromium" ]; then\n\
    export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium\n\
    echo "✅ Found Chromium: $PUPPETEER_EXECUTABLE_PATH"\n\
    elif [ -f "/usr/bin/chromium-browser" ]; then\n\
    export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser\n\
    echo "✅ Found Chromium Browser: $PUPPETEER_EXECUTABLE_PATH"\n\
    else\n\
    echo "❌ No Chrome/Chromium found! Available browsers:"\n\
    ls -la /usr/bin/ | grep -E "(chrome|chromium)" || echo "None found"\n\
    exit 1\n\
    fi\n\
    \n\
    # Test Chrome executable with minimal args\n\
    if [ ! -z "$PUPPETEER_EXECUTABLE_PATH" ] && [ -f "$PUPPETEER_EXECUTABLE_PATH" ]; then\n\
    echo "🧪 Testing Chrome executable..."\n\
    timeout 10s $PUPPETEER_EXECUTABLE_PATH --version --no-sandbox --disable-gpu || echo "⚠️  Chrome version test failed but continuing..."\n\
    echo "🧪 Testing Chrome headless launch..."\n\
    timeout 15s $PUPPETEER_EXECUTABLE_PATH --headless --no-sandbox --disable-gpu --dump-dom about:blank > /dev/null 2>&1 && echo "✅ Chrome headless test passed" || echo "⚠️  Chrome headless test failed but continuing..."\n\
    fi\n\
    \n\
    # Set up Chrome data directory with proper permissions\n\
    mkdir -p /app/.chrome-data\n\
    chown -R appuser:appuser /app/.chrome-data\n\
    export CHROME_DEVEL_SANDBOX=/usr/lib/chromium-browser/chrome-sandbox\n\
    \n\
    # Ensure drizzle directory structure exists\n\
    echo "📋 Ensuring drizzle setup..."\n\
    if [ -f "/app/scripts/ensure-drizzle-setup.sh" ]; then\n\
    bash /app/scripts/ensure-drizzle-setup.sh || echo "Drizzle setup script failed, continuing..."\n\
    fi\n\
    \n\
    # Run database migrations on startup\n\
    echo "🗄️  Running database migrations..."\n\
    npm run db:migrate || (echo "Primary migration failed, trying fallback..." && npm run db:migrate-fallback) || echo "All migration attempts failed, continuing anyway..."\n\
    \n\
    # Test Puppeteer before starting the main application\n\
    echo "🧪 Testing Puppeteer setup..."\n\
    timeout 30s npm run test-puppeteer || echo "⚠️  Puppeteer test failed but continuing..."\n\
    \n\
    echo "🎯 Starting main application..."\n\
    exec "$@"' > /entrypoint.sh && chmod +x /entrypoint.sh

# Expose port
EXPOSE 3000

# Set entrypoint
ENTRYPOINT ["/entrypoint.sh"]

# Start the application
CMD ["npm", "run", "dev:full-with-migrations"]
