#!/bin/sh

detect_os() {
  case "$(uname -s)" in
    MINGW*|MSYS*|CYGWIN*) echo windows ;;
    Darwin)               echo macos ;;
    *)                    echo linux ;;
  esac
}

ensure_package_manager_windows() {
  if command -v winget >/dev/null 2>&1; then
    echo "winget already present."
    return 0
  fi
  echo "winget not found. It is the Windows package manager, shipped with 'App Installer'."
  echo "Opening the Microsoft Store so you can install it..."
  # 9NBLGGH4NNS1 is the Store product id for App Installer.
  powershell.exe -NoProfile -Command "Start-Process 'ms-windows-store://pdp/?ProductId=9NBLGGH4NNS1'"
  printf "Press Enter here once App Installer has finished installing... "
  read _
  if ! command -v winget >/dev/null 2>&1; then
    echo "winget still not on PATH. Reopen your terminal and re-run this script."
    return 1
  fi
  echo "winget is now available."
}

ensure_package_manager_macos() {
  if command -v brew >/dev/null 2>&1; then
    echo "Homebrew already present."
    return 0
  fi
  echo "Homebrew not found. It is the macOS package manager."
  echo "Launching its official installer (it will prompt for your password)..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" || return 1
  # Apple Silicon installs to /opt/homebrew, which is not on PATH until shellenv is loaded.
  if [ -x /opt/homebrew/bin/brew ]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
  fi
  if ! command -v brew >/dev/null 2>&1; then
    echo "Homebrew installed but not on PATH. Load it, then re-run this script:"
    echo '  eval "$(/opt/homebrew/bin/brew shellenv)"   # Apple Silicon'
    echo '  eval "$(/usr/local/bin/brew shellenv)"      # Intel'
    return 1
  fi
  echo "Homebrew is now available."
}

detect_linux_package_manager() {
  for pm in apt-get dnf pacman zypper apk; do
    if command -v "$pm" >/dev/null 2>&1; then
      pkg_manager="$pm"
      echo "Using $pm as the package manager."
      return 0
    fi
  done
  echo "No supported package manager found (need one of: apt-get dnf pacman zypper apk)."
  return 1
}

linux_install() {
  case "$pkg_manager" in
    apt-get) sudo apt-get update && sudo apt-get install -y "$@" ;;
    dnf)     sudo dnf install -y "$@" ;;
    pacman)  sudo pacman -S --noconfirm "$@" ;;
    zypper)  sudo zypper install -y "$@" ;;
    apk)     sudo apk add "$@" ;;
  esac
}

ensure_package_manager() {
  case "$os" in
    windows) ensure_package_manager_windows ;;
    macos)   ensure_package_manager_macos ;;
    linux)   detect_linux_package_manager ;;
  esac
}

install_version_manager() {
  case "$os" in
    windows)
      winget install --exact --id CoreyButler.NVMforWindows \
        --accept-source-agreements --accept-package-agreements
      ;;
    macos)
      brew install fnm
      ;;
    linux)
      curl -fsSL https://fnm.vercel.app/install | bash || return 1
      export PATH="$HOME/.local/share/fnm:$PATH"
      ;;
  esac
}

version_manager_command() {
  case "$os" in
    windows) echo nvm ;;
    *)       echo fnm ;;
  esac
}

use_node_version() {
  version="$1"
  case "$os" in
    windows) nvm install "$version" && nvm use "$version" ;;
    *)       fnm install "$version" && fnm default "$version" ;;
  esac
}

ensure_node() {
  version=$(tr -d '[:space:]' < .node-version)
  if [ "$(node -v 2>/dev/null)" = "v$version" ]; then
    echo "Node $version already active."
    return 0
  fi
  manager=$(version_manager_command)
  if ! command -v "$manager" >/dev/null 2>&1; then
    echo "$manager not found. Installing for $os..."
    install_version_manager || return 1
    if ! command -v "$manager" >/dev/null 2>&1; then
      echo "$manager installed but not on PATH. Reopen your terminal and re-run this script."
      return 1
    fi
  fi
  use_node_version "$version" || return 1
  if [ "$(node -v 2>/dev/null)" != "v$version" ]; then
    echo "Node $version installed but not active. Reopen your terminal and re-run this script."
    return 1
  fi
}

install_dependencies() {
  npm install && npm --prefix tools install
}

ensure_env_file() {
  if [ -f .env ]; then
    return 0
  fi
  cp .env.example .env
  echo "Created .env. Set ITCH_ACCESS_CODE (URL-encoded) in it before running the dev server."
}

# Execution
cd "$(dirname "$0")/.." || exit 1
os=$(detect_os)
ensure_package_manager || exit 1
ensure_node || exit 1
install_dependencies || exit 1
ensure_env_file
