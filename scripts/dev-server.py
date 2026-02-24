#!/usr/bin/env python3
"""
Development server for userscripts.

Serves modified scripts with [DEV] prefix for local testing across devices
in your WLAN before pushing to GitHub.

USAGE:
    python3 dev-server.py

    Then open http://<your-local-ip>:8080 on any device in your network
    to see available scripts and install them in your userscript manager.

FEATURES:
    - Adds [DEV] prefix to script names (coexists with production scripts)
    - Modifies @namespace to distinguish from production
    - Uses milliseconds since epoch as @version (always increases, survives restarts)
    - CORS enabled for userscript manager update checks
    - Auto-discovers test pages (files ending with -helper.html are hidden)
    - Graceful shutdown on Ctrl+C (SIGINT) or SIGTERM

REQUIREMENTS:
    Python 3.7+ (standard library only, no external dependencies)
"""


# ==================================================================================================
# Imports
# ==================================================================================================

import http.server
import os
import re
import socket
import signal
import threading
import time


# ==================================================================================================
# Constants
# ==================================================================================================

PORT = 8080
DEV_PREFIX = "[DEV] "
DEV_NAMESPACE_SUFFIX = "/dev"

SCRIPTS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src")
TEST_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "test")


# ==================================================================================================
# Functions
# ==================================================================================================

def get_local_ip():
    """Get local IP address for serving to other devices in WLAN."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("10.255.255.255", 1))
        ip = s.getsockname()[0]
    except Exception:
        ip = "127.0.0.1"
    finally:
        s.close()
    return ip


# Cache the local IP
LOCAL_IP = get_local_ip()


def get_scripts():
    """Get sorted list of userscript filenames."""
    return sorted(f for f in os.listdir(SCRIPTS_DIR) if f.endswith(".user.js"))


# Helper pages are served but not listed on homepage (filename ends with -helper.html)
# They are still accessible via direct URL when needed for tests
def get_test_pages():
    """Get sorted list of test page filenames, excluding helper files."""
    try:
        files = os.listdir(TEST_DIR)
        # Filter: .html files that don't end with -helper.html
        return sorted(f for f in files if f.endswith(".html") and not f.endswith("-helper.html"))
    except Exception:
        return []


def process_script(filepath):
    """Process userscript: add DEV prefix, modify namespace, update version.
    
    Args:
        filepath: Path to the userscript file.
    
    Returns:
        tuple: (processed_content, version_string)
    """
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Generate version from milliseconds since epoch (always increases, survives restarts)
    version = str(int(time.time() * 1000))

    # Add DEV prefix to @name
    content = re.sub(
        r"(//\s*@name\s+)(.+)",
        lambda m: f"{m.group(1)}{DEV_PREFIX}{m.group(2)}",
        content,
    )

    # Modify @namespace to make it distinct from production
    content = re.sub(
        r"(//\s*@namespace\s+)(.+)",
        lambda m: f"{m.group(1)}{m.group(2)}{DEV_NAMESPACE_SUFFIX}",
        content,
    )

    # Update @version with milliseconds since epoch
    content = re.sub(r"(//\s*@version\s+).*", f"\\g<1>{version}", content)

    # Remove metadata lines that interfere with dev serving
    # Note: @icon is removed because scripts may reference icons not yet in the GitHub repository
    content = re.sub(r"//\s*@(update|downloadURL|updateURL|icon)\s+.*\n", "", content)

    return content, version


class DevHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler for serving modified userscripts."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=SCRIPTS_DIR, **kwargs)

    def send_no_cache_headers(self):
        """Send headers to prevent caching."""
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")

    def do_GET(self):
        url_path = self.path.split("?")[0]

        # Serve index page listing all scripts and tests
        if url_path == "/" or url_path == "/index.html":
            self.serve_index()
            return

        # Serve generated identicon favicon
        if url_path == "/favicon.ico":
            self.serve_favicon()
            return

        # Serve test pages (including helper files not listed on homepage)
        if url_path.endswith(".html"):
            filename = url_path.lstrip("/")
            filepath = os.path.join(TEST_DIR, filename)
            if os.path.exists(filepath):
                self.serve_test_page(filepath)
                return

        # Serve modified userscript
        if url_path.endswith(".user.js"):
            filepath = os.path.join(SCRIPTS_DIR, url_path.lstrip("/"))
            filepath = os.path.realpath(filepath)
            # Prevent path traversal: ensure filepath is within SCRIPTS_DIR
            if not filepath.startswith(os.path.realpath(SCRIPTS_DIR)):
                self.send_error(403, "Access denied")
                return
            if os.path.exists(filepath):
                self.serve_script(filepath)
                return

        # Serve other files (images, etc.) normally
        super().do_GET()

    def serve_index(self):
        """Serve index page with list of available scripts and test pages."""
        test_links = ''.join(f'<li><a href="/{f}">{f}</a></li>' for f in get_test_pages())
        html = f"""<!DOCTYPE html>
