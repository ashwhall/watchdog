#!/bin/bash

# Script to ensure proper drizzle setup in container environments

echo "🔧 Ensuring drizzle directory structure..."

# Create drizzle directory if it doesn't exist
if [ ! -d "drizzle" ]; then
    echo "📁 Creating drizzle directory..."
    mkdir -p drizzle/meta
fi

# Create meta directory if it doesn't exist
if [ ! -d "drizzle/meta" ]; then
    echo "📁 Creating drizzle/meta directory..."
    mkdir -p drizzle/meta
fi

# Check if migration files exist
if [ ! -f "drizzle/0000_thankful_lester.sql" ] || [ ! -f "drizzle/0001_lowly_golden_guardian.sql" ]; then
    echo "⚠️  Migration SQL files are missing. This might cause issues."
    echo "   Make sure the drizzle directory is properly copied to the container."
fi

# Check if journal file exists, create it if missing
if [ ! -f "drizzle/meta/_journal.json" ]; then
    echo "📝 Creating missing _journal.json file..."
    cat >drizzle/meta/_journal.json <<'EOF'
{
  "version": "7",
  "dialect": "sqlite",
  "entries": [
    {
      "idx": 0,
      "version": "6",
      "when": 1752363678347,
      "tag": "0000_thankful_lester",
      "breakpoints": true
    },
    {
      "idx": 1,
      "version": "6",
      "when": 1752364898103,
      "tag": "0001_lowly_golden_guardian",
      "breakpoints": true
    }
  ]
}
EOF
    echo "✅ Journal file created successfully!"
fi

# List the contents to verify
echo "📋 Current drizzle directory structure:"
ls -la drizzle/
if [ -d "drizzle/meta" ]; then
    echo "📋 Meta directory contents:"
    ls -la drizzle/meta/
fi

echo "✅ Drizzle setup verification complete!"
