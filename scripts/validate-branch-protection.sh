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

<<<<<<< HEAD
if ! command -v yq &> /dev/null; then
    echo "❌ yq がインストールされていません"
    echo "   brew install yq または適切なパッケージマネージャーでインストールしてください"
    exit 1
fi

=======
>>>>>>> origin/main
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

# CI/CDワークフローの動的検出と解析
echo ""
echo "🔄 CI/CDワークフローのジョブ名を解析中..."

# ワークフローファイルを動的に検出
WORKFLOW_FILES=($(find .github/workflows -name "*.yml" -o -name "*.yaml" 2>/dev/null || echo ""))

if [[ ${#WORKFLOW_FILES[@]} -eq 0 ]]; then
    echo "⚠️  ワークフローファイルが見つかりません"
    exit 1
fi

<<<<<<< HEAD
=======
declare -a ACTUAL_JOBS=()

>>>>>>> origin/main
for workflow_file in "${WORKFLOW_FILES[@]}"; do
    if [[ -f "$workflow_file" ]]; then
        echo "📄 解析中: $workflow_file"

<<<<<<< HEAD
        # yqが必須の依存関係として使用
        JOBS=$(yq eval '.jobs | keys | .[]' "$workflow_file" 2>/dev/null || echo "")
=======
        # yqがある場合はyqを使用、ない場合は改良されたgrepで代用
        if command -v yq &> /dev/null; then
            JOBS=$(yq eval '.jobs | keys | .[]' "$workflow_file" 2>/dev/null || echo "")
        else
            # より堅牢なgrepベースの解析
            JOBS=$(awk '/^jobs:/{flag=1; next} flag && /^[[:space:]]*[a-zA-Z0-9_-]+:/{gsub(/^[[:space:]]*/, ""); gsub(/:.*/, ""); if($0 !~ /^[[:space:]]*$/) print $0} flag && /^[a-zA-Z]/ && !/^[[:space:]]/{flag=0}' "$workflow_file" || echo "")
        fi
>>>>>>> origin/main

        if [[ -n "$JOBS" ]]; then
            echo "  ジョブ発見:"
            while IFS= read -r job; do
                if [[ -n "$job" && "$job" != "null" ]]; then
                    echo "    - $job"
<<<<<<< HEAD
=======
                    ACTUAL_JOBS+=("$job")
>>>>>>> origin/main
                fi
            done <<< "$JOBS"
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
<<<<<<< HEAD
        # yqが必須の依存関係として使用（より正確な解析）
        JOB_NAMES_FROM_FILE=$(yq eval '.jobs[] | select(has("name")) | .name' "$workflow_file" 2>/dev/null || echo "")
=======
        # yqがある場合はより正確な解析
        if command -v yq &> /dev/null; then
            # ジョブレベルのnameフィールドを抽出
            JOB_NAMES_FROM_FILE=$(yq eval '.jobs[] | select(has("name")) | .name' "$workflow_file" 2>/dev/null || echo "")
        else
            # 改良されたgrepベースの解析（jobs配下のnameのみ）
            JOB_NAMES_FROM_FILE=$(awk '
                /^jobs:/{in_jobs=1; next}
                in_jobs && /^[[:space:]]*[a-zA-Z0-9_-]+:/{in_job=1}
                in_jobs && in_job && /^[[:space:]]+name:[[:space:]]*/{
                    gsub(/^[[:space:]]+name:[[:space:]]*/, "")
                    gsub(/^["'"'"']/, "")
                    gsub(/["'"'"']$/, "")
                    if($0 !~ /^[[:space:]]*$/) print $0
                }
                /^[a-zA-Z]/ && !/^[[:space:]]/{in_jobs=0; in_job=0}
            ' "$workflow_file" || echo "")
        fi
>>>>>>> origin/main

        if [[ -n "$JOB_NAMES_FROM_FILE" ]]; then
            while IFS= read -r name; do
                if [[ -n "$name" && "$name" != "null" ]]; then
                    JOB_NAMES+=("$name")
                    echo "  - $name"
                fi
            done <<< "$JOB_NAMES_FROM_FILE"
        fi
    fi
done

# 整合性チェック
echo ""
echo "🔍 整合性チェック実行中..."

VALIDATION_ERRORS=0

<<<<<<< HEAD
while IFS= read -r required_check; do
    if [[ -z "$required_check" ]]; then continue; fi
=======
echo "$REQUIRED_CHECKS" | while read -r required_check; do
>>>>>>> origin/main
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
<<<<<<< HEAD
done <<< "$REQUIRED_CHECKS"
=======
done
>>>>>>> origin/main

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
<<<<<<< HEAD
fi
=======
fi
>>>>>>> origin/main
