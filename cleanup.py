#!/usr/bin/env python3
"""
Cleanup script for BCU AMS Project
Removes unnecessary files and directories to clean up the codebase
"""

import os
import shutil
from pathlib import Path

# Define the project root
PROJECT_ROOT = Path(__file__).parent

# Files and directories to remove
FILES_TO_REMOVE = [
    'AMS_Architecture.tex',
    'WEBSOCKET_FIX_SUMMARY.md',
    'TROUBLESHOOTING_GUIDE.md',
    'Special_Notes.md',
]

DIRECTORIES_TO_REMOVE = [
    'auth_app/migrations/0002_auto_*.py',  # Keep only initial migration
    'teacher_app/migrations/0002_auto_*.py',  # Keep only initial migration
]

TEST_FILES_TO_REMOVE = [
    'auth_app/tests.py',
    'teacher_app/tests.py',
    'Face_Rec/test.py',
]

def remove_file(filepath):
    """Safely remove a file"""
    full_path = PROJECT_ROOT / filepath
    if full_path.exists():
        try:
            full_path.unlink()
            print(f"✓ Deleted: {filepath}")
            return True
        except Exception as e:
            print(f"✗ Failed to delete {filepath}: {e}")
            return False
    return False

def remove_directory(dirpath):
    """Safely remove a directory"""
    full_path = PROJECT_ROOT / dirpath
    if full_path.exists():
        try:
            shutil.rmtree(full_path)
            print(f"✓ Deleted directory: {dirpath}")
            return True
        except Exception as e:
            print(f"✗ Failed to delete {dirpath}: {e}")
            return False
    return False

def main():
    print("=" * 60)
    print("BCU AMS Project Cleanup")
    print("=" * 60)
    print()
    
    total_deleted = 0
    
    print("Removing unnecessary files...")
    print("-" * 60)
    
    # Remove documentation files
    print("\n📄 Documentation files:")
    for filepath in FILES_TO_REMOVE:
        if remove_file(filepath):
            total_deleted += 1
    
    # Remove test files
    print("\n🧪 Test files:")
    for filepath in TEST_FILES_TO_REMOVE:
        if remove_file(filepath):
            total_deleted += 1
    
    # Clean __pycache__ directories
    print("\n🗑️ Cache directories (__pycache__):")
    for pycache_dir in PROJECT_ROOT.rglob('__pycache__'):
        try:
            shutil.rmtree(pycache_dir)
            print(f"✓ Deleted: {pycache_dir.relative_to(PROJECT_ROOT)}")
            total_deleted += 1
        except Exception as e:
            print(f"✗ Failed to delete {pycache_dir}: {e}")
    
    # Remove .pyc files
    print("\n📝 Compiled Python files (.pyc):")
    for pyc_file in PROJECT_ROOT.rglob('*.pyc'):
        try:
            pyc_file.unlink()
            print(f"✓ Deleted: {pyc_file.relative_to(PROJECT_ROOT)}")
            total_deleted += 1
        except Exception as e:
            print(f"✗ Failed to delete {pyc_file}: {e}")
    
    print()
    print("=" * 60)
    print(f"Cleanup complete! Removed {total_deleted} items")
    print("=" * 60)
    print()
    print("See CLEANUP_PLAN.md for details on what was kept and removed")

if __name__ == '__main__':
    main()
