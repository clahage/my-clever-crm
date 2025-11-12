#!/bin/bash

echo "Checking for potential filename mismatches in App.jsx..."
echo ""

# Extract all lazy imports from App.jsx
grep "lazy(() => import('@/pages/" src/App.jsx | sed "s/.*import('@\/pages\/\([^']*\)').*/\1/" | while read -r importPath; do
    # Get just the filename without extension
    filename=$(basename "$importPath")
    
    # Check if file exists as .jsx
    if [ ! -f "src/pages/${importPath}.jsx" ]; then
        echo "❌ Missing: src/pages/${importPath}.jsx"
        
        # Try to find similar files
        similar=$(find src/pages -name "${filename}*.jsx" -o -name "*${filename}.jsx" 2>/dev/null | head -3)
        if [ ! -z "$similar" ]; then
            echo "   Found similar: $similar"
        fi
        echo ""
    fi
done
