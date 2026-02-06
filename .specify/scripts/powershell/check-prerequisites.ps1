#!/usr/bin/env pwsh
# check-prerequisites.ps1 - Checks prerequisites and returns feature paths

param(
    [switch]$Json,
    [switch]$PathsOnly
)

$ErrorActionPreference = "Stop"

# Get repo root
$RepoRoot = git rev-parse --show-toplevel 2>$null
if (-not $RepoRoot) {
    Write-Error "Not in a git repository"
    exit 1
}

# Get current branch
$branch = git branch --show-current 2>$null
if (-not $branch) {
    Write-Error "Could not determine current branch"
    exit 1
}

# Determine feature directory
$featureDir = "$RepoRoot/specs/$branch"
$featureSpec = "$featureDir/spec.md"
$implPlan = "$featureDir/plan.md"
$tasks = "$featureDir/tasks.md"

$result = @{
    REPO_ROOT = $RepoRoot
    BRANCH = $branch
    FEATURE_DIR = $featureDir
    FEATURE_SPEC = $featureSpec
    IMPL_PLAN = $implPlan
    TASKS = $tasks
}

if ($Json) {
    $result | ConvertTo-Json -Compress
} else {
    Write-Host "Repository Root: $RepoRoot"
    Write-Host "Current Branch: $branch"
    Write-Host "Feature Directory: $featureDir"
    Write-Host "Spec File: $featureSpec"
}
