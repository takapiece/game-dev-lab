# スマホ操作 → ローカルWebGL試遊 → 公開判断

2026-09-20、ユーザーが方針の記録と着手を承認。

1. 横画面を前提に左の移動スティック、右の長押し/解放シュート、ダンク、ダッシュ、Pauseを追加。既存PCキー操作は保持する。
2. 早い段階でWebGL版を作り、PCブラウザと同じWi-Fiの実スマホで操作・音・負荷を確認する。Streetで基本操作を試した後、4ステージの進行を確認する。
3. 調整・公開利用条件確認後に公開先を決める。静的配信で足り、専用のゲームサーバーや通信対戦は作らない。itch.ioは候補であり決定/登録/アップロードは未実施。

現在の許可範囲はローカル制作・LAN試遊まで。外部公開、購入、Git push、アカウント作成、ルーター設定変更はしない。公開可能性の質問を実際の公開許可とは扱わない。

## 技術上の確認点

- 今のUnity 6000.6.2f1にWebGLSupport導入済み。
- ログ/スクリーンショット保存をWeb向けに分離し、デスクトップ絶対パスを書き込まない。公開ビルドへ開発レビュー/素材原本を置かない。
- BGMはWeb用にCompressedInMemory、短いSEはDecompressOnLoadで検証。開始操作で音声を有効化する。iPhoneの消音設定も確認項目とする。
- マルチタッチで移動とシュートを同時操作。指がボタン外へ動いた場合やtouchcancel、Pause/回転/フォーカス喪失で入力が残らないようにする。
- 縦画面は横持ち案内、ノッチ/ホーム領域を避ける。モバイル画質は30fps目標。実機未測定のため達成済みとはしない。
- ローカル配信はゲームのビルドフォルダだけを公開する。LAN接続失敗時はWi-Fi/Windowsファイアウォールを診断し、自動で保護設定を変更しない。

## 参照

- [Unity 6.6モバイルブラウザ対応](https://docs.unity.com/en-us/engine/6000.6/manual/platform-specific/webgl/intro/browsercompatibility)
- [Web音声の制限](https://docs.unity.com/en-us/engine/6000.6/manual/platform-specific/webgl/develop/audio)
- [itch.ioのHTML5登録](https://itch.io/docs/creators/html5)

## 実装した初回チェックポイント

Windows G3-10の317件、Web G3-10のブラウザー8件が成功。実機未確認。Webは約48.7MB/圧縮無効、LAN配信は2026-09-20時点で http://192.168.1.10:8765/ 。端末OS回答待ち。次はStreetの実機操作/音/負荷、次いで4世界の確認。[手順](../01_sessions/session_20260920_mobile_web.md)。