<html>
<head>
    <title>Dev Userscripts</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; font-size: 14px; }}
        h1, h2 {{ color: #333; }}
        ul {{ list-style: none; padding: 0; }}
        li {{ margin: 8px 0; padding: 12px 15px; background: #f5f5f5; border-radius: 8px; }}
        a {{ text-decoration: none; color: #0066cc; font-weight: 500; }}
        a:hover {{ text-decoration: underline; }}
        .info {{ background: #e7f3ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; }}
        code {{ background: #eee; padding: 2px 6px; border-radius: 4px; }}
        .section {{ margin-top: 30px; }}
    </style>
</head>
<body>
    <h1>🔧 Dev Userscripts</h1>
    <div class="info">
        <p>Install scripts in your userscript manager. Served with <code>[DEV]</code> prefix.</p>
    </div>
    <ul>
        {''.join(f'<li><a href="/{s}">{s}</a></li>' for s in get_scripts())}
    </ul>
    
    <div class="section">
        <h2>🧪 Test Pages</h2>
        <ul>{test_links}</ul>
    </div>
</body>
</html>"""

        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_no_cache_headers()
        self.end_headers()
        self.wfile.write(html.encode("utf-8"))

    def serve_script(self, filepath):
        """Serve processed userscript with DEV modifications."""
        try:
            content, version = process_script(filepath)
            self._last_version = version  # Store for logging
            self.send_response(200)
            self.send_header("Content-Type", "application/javascript; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_no_cache_headers()
            self.end_headers()
            self.wfile.write(content.encode("utf-8"))
        except Exception as e:
            self.send_error(500, f"Error processing script: {e}")

    def serve_test_page(self, filepath):
        """Serve test page HTML file."""
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_no_cache_headers()
            self.end_headers()
            self.wfile.write(content.encode("utf-8"))
        except Exception as e:
            self.send_error(500, f"Error serving test page: {e}")

    def serve_favicon(self):
        """Return 204 No Content for favicon requests."""
        self.send_response(204)
        self.end_headers()

    def log_message(self, format, *args):
        """Custom logging format with version for userscripts."""
        url_path = self.path.split("?")[0]
        if url_path.endswith(".user.js") and hasattr(self, '_last_version'):
            print(f"[{self.address_string()}] {args[0]} (version {self._last_version})")
            return
        print(f"[{self.address_string()}] {args[0]}")


# ==================================================================================================
# Main Entry Point
# ==================================================================================================

def main():
    httpd = http.server.ThreadingHTTPServer(("", PORT), DevHandler)
    shutdown_thread = None
    
    def shutdown_handler(signum, frame):
        nonlocal shutdown_thread
        print("\n\n👋 Shutting down server...")
        shutdown_thread = threading.Thread(target=httpd.shutdown)
        shutdown_thread.start()
    
    signal.signal(signal.SIGINT, shutdown_handler)
    signal.signal(signal.SIGTERM, shutdown_handler)
    
    print(f"\n🚀 Dev server running at http://{LOCAL_IP}:{PORT}")
    print(f"📂 Serving from: {SCRIPTS_DIR}")
    print("\n📜 Available scripts:")
    for f in get_scripts():
        print(f"   http://{LOCAL_IP}:{PORT}/{f}")
    print(f"\n💡 Open http://{LOCAL_IP}:{PORT} in browser to see all scripts")
    print("    Press Ctrl+C to stop\n")

    try:
        httpd.serve_forever()
    finally:
        if shutdown_thread:
            shutdown_thread.join()
        httpd.server_close()
        print("👋 Server stopped")


if __name__ == "__main__":
    main()
