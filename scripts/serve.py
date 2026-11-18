#!/usr/bin/env python3
"""Local preview without Node.js: python3 scripts/serve.py [--port 4187]

Serves the site folder on 127.0.0.1 and tells the browser not to cache,
so an edit shows up on the next reload.
"""
import argparse
import functools
import http.server
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('X-Content-Type-Options', 'nosniff')
        super().end_headers()

    def log_message(self, *args):
        pass


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=4187)
    port = parser.parse_args().port
    handler = functools.partial(Handler, directory=str(ROOT))
    with http.server.ThreadingHTTPServer(('127.0.0.1', port), handler) as server:
        print(f'Local: http://127.0.0.1:{port}', flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == '__main__':
    main()
