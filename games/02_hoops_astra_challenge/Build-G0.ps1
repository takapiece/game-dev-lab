param(
    [Parameter(Mandatory = $true)][string]$EditorPath,
    [string]$BuildId = ('g0-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
)
$ErrorActionPreference = 'Stop'
if ($BuildId -notmatch '^g0-[a-zA-Z0-9-]+$') { throw 'Invalid BuildId.' }
if (!(Test-Path -LiteralPath $EditorPath -PathType Leaf)) { throw 'Unity Editor not found.' }
$buildDestination = Join-Path $PSScriptRoot "Builds/$BuildId"
$evidenceDestination = Join-Path $PSScriptRoot "Evidence/$BuildId"
if ((Test-Path -LiteralPath $buildDestination) -or (Test-Path -LiteralPath $evidenceDestination)) {
    throw 'Choose a new BuildId: existing checkpoints must not be overwritten.'
}
# 検証用コピーだけをTEMPに置く。正本の場所とDrive同期設定は変えない。
$scratch = Join-Path ([IO.Path]::GetTempPath()) ('HoopsG0-' + [guid]::NewGuid().ToString('N'))
$project = Join-Path $scratch 'UnityProject'
New-Item -ItemType Directory -Path $project,$evidenceDestination | Out-Null
foreach ($name in @('Assets','Packages','ProjectSettings')) {
    Copy-Item -LiteralPath (Join-Path $PSScriptRoot "UnityProject/$name") -Destination $project -Recurse
}
$scratch | Set-Content -LiteralPath (Join-Path $evidenceDestination 'scratch-path.local')
$previousBuildPath = $env:HOOPS_G0_BUILD_PATH
$previousBuildId = $env:HOOPS_G0_BUILD_ID
try {
    $env:HOOPS_G0_BUILD_ID = $BuildId
    $env:HOOPS_G0_BUILD_PATH = Join-Path $scratch 'Build/HoopsG0.exe'
    $process = Start-Process -FilePath $EditorPath -ArgumentList @(
        '-batchmode','-nographics','-projectPath',('"' + $project + '"'),
        '-executeMethod','G0Build.Run','-logFile',('"' + (Join-Path $scratch 'editor.log') + '"')
    ) -WindowStyle Hidden -PassThru
    if (!$process.WaitForExit(900000)) {
        Stop-Process -Id $process.Id
        throw 'Build timed out after 15 minutes; inspect editor.log in the scratch folder.'
    }
    Copy-Item -LiteralPath (Join-Path $scratch 'editor.log') -Destination $evidenceDestination
    if ($process.ExitCode -ne 0 -or !(Test-Path -LiteralPath $env:HOOPS_G0_BUILD_PATH)) {
        throw "Build failed, exit code $($process.ExitCode). Inspect the saved log."
    }
    Copy-Item -LiteralPath (Join-Path $scratch 'Build') -Destination $buildDestination -Recurse
    Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'UnityProject/THIRD_PARTY_NOTICES.md') -Destination $buildDestination
    Compress-Archive -Path "$project/Assets","$project/Packages","$project/ProjectSettings" `
        -DestinationPath (Join-Path $evidenceDestination 'source.zip')
    Compress-Archive -LiteralPath (Join-Path $PSScriptRoot 'UnityProject/THIRD_PARTY_NOTICES.md') `
        -DestinationPath (Join-Path $evidenceDestination 'source.zip') -Update
    Write-Output "Build saved: $buildDestination"
    Write-Output 'Next: run HoopsG0.exe, click Start, check rotation, and click Quit.'
    Write-Output 'Build success alone does not pass G0. The snapshot and logs are for local validation.'
}
finally {
    $env:HOOPS_G0_BUILD_PATH = $previousBuildPath
    $env:HOOPS_G0_BUILD_ID = $previousBuildId
}
