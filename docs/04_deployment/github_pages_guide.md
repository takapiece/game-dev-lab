# 🌐 Game Dev Lab GitHub Pages 公開ガイド

この資料は、Game Dev LabをGitHubへ接続し、GitHub PagesでWeb公開するまでの考え方と作業を学習用にまとめたものです。

## 1. 公開の全体像

```text
ローカルで制作
  ↓ git commit（変更を記録）
GitHubへpush（共有できる保管場所）
  ↓ GitHub Actions
npm ci → npm run build
  ↓ dist/ を配置
GitHub PagesでWeb公開
```

### 役割の違い

- **Git:** ファイルの変更履歴を記録する仕組み。
- **GitHub:** Gitの履歴をインターネット上で保管・共有するサービス。
- **GitHub Actions:** pushをきっかけに、ビルドなどの作業を自動実行する仕組み。
- **GitHub Pages:** ビルド済みのHTML、CSS、JavaScriptをWebサイトとして配信する機能。

## 2. 公開URLの構成

リポジトリ名を `game-dev-lab` とした場合の例です。

| ページ | URL |
| :--- | :--- |
| Game Dev Labトップ | `https://<username>.github.io/game-dev-lab/` |
| HOOPS 3D | `https://<username>.github.io/game-dev-lab/games/01_hoops_3d/` |
| 学習ダッシュボード | `https://<username>.github.io/game-dev-lab/games/01_hoops_3d/dashboard/` |
| Phase 1 | `https://<username>.github.io/game-dev-lab/games/01_hoops_3d/phases/phase_01_3d_mock/` |
| Phase 2 | `https://<username>.github.io/game-dev-lab/games/01_hoops_3d/phases/phase_02_1v1_defender/` |

## 3. 公開前の準備

### GitHub CLIの確認

```bash
gh --version
gh auth status
```

`gh: command not found` と表示された場合は、GitHub CLIをインストールします。

```bash
# macOS（Homebrew）
brew install gh

# インストール後にGitHubへログイン
gh auth login
```

Windowsでは `winget install --id GitHub.cli`、またはGitHub CLI公式インストーラーを利用できます。

### 公開してよい情報か確認

GitHub Pagesはインターネット公開です。APIキー、パスワード、個人情報、限定公開資料が含まれていないか確認します。`.env` や `node_modules`、`dist` はGitへ登録しません。

## 4. 初回公開手順

リポジトリルートで実行します。

### Step 1: 本番ビルドを確認

```bash
npm install
npm run build
```

`dist/` にGame Dev Labと各ゲームのページが生成されれば成功です。

### Step 2: 公開リポジトリを作成して接続

```bash
gh repo create game-dev-lab --public --source=. --remote=origin
```

このコマンドは次をまとめて行います。

1. GitHub上に `game-dev-lab` リポジトリを作る。
2. 現在のローカルフォルダをそのリポジトリへ接続する。
3. 接続先を `origin` という名前で登録する。

### Step 3: 変更を記録してpush

```bash
git add <今回公開するファイル>
git commit -m "feat: add Game Dev Lab learning portal"
git push -u origin main
```

`git add .` は無関係な変更まで含める可能性があるため、公開対象を確認してから使います。

### Step 4: GitHub Pagesを有効化

GitHubのリポジトリ画面で以下を設定します。

```text
Settings
  └─ Pages
      └─ Build and deployment
          └─ Source: GitHub Actions
```

このリポジトリには `.github/workflows/deploy.yml` があり、mainブランチへのpush時に次を自動実行します。

1. Node.jsを準備する。
2. `npm ci` で依存関係を再現する。
3. `npm run build` で `dist/` を生成する。
4. `dist/` をGitHub Pagesへ配置する。

### Step 5: 公開結果を確認

1. GitHubの `Actions` タブを開く。
2. `Deploy Game & Dashboard to GitHub Pages` を確認する。
3. 緑色のチェックになったら公開URLを開く。
4. トップ、ゲーム、ダッシュボード、各フェーズを確認する。

## 5. 2回目以降の更新

```bash
git status
git add <更新したファイル>
git commit -m "update: 学習内容を更新"
git push
```

push後はGitHub Actionsが自動的にサイトを更新します。公開中のサイトを直接編集するのではなく、ローカルのソースコードを変更して再公開するのが基本です。

## 6. 新しいゲームを公開対象へ追加する

1. `games/02_game_name/` に独立したゲームを作る。
2. `game.json` を追加し、ポータルへゲーム情報を登録する。
3. 公開するHTMLをルートの `vite.config.js` の `input` へ追加する。
4. `npm run build` で新しいページが `dist/games/02_game_name/` に生成されることを確認する。
5. commitしてpushする。

## 7. トラブルシューティング

### `gh: command not found`

GitHubアカウントがCodexアプリに接続済みでも、ターミナル用のGitHub CLIは別に必要です。GitHub CLIをインストールして `gh auth login` を行います。

### ページが404になる

- `Settings → Pages → Source` が `GitHub Actions` になっているか確認する。
- Actionsの実行が成功しているか確認する。
- URLにリポジトリ名が含まれているか確認する。

### CSSやJavaScriptが読み込めない

ルートの `vite.config.js` に `base: './'` が設定されているか確認します。これにより、リポジトリ名が変わっても相対URLでアセットを読み込めます。

### GitHub Actionsの `npm ci` が失敗する

`package.json` と `package-lock.json` の内容が一致しているか確認します。依存関係を変更したときは `npm install` 後のロックファイルも一緒にcommitします。

## 8. 今回の実施状況

- [x] Game Dev Labの共通ポータルを作成
- [x] サイト全体の本番ビルドに成功
- [x] GitHub Pages用のActionsワークフローを作成
- [x] リポジトリ配下でも動く相対URLへ対応
- [x] GitHub CLIをインストール
- [x] `game-dev-lab` リポジトリを作成
- [x] ローカルへ `origin` を登録
- [ ] 最初のpush
- [ ] GitHub Pagesを有効化
- [ ] 公開URLで全ページを確認
