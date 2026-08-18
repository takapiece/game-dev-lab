# 🌐 GitHub Pages 公開・デプロイ完全ガイド

本プロジェクト（HOOPS 3D ゲーム本体 ＆ 統合学習ダッシュボード）を **GitHub Pages** で全世界にWeb公開し、生徒や保護者・関係者にURLを共有するための手順書です。

---

## 📋 公開されるページのURL構成

GitHub Pages を有効化すると、以下のURLで各ページにアクセスできるようになります。

| ページ名 | アクセスURL（例: `https://<username>.github.io/<repo>/`） | 内容・機能 |
| :--- | :--- | :--- |
| 🎮 **ゲームメイン / ポータル** | `https://<username>.github.io/<repo>/` | Phase一覧、1v1ゲーム本体、ダッシュボードへのリンク |
| 📘 **統合学習ダッシュボード** | `https://<username>.github.io/<repo>/dashboard/` | **コード解説辞書、3D数学/物理解説、AIプロンプト集、埋め込みプレイ** |
| 🏀 **Phase 1 (ソロ練習)** | `https://<username>.github.io/<repo>/phases/phase_01_3d_mock/` | 3Dシューティング基本版 |
| 🤖 **Phase 2 (1v1 AI対戦)** | `https://<username>.github.io/<repo>/phases/phase_02_1v1_defender/` | ディフェンダーAI対戦版 |

---

## 🚀 公開手順（初回セットアップ 3ステップ）

### Step 1: GitHub にリポジトリを作成してプッシュ

まだ GitHub リポジトリを作成していない場合は、[GitHub](https://github.com/) で新規リポジトリを作成（Public 推奨）し、本フォルダのコードをプッシュします。

```bash
# ターミナルでの初回プッシュ例
git add .
git commit -m "feat: setup GitHub Pages auto deployment"
git branch -M main
git remote add origin https://github.com/<あなたのユーザー名>/<リポジトリ名>.git
git push -u origin main
```

---

### Step 2: GitHub リポジトリの Pages 設定を変更（1クリック）

1. GitHub のリポジトリページを開きます。
2. 上部メニューの **`Settings`（設定）** をクリックします。
3. 左サイドバーの **`Pages`** をクリックします。
4. **`Build and deployment`** のセクションで：
   - **`Source`** を `Deploy from a branch` から **`GitHub Actions`** に変更します。

```text
Settings
 └─ Pages
     └─ Build and deployment
         └─ Source: [ GitHub Actions ]  👈 ここを選択！
```

---

### Step 3: 自動デプロイの完了を確認

1. リポジトリ上部メニューの **`Actions`** タブをクリックします。
2. `Deploy Game & Dashboard to GitHub Pages` というワークフローが自動で実行されます（約1分）。
3. 緑色のチェックマーク（完了）になったら、画面に表示された **公開URL** をクリックして動作を確認します。

---

## 🔄 今後の更新方法（日々の開発）

以降は、コードを変更して GitHub にプッシュするだけで、**GitHub Actions が自動で最新版をビルドしてサイトを更新**します。

```bash
git add .
git commit -m "update: ゲームの機能追加や解説の更新"
git push
```

数分後には、公開サイト（ダッシュボード含む）が自動で最新状態になります。

---

## 💡 トラブルシューティング

* **Q. ページを開くと真っ白になる・404になる**
  - **A:** `Settings` > `Pages` の `Source` が `GitHub Actions` になっているか確認してください。
* **Q. アセット（CSSやJS）が読み込めない**
  - **A:** `games/01_hoops_3d/vite.config.js` に `base: './'` が設定されていることを確認してください。
