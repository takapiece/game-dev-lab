# 🛠️ Game Dev Lab 共通トラブルシューティング

## エラー一覧

| ID | 現象 | 原因 | 状態 |
| :--- | :--- | :--- | :---: |
| ERR-LAB-001 | MacでViteを実行できない | Google Drive同期後に実行権限が失われた | 解決 |
| ERR-LAB-002 | GitHubへの接続コマンドを実行できない | GitHub CLIが未インストール | 解決 |

## ERR-LAB-001: Viteの実行権限不足

- **現象:** `npm run dev` で `node_modules/.bin/vite: Permission denied` と表示される。
- **原因:** WindowsとMacの間でGoogle Drive同期された `node_modules` の実行権限がMac側で失われていた。
- **修正方法:** Mac側で依存関係を再インストールする。必要に応じてViteの実行ファイルへ実行権限を付け直す。
- **💡 生徒への学び:** `node_modules` はOSごとに生成される作業用フォルダであり、共有する成果物ではない。ソースコードと `package-lock.json` を共有し、各PCで `npm install` を行う。

## ERR-LAB-002: GitHub CLIが見つからない

- **現象:** `gh --version` と `gh auth status` が `command not found` になる。
- **原因:** CodexアプリのGitHub連携と、ターミナルで利用するGitHub CLIは別の仕組みであり、このMacにはCLIがインストールされていなかった。
- **修正方法:** GitHub CLIをインストール後、`gh auth login` で認証する。
- **結果:** GitHub CLIをインストールして `takapiece` アカウントの認証に成功し、公開リポジトリを作成した。
- **💡 生徒への学び:** Webサービスのアカウント連携が済んでいても、ターミナルから同じサービスを操作するには専用CLIとCLI側の認証が必要な場合がある。
