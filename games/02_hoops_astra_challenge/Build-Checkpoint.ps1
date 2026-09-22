param(
    [Parameter(Mandatory=$true)][string]$EditorPath,
    [Parameter(Mandatory=$true)][string]$ScratchPath,
    [Parameter(Mandatory=$true)][string]$BuildId,
    [string[]]$Reviews=@('runtime','meter')
)
$ErrorActionPreference='Stop'
if($BuildId -notmatch '^g[23]-[0-9]{8}-[0-9]{2}$') { throw 'Invalid checkpoint id' }
$evidence=Join-Path $PSScriptRoot "Evidence/$BuildId"
$destination=Join-Path $PSScriptRoot "Builds/$BuildId"
if((Test-Path -LiteralPath $evidence) -or (Test-Path -LiteralPath $destination)) { throw 'Checkpoint exists' }
$project=Join-Path $ScratchPath 'UnityProject'
if(!(Test-Path -LiteralPath "$project/ProjectSettings/ProjectVersion.txt")) { throw 'Existing scratch project required' }
New-Item -ItemType Directory -Path $evidence | Out-Null
$ScratchPath | Set-Content -LiteralPath "$evidence/scratch-path.local"
Copy-Item -Path "$PSScriptRoot/UnityProject/Assets/_Game/Scripts/*" -Destination "$project/Assets/_Game/Scripts" -Force
Copy-Item -Path "$PSScriptRoot/UnityProject/Assets/_Game/Editor/*" -Destination "$project/Assets/_Game/Editor" -Force
if(Test-Path -LiteralPath "$PSScriptRoot/UnityProject/Assets/_Game/Audio") {
    New-Item -ItemType Directory -Path "$project/Assets/_Game/Audio" -Force | Out-Null
    Copy-Item -Path "$PSScriptRoot/UnityProject/Assets/_Game/Audio/*" -Destination "$project/Assets/_Game/Audio" -Force
}
$oldPath=$env:HOOPS_G1_BUILD_PATH; $oldId=$env:HOOPS_G1_BUILD_ID
try {
    $env:HOOPS_G1_BUILD_PATH=Join-Path $ScratchPath "Build-$BuildId/Hoops.exe"
    $env:HOOPS_G1_BUILD_ID=$BuildId
    $builder=Start-Process -FilePath $EditorPath -ArgumentList @('-batchmode','-nographics','-projectPath',('"'+$project+'"'),'-executeMethod','G1Build.Run','-logFile',('"'+$evidence+'/editor.log"')) -WindowStyle Hidden -PassThru
    if(!$builder.WaitForExit(900000)) { Stop-Process -Id $builder.Id; throw 'Build timeout' }
    $builder.Refresh()
    @{exitCode=$builder.ExitCode;utc=[DateTime]::UtcNow.ToString('O')} | ConvertTo-Json | Set-Content -LiteralPath "$evidence/build-exit.json"
    if($builder.ExitCode -ne 0) { throw 'Build failed' }
    Copy-Item -LiteralPath (Split-Path $env:HOOPS_G1_BUILD_PATH) -Destination $destination -Recurse
    Copy-Item -LiteralPath "$PSScriptRoot/UnityProject/THIRD_PARTY_NOTICES.md" -Destination $destination
    Copy-Item -Path "$project/Assets/_Game/*" -Destination "$PSScriptRoot/UnityProject/Assets/_Game" -Recurse -Force
    Compress-Archive -Path "$project/Assets","$project/Packages","$project/ProjectSettings" -DestinationPath "$evidence/source.zip"
    Compress-Archive -LiteralPath "$PSScriptRoot/UnityProject/THIRD_PARTY_NOTICES.md" -DestinationPath "$evidence/source.zip" -Update
    @("$evidence/source.zip","$destination/Hoops.exe","$destination/Hoops_Data/Managed/Assembly-CSharp.dll") | ForEach-Object {
        $file=Get-Item -LiteralPath $_
        @{path=[IO.Path]::GetRelativePath($PSScriptRoot,$file.FullName);sha256=(Get-FileHash -LiteralPath $_ -Algorithm SHA256).Hash;bytes=$file.Length}
    } | ConvertTo-Json | Set-Content -LiteralPath "$evidence/sha256.json"
    foreach($review in $Reviews) {
        if($review -notin @('runtime','meter','balance','motion','visual','camera','defense','actions','facing','orbit','world','audio','touch')) { throw 'Unknown review' }
        $folder=Join-Path $evidence $review
        New-Item -ItemType Directory -Path $folder | Out-Null
        $flag=switch($review) {'runtime' {'--g1-test'} 'visual' {'--g2-review'} 'world' {'--g3-world'} 'audio' {'--g3-audio'} default {"--g2-$review"}}
        $arguments=@($flag,('"'+$folder+'"'),'-logFile',('"'+$folder+'/player.log"'))
        $style='Normal'
        if($review -in @('runtime','balance')) {$arguments=@('-batchmode','-nographics')+$arguments; $style='Hidden'}
        $player=Start-Process -FilePath "$destination/Hoops.exe" -ArgumentList $arguments -WindowStyle $style -PassThru
        if(!$player.WaitForExit(600000)) { Stop-Process -Id $player.Id; throw "$review timeout" }
        $player.Refresh()
        @{exitCode=$player.ExitCode;utc=[DateTime]::UtcNow.ToString('O')} | ConvertTo-Json | Set-Content -LiteralPath "$folder/exit.json"
        Write-Output "$review exit=$($player.ExitCode)"
        if($player.ExitCode -ne 0) { throw "$review failed; evidence retained" }
    }
    Write-Output "CHECKPOINT COMPLETE $BuildId"
} finally {$env:HOOPS_G1_BUILD_PATH=$oldPath; $env:HOOPS_G1_BUILD_ID=$oldId}
