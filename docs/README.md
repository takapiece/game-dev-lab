# 🕹️ ゲーム開発スタジオ & 教育カリキュラム ポータル (Game Dev Lab)

本リポジトリは、プログラミング教室の生徒さんへ「本格ゲーム開発の手順・技術選定・エラー解決の思考プロセス」を伝えるための**マルチゲーム開発ラボ（教材ポータル）**です。
すべてのプロジェクトは Windows と macOS の両方で動作するように設計されています。

Webポータルはリポジトリのルートで `npm run dev` を実行し、`http://localhost:5173/` を開くと表示できます。各ゲームの `game.json` が教材一覧の情報源になります。

---

## 🎮 開発中・完成ゲーム一覧 (Games List)

| No | プロジェクト名 | ジャンル / テーマ | 使用技術 | ドキュメント & ソース | ステータス |
| :-: | :--- | :--- | :--- | :--- | :-: |
| **01** | **[HOOPS 3D](../games/01_hoops_3d/)** | スマホ向け 3D バスケットボール | Three.js / Web Audio API | [📖 開発ドキュメント](../games/01_hoops_3d/docs/README.md) | **Phase 2 完了 (1v1 AI対戦)** |
| **02** | *(Next Game)* | *(企画中: 3Dサッカー / レース等)* | - | - | 準備中 |

---

## 📚 共通開発ルール & 公開ガイド

* **[全体行動規範 & 指導ルール (GEMINI.md)](../GEMINI.md)**
* **[Win/Mac クロスプラットフォーム規約 (.agents/rules/cross_platform.md)](../.agents/rules/cross_platform.md)**
* **[教育的指導 & コーディング規約 (.agents/rules/pedagogy_rules.md)](../.agents/rules/pedagogy_rules.md)**
* **[🌐 GitHub Pages Web公開ガイド (docs/04_deployment/github_pages_guide.md)](./04_deployment/github_pages_guide.md)**

---

## 🚀 ゲームの起動方法

詳細な Windows / Mac 別の起動マニュアルは **[🚀 起動マニュアル (SETUP_GUIDE.md)](../SETUP_GUIDE.md)** をご覧ください。

```bash
# Game Dev Lab 全体の起動（リポジトリルートで実行）
npm install
npm run dev

# ブラウザでアクセス: http://localhost:5173/
```

## ➕ 新しいゲーム教材の追加方法

1. `games/02_game_name/` のように、番号付きの独立フォルダを作成する。
2. ゲーム本体、`dashboard/`、`phases/`、`docs/` をゲームフォルダ内で管理する。
3. `games/01_hoops_3d/game.json` を参考に `game.json` を作成する。
4. そのゲームで公開するHTMLをルートの `vite.config.js` のビルド入力へ追加する。

ポータルのゲームカードは `games/*/game.json` を自動検出するため、ポータルHTMLへカードを直接追加する必要はありません。
