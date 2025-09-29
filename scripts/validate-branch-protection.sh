#!/bin/bash

# ブランチ保護設定とCI/CDチェック名の整合性検証スクリプト
# 使用法: ./scripts/validate-branch-protection.sh

set -euo pipefail

echo "🔍 ブランチ保護設定とCI/CDチェック名の検証開始..."

# 必要なツールの確認
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) がインストールされていません"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo "❌ jq がインストールされていません"
    exit 1
fi

# リポジトリ情報の取得
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
if [[ -z "$REPO" ]]; then
    echo "❌ リポジトリ情報を取得できません"
    exit 1
fi

echo "📁 リポジトリ: $REPO"

# ブランチ保護ルールの取得
echo "🔒 ブランチ保護ルールを取得中..."
PROTECTION_JSON=$(gh api "repos/$REPO/branches/main/protection" 2>/dev/null || echo '{}')

if [[ "$PROTECTION_JSON" == '{}' ]]; then
    echo "⚠️  mainブランチに保護ルールが設定されていません"
    exit 0
fi

# 必須ステータスチェックの抽出
REQUIRED_CHECKS=$(echo "$PROTECTION_JSON" | jq -r '.required_status_checks.contexts[]?' 2>/dev/null || echo "")

if [[ -z "$REQUIRED_CHECKS" ]]; then
    echo "✅ 必須ステータスチェックは設定されていません"
    exit 0
fi

echo "📋 設定済み必須ステータスチェック:"
echo "$REQUIRED_CHECKS" | while read -r check; do
    echo "  - $check"
done

# CI/CDワークフローの解析
echo ""
echo "🔄 CI/CDワークフローのジョブ名を解析中..."

WORKFLOW_FILES=(
    ".github/workflows/ci.yml"
    ".github/workflows/quality.yml"
    ".github/workflows/security.yml"
)

declare -a ACTUAL_JOBS=()

for workflow_file in "${WORKFLOW_FILES[@]}"; do
    if [[ -f "$workflow_file" ]]; then
        echo "📄 解析中: $workflow_file"

        # yqがある場合はyqを使用、ない場合はgrepで代用
        if command -v yq &> /dev/null; then
            JOBS=$(yq eval '.jobs | keys | .[]' "$workflow_file" 2>/dev/null || echo "")
        else
            # grepベースの代替解析
            JOBS=$(grep -E "^  [a-zA-Z0-9_-]+:" "$workflow_file" | sed 's/://g' | sed 's/^  //g' || echo "")
        fi

        if [[ -n "$JOBS" ]]; then
            echo "  ジョブ発見:"
            echo "$JOBS" | while read -r job; do
                echo "    - $job"
                ACTUAL_JOBS+=("$job")
            done
        fi
    else
        echo "⚠️  ワークフローファイルが見つかりません: $workflow_file"
    fi
done

# nameフィールドの抽出（より正確な照合のため）
echo ""
echo "🏷️  ジョブの表示名を解析中..."

declare -a JOB_NAMES=()

for workflow_file in "${WORKFLOW_FILES[@]}"; do
    if [[ -f "$workflow_file" ]]; then
        # name: で始まる行を抽出（ジョブレベル）
        while IFS= read -r line; do
            if [[ "$line" =~ ^[[:space:]]+name:[[:space:]]*(.+)$ ]]; then
                name="${BASH_REMATCH[1]}"
                # クォートを除去
                name=$(echo "$name" | sed 's/^["'\'']//' | sed 's/["'\'']$//')
                JOB_NAMES+=("$name")
                echo "  - $name"
            fi
        done < "$workflow_file"
    fi
done

# 整合性チェック
echo ""
echo "🔍 整合性チェック実行中..."

VALIDATION_ERRORS=0

echo "$REQUIRED_CHECKS" | while read -r required_check; do
    FOUND=false

    # ジョブ名での照合
    for job_name in "${JOB_NAMES[@]}"; do
        if [[ "$job_name" == "$required_check" ]]; then
            FOUND=true
            break
        fi
    done

    if [[ "$FOUND" == "true" ]]; then
        echo "✅ '$required_check' - 一致"
    else
        echo "❌ '$required_check' - 対応するジョブが見つかりません"
        ((VALIDATION_ERRORS++))

        echo "   🔍 類似の候補:"
        for job_name in "${JOB_NAMES[@]}"; do
            # 部分一致チェック
            if [[ "$job_name" == *"$required_check"* ]] || [[ "$required_check" == *"$job_name"* ]]; then
                echo "     - $job_name"
            fi
        done
    fi
done

echo ""
if [[ $VALIDATION_ERRORS -eq 0 ]]; then
    echo "🎉 すべてのブランチ保護設定が正常です"
    exit 0
else
    echo "⚠️  $VALIDATION_ERRORS 個の設定不整合が発見されました"
    echo ""
    echo "🔧 修正推奨事項:"
    echo "1. .github/workflows/ のジョブ名を確認"
    echo "2. ブランチ保護ルールの必須チェック名を更新"
    echo "3. GitHub UI またはAPIでブランチ保護設定を修正"
    exit 1
fi