#!/bin/bash

# Auto-merge safe Dependabot PRs
# Usage: ./scripts/auto-merge-dependabot.sh

set -e

echo "🤖 Dependabot自動マージスクリプト"
echo "================================"

# Get all open Dependabot PRs
DEPENDABOT_PRS=$(gh pr list --author "dependabot[bot]" --state open --json number,title)

if [ -z "$DEPENDABOT_PRS" ] || [ "$DEPENDABOT_PRS" = "[]" ]; then
    echo "❌ 処理対象のDependabot PRがありません"
    exit 0
fi

echo "📋 処理対象のPR:"
echo "$DEPENDABOT_PRS" | jq -r '.[] | "  #\(.number): \(.title)"'
echo ""

# Process each PR
echo "$DEPENDABOT_PRS" | jq -c '.[]' | while read -r pr_json; do
    PR_NUMBER=$(echo "$pr_json" | jq -r '.number')
    PR_TITLE=$(echo "$pr_json" | jq -r '.title')
    echo "🔍 PR #$PR_NUMBER を処理中..."

    # Check if it's a safe auto-merge candidate
    if [[ "$PR_TITLE" =~ "actions/".*"from".*"to" ]] && [[ ! "$PR_TITLE" =~ from\sv?[^.\s]+\sto\sv?[^.\s]+ ]]; then
        # GitHub Actions minor/patch updates
        echo "  ✅ GitHub Actions minor/patch更新: $PR_TITLE"
        SAFE=true
    elif [[ "$PR_TITLE" =~ "deps-dev".*"bump".*"in /frontend" ]]; then
        # Frontend dev dependencies
        echo "  ✅ Frontend開発依存関係: $PR_TITLE"
        SAFE=true
    elif [[ "$PR_TITLE" =~ "@types/" ]]; then
        # Type definitions
        echo "  ✅ 型定義更新: $PR_TITLE"
        SAFE=true
    elif [[ "$PR_TITLE" =~ "prettier".*"eslint".*"typescript" ]]; then
        # Development tools
        echo "  ✅ 開発ツール更新: $PR_TITLE"
        SAFE=true
    else
        echo "  ⚠️  手動レビュー推奨: $PR_TITLE"
        SAFE=false
    fi

    if [ "$SAFE" = true ]; then
        # 自動マージを設定
        if gh pr merge --auto --squash $PR_NUMBER; then
            echo "  🎉 PR #$PR_NUMBER の自動マージを設定しました"
        else
            echo "  ❌ PR #$PR_NUMBER の自動マージ設定に失敗しました"
        fi
    fi

    echo ""
done

echo "✅ 自動マージ処理完了"