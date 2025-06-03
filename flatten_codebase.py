#!/usr/bin/env python3
import os
import glob
import pathspec
from pathlib import Path

def get_gitignore_spec(base_dir):
    """Create a pathspec from .gitignore file if it exists."""
    gitignore_path = os.path.join(base_dir, '.gitignore')
    spec = None
    if os.path.exists(gitignore_path):
        with open(gitignore_path, 'r') as f:
            gitignore_content = f.read()
        spec = pathspec.PathSpec.from_lines('gitwildmatch', gitignore_content.splitlines())
    return spec

def should_include_file(file_path, gitignore_spec=None, base_dir=None):
    """Determine if a file should be included in the flattened output."""
    # Check if the file is ignored by .gitignore
    if gitignore_spec and base_dir:
        rel_path = os.path.relpath(file_path, base_dir)
        if gitignore_spec.match_file(rel_path):
            return False
    
    # Skip package files, node_modules, etc.
    excluded_patterns = [
        'node_modules',
        'package.json',
        'package-lock.json',
        'yarn.lock',
        'pnpm-lock.yaml',
        '.git',
        '.github',
        '.vscode',
        '.idea',
        'dist',
        'build',
        '.DS_Store',
        '__pycache__',
        '*.pyc',
        '*.log',
        '.env',
        'backup',
        'lib',
        'out',
        'target/',        # Rust build output
        'flattened.md',   # Don't include output files
        'flattened-contracts.md',
        'flattened-frontend.md',
        'flattened_code.md',
        'flatten_codebase.py',  # Don't include this script
        '.next/',         # Next.js build output
        'next-env.d.ts',  # Next.js TypeScript declarations
        'next.config.js', # Next.js configuration
        'tsconfig.json',  # TypeScript configuration
        'vercel.json',    # Vercel deployment configuration
        'public/manifest.json', # Web app manifest
        '.eslintrc',      # ESLint configuration
        '.prettierrc',    # Prettier configuration
        'postcss.config.js', # PostCSS configuration
        'tailwind.config.js', # Tailwind configuration
        'cache/',         # Cache directories
        '.turbo/'         # Turborepo cache
    ]
    
    for pattern in excluded_patterns:
        if pattern in file_path:
            return False
    
    # Include only specific file types
    included_extensions = [
        '.ts', '.js', '.tsx', '.jsx', '.json', '.md', '.rs', '.sol', '.toml',
        '.yml', '.yaml', '.conf', '.sh', '.py', '.Dockerfile'
    ]
    
    _, ext = os.path.splitext(file_path)
    return ext in included_extensions

def get_relative_path(file_path, base_dir):
    """Get the path relative to the base directory."""
    return os.path.relpath(file_path, base_dir)

def flatten_codebase(base_dir, output_file, dirs_to_include=None, title="Flattened Codebase"):
    """Flatten the codebase into a single markdown file.
    
    Args:
        base_dir: The base directory of the codebase
        output_file: The output markdown file path
        dirs_to_include: List of directories to include (relative to base_dir)
        title: Title for the markdown file
    """
    # Get gitignore spec
    gitignore_spec = get_gitignore_spec(base_dir)
    
    # Files to always include if they exist
    important_files = [
        os.path.join(base_dir, 'README.md'),
        os.path.join(base_dir, 'backend-architecture.md')
    ]
    
    # Convert relative dirs to absolute paths
    dirs_to_search = []
    if dirs_to_include:
        for dir_rel in dirs_to_include:
            dir_path = os.path.join(base_dir, dir_rel)
            if os.path.exists(dir_path):
                dirs_to_search.append(dir_path)
    
    all_files = []
    
    # Add important files
    for file_path in important_files:
        if os.path.exists(file_path) and should_include_file(file_path, gitignore_spec, base_dir):
            # Only include important files if they're in one of the directories we're including
            include_file = False
            if not dirs_to_include:  # If no specific dirs, include all important files
                include_file = True
            else:
                # Check if the file is in one of our included directories
                rel_path = get_relative_path(file_path, base_dir)
                for dir_rel in dirs_to_include:
                    if rel_path.startswith(dir_rel):
                        include_file = True
                        break
            
            if include_file:
                all_files.append(file_path)
    
    # Find all files in the specified directories
    for dir_path in dirs_to_search:
        if os.path.exists(dir_path):
            for root, _, files in os.walk(dir_path):
                for file in files:
                    file_path = os.path.join(root, file)
                    if should_include_file(file_path, gitignore_spec, base_dir):
                        all_files.append(file_path)
    
    # Sort files to ensure consistent output
    all_files.sort()
    
    # Write to output file
    with open(output_file, 'w') as out_file:
        out_file.write(f"# {title}\n\n")
        
        for file_path in all_files:
            rel_path = get_relative_path(file_path, base_dir)
            out_file.write(f"## {rel_path}\n\n```{get_file_extension(file_path)}\n")
            
            try:
                with open(file_path, 'r') as in_file:
                    content = in_file.read()
                    out_file.write(content)
            except Exception as e:
                out_file.write(f"Error reading file: {str(e)}")
            
            out_file.write("\n```\n\n")
            out_file.write(f"End of {rel_path}\n\n")
            out_file.write("---\n\n")

def get_file_extension(file_path):
    """Get the file extension for markdown code block."""
    _, ext = os.path.splitext(file_path)
    ext = ext.lstrip('.')
    
    # Map extensions to markdown code block language identifiers
    extension_map = {
        'ts': 'typescript',
        'js': 'javascript',
        'tsx': 'typescript',
        'jsx': 'javascript',
        'json': 'json',
        'md': 'markdown',
        'rs': 'rust',
        'sol': 'solidity',
        'toml': 'toml',
        'yml': 'yaml',
        'yaml': 'yaml',
        'conf': 'conf',
        'sh': 'bash',
        'py': 'python',
        'Dockerfile': 'dockerfile'
    }
    
    return extension_map.get(ext, '')

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Create flattened-api.md with API backend code
    output_file1 = os.path.join(base_dir, 'flattened-api.md')
    api_dirs = [
        'packages/api'
    ]
    flatten_codebase(
        base_dir, 
        output_file1, 
        dirs_to_include=api_dirs,
        title="Flattened API Backend Codebase"
    )
    print(f"API backend flattened to {output_file1}")
    
    # Create flattened-frontend.md with Next.js frontend code
    output_file2 = os.path.join(base_dir, 'flattened-frontend.md')
    frontend_dirs = [
        'packages/app'
    ]
    flatten_codebase(
        base_dir, 
        output_file2, 
        dirs_to_include=frontend_dirs,
        title="Flattened Frontend Codebase"
    )
    print(f"Frontend codebase flattened to {output_file2}")

    # Create flattened.md with all code (both API and frontend)
    output_file3 = os.path.join(base_dir, 'flattened.md')
    all_dirs = [
        'packages/api',
        'packages/app'
    ]
    flatten_codebase(
        base_dir,
        output_file3,
        dirs_to_include=all_dirs,
        title="Flattened Complete Codebase"
    )
    print(f"Complete codebase flattened to {output_file3}")
