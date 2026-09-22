from pathlib import Path
import json,sys,hashlib

root=Path(__file__).resolve().parent
build_id=sys.argv[1];build=root/'Builds'/build_id
assert build_id.startswith('web-g3-') and build.is_dir()
files=list((build/'Build').iterdir())
one=lambda suffix:next(p for p in files if p.name.endswith(suffix)).name
config=dict(dataUrl='Build/'+one('.data'),frameworkUrl='Build/'+one('.framework.js'),codeUrl='Build/'+one('.wasm'),streamingAssetsUrl='StreamingAssets',companyName='HoopsChallenge',productName='HOOPS WORLD TOUR',productVersion=build_id)
html='''<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><link rel="icon" href="data:,"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"><title>HOOPS / WORLD TOUR</title>
<style>*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;background:#07151d;overflow:hidden;overscroll-behavior:none;font-family:system-ui;color:white}#frame{position:fixed;inset:0;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)}canvas{display:block;width:100%;height:100%;touch-action:none;outline:none}#loading{position:fixed;inset:0;display:grid;place-content:center;background:#07151d;text-align:center;gap:18px}progress{width:280px;accent-color:#38ddbc}small{color:#aabfc9}</style></head>
<body><main id="frame"><canvas id="unity-canvas" tabindex="0" aria-label="HOOPS basketball game"></canvas></main><div id="loading"><h1>HOOPS / WORLD TOUR</h1><progress id="progress" max="1" value="0"></progress><p id="status">ゲームを読み込んでいます</p><small>スマホは横向きでプレイしてください</small></div>
<div id="rotate" role="status"><strong>横向きにしてください</strong><span>画面を回すと、再開できます</span></div>
<style>#rotate{display:none;position:fixed;inset:0;background:#102c3f;z-index:3;align-items:center;justify-content:center;flex-direction:column;gap:16px;text-align:center;padding:24px}#rotate strong{font-size:24px}#rotate span{font-size:15px;color:#b8d2de}@media(orientation:portrait){body.touch-mode #rotate{display:flex}}</style>
<script>
const canvas=document.querySelector('#unity-canvas');const config=CONFIG;
const touchMode=navigator.maxTouchPoints>0||new URLSearchParams(location.search).get('touch')==='1';
if(touchMode)document.body.classList.add('touch-mode');
config.devicePixelRatio=Math.min(window.devicePixelRatio||1,1.5);
const script=document.createElement('script');script.src='Build/LOADER';
script.onload=()=>createUnityInstance(canvas,config,p=>document.querySelector('#progress').value=p).then(instance=>{
window.hoops=instance;document.querySelector('#loading').style.display='none';
if(touchMode)instance.SendMessage('GameplayRoot','SetMode','1');
canvas.focus();window.hoopsReady=true;
}).catch(error=>{document.querySelector('#status').textContent='起動できませんでした: '+error;console.error(error)});
document.body.appendChild(script);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&window.hoops)window.hoops.SendMessage('GameplayRoot','LoseFocus');});
</script></body></html>'''.replace('CONFIG',json.dumps(config)).replace('LOADER',one('.loader.js'))
(build/'index.html').write_text(html,encoding='utf-8')
records=[dict(path=str(p.relative_to(build)).replace('\\','/'),bytes=p.stat().st_size,sha256=hashlib.sha256(p.read_bytes()).hexdigest()) for p in build.rglob('*') if p.is_file()]
(root/'Evidence'/build_id/'served-files.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
print(json.dumps(dict(build=build_id,totalBytes=sum(r['bytes'] for r in records),files=len(records))))
