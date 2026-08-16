---
name: session-logger
description: >-
  セッション完了時や大きな機能実装時に、docs/01_sessions/ に手順書を作成し、
  docs/02_troubleshooting/error_log.md や docs/00_roadmap/decisions.md を更新するワークフロー。
---

# ゲーム制作セッション記録スキル (Session Logger)

このスキルは、プログラミング教室向けの開発セッション手順書・エラーログ・意思決定ログ（ADR）を標準フォーマットに従って自動生成・更新するための手順書です。

## 実行手順

1. **セッション概要の整理**:
   * 今回実装した機能一覧、操作方法、技術的ポイントを整理する。
2. **手順書の作成 (`docs/01_sessions/session_XX_*.md`)**:
   * `docs/01_sessions/template.md` のフォーマットに従ってドキュメントを生成する。
   * 生徒向けに「💡 このセッションで学んだプログラミング概念」を必ず含める。
3. **エラーログの更新 (`docs/02_troubleshooting/error_log.md`)**:
   * デバッグが発生した場合は、`[ERR-XXX]` の連番で「現象」「エラーメッセージ」「原因」「修正方法」「💡 生徒への学び」を記録する。
4. **意思決定ログの更新 (`docs/00_roadmap/decisions.md`)**:
   * 技術選定や設計方針の変更があった場合は、`[ADR-XXX]` の連番で記録する。
5. **進捗コンテキストの更新 (`.agents/context.md`)**:
   * 完了タスクをチェックし、次回予定タスクを更新する。
