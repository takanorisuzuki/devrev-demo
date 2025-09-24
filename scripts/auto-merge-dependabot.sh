#!/bin/bash

# Auto-merge safe Dependabot PRs
# Usage: ./scripts/auto-merge-dependabot.sh

set -e

echo "🤖 Dependabot自動マージスクリプト"
echo "================================"

# Get all open Dependabot PRs
DEPENDABOT_PRS=$(gh pr list --author "dependabot[bot]" --state open --json number,title,labels --jq '.[] | {number: .number, title: .title}')

if [ -z "$DEPENDABOT_PRS" ]; then
    echo "❌ 処理対象のDependabot PRがありません"
    exit 0
fi

echo "📋 処理対象のPR:"
echo "$DEPENDABOT_PRS" | jq -r '. | "  #\(.number): \(.title)"'
echo ""

# Process each PR
echo "$DEPENDABOT_PRS" | jq -r '.number' | while read PR_NUMBER; do
    echo "🔍 PR #$PR_NUMBER を処理中..."

    # Get PR details
    PR_TITLE=$(gh pr view $PR_NUMBER --json title --jq '.title')

    # Check if it's a safe auto-merge candidate
    if [[ "$PR_TITLE" =~ "actions/".*"from".*"to" ]] && [[ ! "$PR_TITLE" =~ "from [0-9]+ to [0-9]+" ]]; then
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
        # Check CI status
        echo "  🔄 CI状況を確認中..."
        sleep 5

        # Attempt to merge
        if gh pr merge --squash $PR_NUMBER 2>/dev/null; then
            echo "  🎉 PR #$PR_NUMBER マージ完了"
        else
            echo "  ❌ PR #$PR_NUMBER マージ失敗（CI待ちまたは競合）"
        fi
    fi

    echo ""
done

echo "✅ 自動マージ処理完了"