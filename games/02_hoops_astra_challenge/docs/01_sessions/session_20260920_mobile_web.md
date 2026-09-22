# スマホ操作とWebGLの最初の試遊版

2026-09-20。ユーザーの「スマホ対応→WebGL」「記録して進める」に対応。公開を伴わず、ローカル/LAN試遊まで進めた。

## 完了した作業

- HoopsTouchで左の移動、右の長押し/解放シュート、DUNK、RUN切替を追加。RUNは走行モードの切替で、体力ゲージ/2段階ダッシュは追加しない。
- 大きなSTART/Pause/Resume/NEXT/再プレイUI。左右の指IDを独立管理し、指がボタン外へ動いても一度だけ解放。取消/画面回転/フォーカス喪失時は構えを取消。
- Build-Web.ps1で別TEMPへWebGLを構築。ログのローカルパス・終了処理・画像保存・自動検査をWebから分離。PC操作は保持。
- Prepare-Web-Page.pyで端末倍率上限、safe-area、読込表示、横持ち案内、ページ非表示時の中断を追加。Serve-Web.pyでビルドフォルダだけ配信する。
- Windows317件、Webブラウザー8件成功。検証詳細と未確認は各Evidence/VALIDATION.mdに記録。

## 再現する手順

プロジェクト直下で実行する。既存のビルドIDは上書きせず、次回は新しいIDを使用する。UnityはD:/DProgramFiles/Unity Hub/editor/6000.6.2f1/Editor/Unity.exe、Web作業場所はC:/Users/user/AppData/Local/Temp/HoopsWeb-20260920。

```powershell
./Build-Web.ps1 -BuildId web-g3-20260920-11 -EditorPath 'D:/DProgramFiles/Unity Hub/editor/6000.6.2f1/Editor/Unity.exe' -ScratchPath 'C:/Users/user/AppData/Local/Temp/HoopsWeb-20260920'
python ./Prepare-Web-Page.py web-g3-20260920-11
python ./Serve-Web.py --build web-g3-20260920-11 --bind 192.168.1.10 --port 8765
```

上は次回例であり11はまだ生成していない。現在は10を配信中。PythonがPATHにない場合は `C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe` を使う。配信の起動/停止前にPIDとコマンドを確認し、同じポートで重複起動しない。IPは次回変更され得るため再確認する。バックグラウンド起動にはStart-Process -WindowStyle Hiddenを使う。

## 試遊方法と次回

PCを稼働したまま、同じルーターのWi-Fiにつながったスマホで `http://192.168.1.10:8765/` を開く。横持ちにしてSTART。左スティックで移動、SHOOTを押し続けて離す、RUNで走行切替、DUNKで近距離ダンク。読み込みは初回約49MB。

端末/OS/ブラウザーを記録し、Streetで操作・音量・表示/ノッチ・速度→画面回転/背景復帰→4世界進行を確認する。iPhone消音状態も確認。実機未確認なのでスマホ対応完了や公開可能とは判定しない。通信対戦やアプリストア版は今回範囲外。接続不可時は原因診断を先に行い、保護設定は自動変更しない。

## 💡 このセッションで学んだプログラミング概念

- 入力とゲームの分離：同じ移動/投球処理へ、キーボードとタッチの二つの入力を渡せる。
- 状態と所有権：移動中の指と投球中の指をIDで区別すると、片方を離してももう片方が勝手に解除されない。
- 実行環境ごとの差：Windowsのファイル保存や音声Streamingを、そのままブラウザーへ持ち込まず分ける。
- 非同期の検証：エンジン読込完了と画面が操作可能になる時刻は同じではない。自動試験には表示準備と実際の画面寸法の確認が必要。
- 静的配信：ゲームが端末のブラウザー内で動く場合、配信するファイルの置き場は必要だが、ゲーム状態を管理する専用サーバーは必須ではない。
