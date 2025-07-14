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
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Set Puppeteer to use system-installed Chrome
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

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

# Create entrypoint script that handles cross-platform Chromium paths and runs migrations
RUN echo '#!/bin/bash\n\
    # Ensure node_modules is properly set up\n\
    if [ ! -d "/app/node_modules" ] || [ ! -f "/app/node_modules/.bin/concurrently" ]; then\n\
    echo "Installing dependencies..."\n\
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
    fi\n\
    \n\
    # Test Chrome executable\n\
    if [ ! -z "$PUPPETEER_EXECUTABLE_PATH" ] && [ -f "$PUPPETEER_EXECUTABLE_PATH" ]; then\n\
    echo "🧪 Testing Chrome executable..."\n\
    $PUPPETEER_EXECUTABLE_PATH --version || echo "⚠️  Chrome test failed but continuing..."\n\
    fi\n\
    \n\
    # Ensure drizzle directory structure exists\n\
    echo "Ensuring drizzle setup..."\n\
    bash /app/scripts/ensure-drizzle-setup.sh || echo "Drizzle setup script failed, continuing..."\n\
    \n\
    # Run database migrations on startup\n\
    echo "Running database migrations..."\n\
    npm run db:migrate || (echo "Primary migration failed, trying fallback..." && npm run db:migrate-fallback) || echo "All migration attempts failed, continuing anyway..."\n\
    \n\
    exec "$@"' > /entrypoint.sh && chmod +x /entrypoint.sh

# Expose port
EXPOSE 3000

# Set entrypoint
ENTRYPOINT ["/entrypoint.sh"]

# Start the application
CMD ["npm", "run", "dev:full-with-migrations"]
