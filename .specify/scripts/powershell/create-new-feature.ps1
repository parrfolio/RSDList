#!/usr/bin/env pwsh
# create-new-feature.ps1 - Creates a new feature branch and spec file

param(
    [Parameter(Position=0)]
    [string]$Json,
    
    [int]$Number,
    
    [string]$ShortName
)

$ErrorActionPreference = "Stop"

# Get repo root
$RepoRoot = git rev-parse --show-toplevel 2>$null
if (-not $RepoRoot) {
    Write-Error "Not in a git repository"
    exit 1
}

# Determine feature number
if (-not $Number) {
    # Find highest existing feature number
    $existingBranches = git branch -a 2>$null | Select-String -Pattern '^\s*\*?\s*(\d{3})-' | ForEach-Object {
        [int]($_.Matches[0].Groups[1].Value)
    }
    $existingSpecs = Get-ChildItem -Path "$RepoRoot/specs" -Directory -ErrorAction SilentlyContinue | 
        Where-Object { $_.Name -match '^\d{3}-' } |
        ForEach-Object { [int]($_.Name.Substring(0, 3)) }
    
    $allNumbers = @($existingBranches) + @($existingSpecs) | Where-Object { $_ -ne $null }
    $maxNumber = ($allNumbers | Measure-Object -Maximum).Maximum
    $Number = if ($maxNumber) { $maxNumber + 1 } else { 1 }
}

$featureNum = $Number.ToString("D3")

# Create branch name
if (-not $ShortName) {
    $ShortName = ($Json -replace '[^a-zA-Z0-9\s]', '' -replace '\s+', '-').ToLower().Substring(0, [Math]::Min(30, $Json.Length))
}
$branchName = "$featureNum-$ShortName"

# Create feature branch
$hasGit = $true
try {
    git checkout -b $branchName 2>&1 | Out-Null
} catch {
    $hasGit = $false
}

# Create spec directory and file
$specDir = "$RepoRoot/specs/$branchName"
$specFile = "$specDir/spec.md"

New-Item -ItemType Directory -Path $specDir -Force | Out-Null

# Copy template
$templatePath = "$RepoRoot/.specify/templates/spec-template.md"
if (Test-Path $templatePath) {
    Copy-Item -Path $templatePath -Destination $specFile
} else {
    # Create minimal spec file
    @"
# Feature Specification: [FEATURE NAME]

**Feature Branch**: ``$branchName``  
**Created**: $(Get-Date -Format "yyyy-MM-dd")  
**Status**: Draft  
**Input**: User description: "$Json"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - [Brief Title] (Priority: P1)

[Describe this user journey in plain language]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST [specific capability]

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: [Measurable metric]
"@ | Set-Content -Path $specFile
}

# Output JSON result
$result = @{
    BRANCH_NAME = $branchName
    SPEC_FILE = $specFile
    FEATURE_NUM = $featureNum
    HAS_GIT = $hasGit
}

$result | ConvertTo-Json -Compress
