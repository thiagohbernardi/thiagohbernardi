"""
This script searches for .docx files in a specified directory or across
the user's home directory by default.

Usage:
  python find_docx.py [directory_path]

If [directory_path] is not provided, the script will search your home directory.
It will print the full path of each .docx file found.
It also includes error handling for permission issues and non-existent directories.
"""
# This is a new Python file named find_docx.py
# It is located in the root of the repository.

def find_docx_files(directory):
  """
  This function finds all .docx files in a given directory.

  Args:
    directory: The directory to search.

  Returns:
    A list of .docx files found in the directory.
  """
  import os
  import sys # Import sys for sys.exit
  docx_files = []
  # Prevent potential infinite loop by not searching '.' if it's the home dir
  # and the user didn't explicitly provide it.
  # This is a basic safeguard; a more robust solution might involve checking
  # if the path is truly the intended root for search or using depth limits.
  if directory == os.path.expanduser('~') and directory == ".":
      print("Defaulting to home directory, but it resolves to current directory '.'")
      print("Please specify a directory if you want to search somewhere else.")
      # Or, choose a different default behavior, like not searching at all
      # or searching a specific known-safe subdirectory of home.
      # For now, let's just return an empty list to avoid unexpected behavior.
      return []

  try:
    for root, dirs, files in os.walk(directory, onerror=lambda err: print(f"Warning: Permission denied accessing {err.filename}. Skipping directory.")):
      for file in files:
        if file.endswith(".docx"):
          docx_files.append(os.path.join(root, file))
  except Exception as e: # Catching a broader exception initially for os.walk issues beyond just PermissionError on iteration
      print(f"Warning: An error occurred while walking the directory {directory}: {e}. Some files may not be found.")
      # Depending on the severity, you might want to re-raise or handle more specifically
  return docx_files

import argparse # Import argparse
import os # ensure os is imported for isdir
import sys # ensure sys is imported for exit

if __name__ == "__main__":
  parser = argparse.ArgumentParser(description="Find .docx files in a directory.")
  parser.add_argument(
      "directory",
      nargs="?",  # Makes the argument optional
      default=os.path.expanduser('~'),  # Default to home directory
      help="The directory to search for .docx files. Defaults to your home directory if not specified."
  )
  args = parser.parse_args()

  directory_to_search = args.directory

  if not os.path.isdir(directory_to_search):
    print(f"Error: The specified path '{directory_to_search}' is not a directory or does not exist.")
    sys.exit(1)

  print(f"Searching for .docx files in: {directory_to_search}")

  try:
    found_docx_files = find_docx_files(directory_to_search)
    if found_docx_files:
      print("Found .docx files:")
      for file_path in found_docx_files:
        print(file_path)
    else:
      print("No .docx files found in the specified directory.")
  except FileNotFoundError:
    # This specific block might be less likely to be hit for the top-level directory
    # due to the os.path.isdir check above, but good for robustness if find_docx_files
    # were to be called from elsewhere or if symlinks are involved.
    print(f"Error: The directory '{directory_to_search}' was not found.")
    sys.exit(1)
  except Exception as e: # Catch any other unexpected errors during the process
    print(f"An unexpected error occurred: {e}")
    sys.exit(1)
