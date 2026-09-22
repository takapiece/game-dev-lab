from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
import argparse

parser=argparse.ArgumentParser();parser.add_argument('--build',required=True);parser.add_argument('--bind',default='127.0.0.1');parser.add_argument('--port',type=int,default=8765)
args=parser.parse_args();base=Path(__file__).resolve().parent/'Builds';root=(base/args.build).resolve()
if not root.is_relative_to(base.resolve()) or not (root/'index.html').is_file():raise SystemExit('A valid Web build is required')
class Handler(SimpleHTTPRequestHandler):
    extensions_map={**SimpleHTTPRequestHandler.extensions_map,'.wasm':'application/wasm','.data':'application/octet-stream','.js':'application/javascript'}
    def __init__(self,*a,**kw):super().__init__(*a,directory=str(root),**kw)
    def list_directory(self,path):self.send_error(404);return None
    def end_headers(self):self.send_header('Cache-Control','no-store');super().end_headers()
print(f'Local trial: http://{args.bind}:{args.port}/',flush=True)
ThreadingHTTPServer((args.bind,args.port),Handler).serve_forever()
