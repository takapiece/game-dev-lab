param(
    [Parameter(Mandatory=$true)][string]$EditorPath,
    [string]$BuildId=('g1-'+(Get-Date -Format 'yyyyMMdd-HHmmss'))
)
$ErrorActionPreference='Stop'
if($BuildId -notmatch '^g1-[a-zA-Z0-9-]+$') { throw 'Invalid BuildId' }
if(!(Test-Path -LiteralPath $EditorPath -PathType Leaf)) { throw 'Unity Editor not found' }
$destination=Join-Path $PSScriptRoot "Builds/$BuildId"
$evidence=Join-Path $PSScriptRoot "Evidence/$BuildId"
if((Test-Path -LiteralPath $destination) -or (Test-Path -LiteralPath $evidence)) { throw 'Existing checkpoint: use a new BuildId' }
$scratch=Join-Path ([IO.Path]::GetTempPath()) ('HoopsG1-'+[guid]::NewGuid().ToString('N'))
$project=Join-Path $scratch 'UnityProject'
New-Item -ItemType Directory -Path $project,$evidence | Out-Null
foreach($name in @('Assets','Packages','ProjectSettings')) {
    Copy-Item -LiteralPath (Join-Path $PSScriptRoot "UnityProject/$name") -Destination $project -Recurse
}
$scratch | Set-Content -LiteralPath (Join-Path $evidence 'scratch-path.local')
$oldBuildPath=$env:HOOPS_G1_BUILD_PATH
$oldBuildId=$env:HOOPS_G1_BUILD_ID
try {
    $env:HOOPS_G1_BUILD_PATH=Join-Path $scratch 'Build/Hoops.exe'
    $env:HOOPS_G1_BUILD_ID=$BuildId
    $editorLog=Join-Path $evidence 'editor.log'
    $unity=Start-Process -FilePath $EditorPath -ArgumentList @(
        '-batchmode','-nographics','-projectPath',('"'+$project+'"'),
        '-executeMethod','G1Build.Run','-logFile',('"'+$editorLog+'"')
    ) -WindowStyle Hidden -PassThru
    if(!$unity.WaitForExit(900000)) { Stop-Process -Id $unity.Id; throw 'Unity build timed out' }
    if($unity.ExitCode -ne 0 -or !(Test-Path -LiteralPath $env:HOOPS_G1_BUILD_PATH)) { throw "Build failed: $($unity.ExitCode)" }
    Copy-Item -LiteralPath (Join-Path $scratch 'Build') -Destination $destination -Recurse
    Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'UnityProject/THIRD_PARTY_NOTICES.md') -Destination $destination
    Compress-Archive -Path "$project/Assets","$project/Packages","$project/ProjectSettings" -DestinationPath (Join-Path $evidence 'source.zip')
    Compress-Archive -LiteralPath (Join-Path $PSScriptRoot 'UnityProject/THIRD_PARTY_NOTICES.md') -DestinationPath (Join-Path $evidence 'source.zip') -Update
    $player=Start-Process -FilePath (Join-Path $destination 'Hoops.exe') -ArgumentList @(
        '-batchmode','-nographics','--g1-test',('"'+$evidence+'"'),'-logFile',('"'+(Join-Path $evidence 'runtime-tests.log')+'"')
    ) -WindowStyle Hidden -PassThru
    if(!$player.WaitForExit(180000)) { Stop-Process -Id $player.Id; throw 'Runtime tests timed out' }
    $testResult=Get-Content -LiteralPath (Join-Path $evidence 'runtime-tests.json') -Raw | ConvertFrom-Json
    if($player.ExitCode -ne 0 -or $testResult.failed -ne 0) { throw 'Runtime tests failed; inspect saved evidence' }
    Write-Output "Build: $destination"
    Write-Output "Automated runtime checks: $($testResult.passed) passed. Human play review remains separate."
}
finally {
    $env:HOOPS_G1_BUILD_PATH=$oldBuildPath
    $env:HOOPS_G1_BUILD_ID=$oldBuildId
}
