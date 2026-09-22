param([Parameter(Mandatory=$true)][string]$BuildId,[Parameter(Mandatory=$true)][string]$EditorPath,[Parameter(Mandatory=$true)][string]$ScratchPath)
$ErrorActionPreference='Stop'
if($BuildId -notmatch '^web-g3-[0-9]{8}-[0-9]{2}$') {throw 'Invalid build ID'}
$evidence=Join-Path $PSScriptRoot "Evidence/$BuildId"
$destination=Join-Path $PSScriptRoot "Builds/$BuildId"
if((Test-Path $evidence) -or (Test-Path $destination)) {throw 'Checkpoint exists'}
$project=Join-Path $ScratchPath 'UnityProject'
New-Item -ItemType Directory -Path $project,$evidence -Force | Out-Null
foreach($folder in @('Assets','Packages','ProjectSettings')) {
    New-Item -ItemType Directory -Path "$project/$folder" -Force | Out-Null
    Copy-Item -Path "$PSScriptRoot/UnityProject/$folder/*" -Destination "$project/$folder" -Recurse -Force
}
$oldPath=$env:HOOPS_G1_BUILD_PATH;$oldId=$env:HOOPS_G1_BUILD_ID;$oldWeb=$env:HOOPS_WEB_BUILD
try {
    $env:HOOPS_G1_BUILD_PATH=Join-Path $ScratchPath $BuildId;$env:HOOPS_G1_BUILD_ID=$BuildId;$env:HOOPS_WEB_BUILD='1'
    $builder=Start-Process -FilePath $EditorPath -ArgumentList @('-batchmode','-nographics','-buildTarget','WebGL','-projectPath',('"'+$project+'"'),'-executeMethod','G1Build.Run','-logFile',('"'+$evidence+'/editor.log"')) -WindowStyle Hidden -PassThru
    if(!$builder.WaitForExit(1800000)) {Stop-Process -Id $builder.Id;throw 'Web build timeout'}
    $builder.Refresh();@{exitCode=$builder.ExitCode;utc=[DateTime]::UtcNow.ToString('O')} | ConvertTo-Json | Set-Content "$evidence/build-exit.json"
    if($builder.ExitCode -ne 0) {throw 'Web build failed; evidence retained'}
    Copy-Item -LiteralPath $env:HOOPS_G1_BUILD_PATH -Destination $destination -Recurse
    Copy-Item "$PSScriptRoot/UnityProject/THIRD_PARTY_NOTICES.md" "$destination/THIRD_PARTY_NOTICES.md"
    Compress-Archive -Path "$project/Assets","$project/Packages","$project/ProjectSettings" -DestinationPath "$evidence/source.zip"
    $project | Set-Content "$evidence/scratch-project.local"
    Get-ChildItem $destination -File -Recurse | ForEach-Object { @{path=[IO.Path]::GetRelativePath($destination,$_.FullName);bytes=$_.Length;sha256=(Get-FileHash $_.FullName).Hash} } | ConvertTo-Json | Set-Content "$evidence/build-files.json"
    Write-Output "WEB BUILD COMPLETE $BuildId"
} finally { $env:HOOPS_G1_BUILD_PATH=$oldPath;$env:HOOPS_G1_BUILD_ID=$oldId;$env:HOOPS_WEB_BUILD=$oldWeb }
