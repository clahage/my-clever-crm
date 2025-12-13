#!/usr/bin/env python3
"""
Firebase Cloud Functions Gen 1 Diagnostic Tool
Scans all .js files in functions/ directory to find:
1. Functions with cpu: property (Gen 2 only)
2. Functions missing .runWith() configuration
3. Invalid Gen 1 configurations

© 2025 Speedy Credit Repair Inc. | Christopher Lahage
"""

import os
import re
import sys

# ANSI color codes for pretty output
RED = '\033[91m'
GREEN = '\033[92m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
BOLD = '\033[1m'
RESET = '\033[0m'

def scan_file(filepath):
    """Scan a single JavaScript file for Gen 1 issues"""
    issues = []
    
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            lines = content.split('\n')
        
        # Check for cpu: property
        for i, line in enumerate(lines, 1):
            if re.search(r'\bcpu\s*:', line):
                issues.append({
                    'type': 'CPU_PROPERTY',
                    'line': i,
                    'code': line.strip()
                })
        
        # Find all exports
        export_pattern = r'^exports\.(\w+)\s*=\s*'
        for i, line in enumerate(lines, 1):
            match = re.match(export_pattern, line)
            if match:
                func_name = match.group(1)
                
                # Check if it's a Cloud Function (has 'functions.')
                if 'functions.' in line:
                    # Check if it has .runWith()
                    if '.runWith(' not in line:
                        # Look ahead a few lines to see if .runWith() is on next line
                        has_runwith = False
                        for j in range(i, min(i + 5, len(lines))):
                            if '.runWith(' in lines[j]:
                                has_runwith = True
                                break
                        
                        if not has_runwith:
                            issues.append({
                                'type': 'MISSING_RUNWITH',
                                'line': i,
                                'function': func_name,
                                'code': line.strip()
                            })
        
        return issues
    
    except Exception as e:
        return [{'type': 'ERROR', 'message': str(e)}]

def scan_directory(directory):
    """Scan all .js files in directory"""
    results = {}
    
    for root, dirs, files in os.walk(directory):
        # Skip node_modules
        if 'node_modules' in root:
            continue
        
        for file in files:
            if file.endswith('.js'):
                filepath = os.path.join(root, file)
                relative_path = os.path.relpath(filepath, directory)
                
                issues = scan_file(filepath)
                if issues:
                    results[relative_path] = issues
    
    return results

def print_results(results):
    """Print scan results with color coding"""
    
    if not results:
        print(f"\n{GREEN}{BOLD}✅ ALL FILES ARE GEN 1 COMPLIANT!{RESET}")
        print(f"{GREEN}No cpu: properties found{RESET}")
        print(f"{GREEN}All Cloud Functions have .runWith(){RESET}\n")
        return
    
    print(f"\n{RED}{BOLD}⚠️  FOUND {len(results)} FILES WITH ISSUES{RESET}\n")
    print("=" * 80)
    
    for filepath, issues in results.items():
        print(f"\n{BOLD}{BLUE}📄 {filepath}{RESET}")
        print("-" * 80)
        
        cpu_issues = [i for i in issues if i['type'] == 'CPU_PROPERTY']
        missing_issues = [i for i in issues if i['type'] == 'MISSING_RUNWITH']
        
        if cpu_issues:
            print(f"\n{RED}❌ CPU PROPERTIES FOUND (Gen 2 only - REMOVE THESE):{RESET}")
            for issue in cpu_issues:
                print(f"   Line {issue['line']}: {issue['code']}")
        
        if missing_issues:
            print(f"\n{YELLOW}⚠️  MISSING .runWith() CONFIGURATION:{RESET}")
            for issue in missing_issues:
                print(f"   Line {issue['line']}: {issue['function']}")
                print(f"   Code: {issue['code']}")
        
        print()
    
    print("=" * 80)
    print(f"\n{BOLD}SUMMARY:{RESET}")
    
    total_cpu = sum(len([i for i in issues if i['type'] == 'CPU_PROPERTY']) for issues in results.values())
    total_missing = sum(len([i for i in issues if i['type'] == 'MISSING_RUNWITH']) for issues in results.values())
    
    if total_cpu > 0:
        print(f"  {RED}• {total_cpu} function(s) with cpu: property{RESET}")
    if total_missing > 0:
        print(f"  {YELLOW}• {total_missing} function(s) missing .runWith(){RESET}")
    
    print(f"\n{BOLD}NEXT STEPS:{RESET}")
    print("  1. Fix the files listed above")
    print("  2. Remove any 'cpu:' properties from .runWith()")
    print("  3. Add .runWith({ memory: '512MB', timeoutSeconds: 60 }) to missing functions")
    print("  4. Run: npx firebase-tools@11.30.0 deploy --only functions")
    print()

if __name__ == '__main__':
    # Default to current directory or take argument
    functions_dir = sys.argv[1] if len(sys.argv) > 1 else '.'
    
    print(f"\n{BOLD}🔍 Firebase Cloud Functions Gen 1 Diagnostic Tool{RESET}")
    print(f"Scanning directory: {functions_dir}")
    print("=" * 80)
    
    results = scan_directory(functions_dir)
    print_results(results)