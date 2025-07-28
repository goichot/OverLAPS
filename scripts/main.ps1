

$LapsDllPath = "C:\Windows\System32\laps.dll"
$Sha1Hash = Get-FileHash -Path $LapsDllPath -Algorithm SHA1 | Select-Object -ExpandProperty Hash

$ScriptDir = $PSScriptRoot
$WorkDir = Join-Path $ScriptDir "..\overlapsed\LAPS_$Sha1Hash"
$SigcheckExe = Join-Path $ScriptDir "..\tools\sigcheck.exe"
$CvdumpExe = Join-Path $ScriptDir "..\tools\cvdump.exe"
$PdbListerExe = Join-Path $ScriptDir "..\tools\pdblister.exe"
$PythonOffsetScript = Join-Path $ScriptDir "extract_offsets.py"
$PoCFridaTraceSourceDir = Join-Path $ScriptDir "..\poc_templates\frida-trace"
$PoCFridaSourceDir = Join-Path $ScriptDir "..\poc_templates\frida"

# Create a work directory
New-Item -Path $WorkDir -ItemType Directory -Force | Out-Null

# Copy laps.dll into the new folder
$CopiedDllPath = Join-Path -Path $WorkDir -ChildPath "laps.dll"
Copy-Item -Path $LapsDllPath -Destination $CopiedDllPath -Force

# Get file info via sigcheck
$SigcheckOutput = Join-Path -Path $WorkDir -ChildPath "info.txt"
$Command = "$SigcheckExe -h -accepteula -nobanner $LapsDllPath > $SigcheckOutput"
Invoke-Expression $Command

# Run pdblister.exe
$SymbolServerUrl = "https://msdl.microsoft.com/download/symbols"
$Command = "$PdbListerExe download-single SRV*$WorkDir*$SymbolServerUrl $CopiedDllPath human"
Invoke-Expression $Command

# Check for .pdb file in the expected path
$PdbFolder = Get-ChildItem -Path "$WorkDir\laps.pdb" -Directory | Select-Object -First 1

if (-not $PdbFolder) {
    Write-Error "No PDB folder found in $WorkDir\laps.pdb"
    exit 1
}

$PdbFilePath = Join-Path -Path $PdbFolder.FullName -ChildPath "laps.pdb"

if (-not (Test-Path $PdbFilePath)) {
    Write-Error "PDB file not found at $PdbFilePath"
    exit 1
}

# Run cvdump.exe
$CvdumpOutput = Join-Path -Path $WorkDir -ChildPath "cvdump_out.txt"
& $CvdumpExe $PdbFilePath > $CvdumpOutput

# Run python script
$OffsetsOutput = Join-Path -Path $WorkDir -ChildPath "offsets.txt"
& python $PythonOffsetScript $CvdumpOutput $OffsetsOutput
Remove-Item -Path $CvdumpOutput -Force

# Parse offsets.txt and copy matching PoC files (if any)
$HandlerDestDir = "$WorkDir\__handlers__\laps.dll"

# Ensure destination directory exists
New-Item -Path $HandlerDestDir -ItemType Directory -Force | Out-Null

# Read and process each line in offsets.txt
$OffsetMap = @{}

Get-Content $OffsetsOutput | ForEach-Object {
    if ($_ -match "^(.*)::(.*) => 0x([0-9A-Fa-f]+)$") {
        $class = $matches[1]
        $method = $matches[2]
        $offset = $matches[3].ToLower()  # Make lowercase for filename

        # Save mapping for later use
        $key = "${class}_${method}"
        $OffsetMap[$key] = $offset

        # Construct the source filename pattern
        $regex = "^(reset|get)_lapsDLL_${class}_${method}\.js$"
        $sourceFile = Get-ChildItem -Path $PoCFridaTraceSourceDir -File -ErrorAction SilentlyContinue | Where-Object { $_.Name -match $regex } | Select-Object -First 1

        if ($sourceFile) {
            $destFile = Join-Path -Path $HandlerDestDir -ChildPath "sub_$offset.js"
            Copy-Item -Path $sourceFile.FullName -Destination $destFile -Force
            Write-Output "Copied $($sourceFile.Name) to $destFile"
        } else {
            Write-Warning "No PoC file found for ${class}::${method}"
        }
    }
}

# Copy all generic get_{name}DLL_{function}.js files to __handlers__\{name}.dll\{function}.js
Get-ChildItem -Path $PoCFridaTraceSourceDir -Filter "*_*.js" -File | ForEach-Object {
    if ($_.Name -match "^(reset|get)_(\w+)DLL_(\w+)\.js$") {
        $dllName = $matches[2]  # The {name} before DLL
        $funcName = $matches[3] # The function name

        # Skip if DLL name is 'laps' (case-insensitive)
        if ($dllName -ieq "laps") {
            return
        }

        $destDir = Join-Path -Path "$WorkDir\__handlers__" -ChildPath ("$dllName.dll")
        $destPath = Join-Path -Path $destDir -ChildPath ("$funcName.js")

        New-Item -Path $destDir -ItemType Directory -Force | Out-Null
        Copy-Item -Path $_.FullName -Destination $destPath -Force
        Write-Output "Copied $($_.Name) to $destPath"
    }
}

$PoCFridaOutputDir = Join-Path -Path $WorkDir -ChildPath "frida"
New-Item -Path $PoCFridaOutputDir -ItemType Directory -Force | Out-Null

Get-ChildItem -Path $PoCFridaSourceDir -Filter "*.js" -File | ForEach-Object {
    $file = $_
    $filename = $file.Name

    if ($filename -like "*lapsDLL*") {
        if ($filename -match ".*_lapsDLL_(.+?)_(.+?)\.js$") {
            $class = $matches[1]
            $method = $matches[2]
            $key = "${class}_${method}"

            if ($OffsetMap.ContainsKey($key)) {
                $offset = $OffsetMap[$key]

                $content = Get-Content -Path $file.FullName -Raw
                $content = $content -replace "\bOFFSETVALUE\b", "0x$offset"

                $destFile = Join-Path $PoCFridaOutputDir $filename
                Set-Content -Path $destFile -Value $content -Encoding UTF8

                Write-Output "Patched OFFSET in  $filename -> $destFile"
            } else {
                Write-Warning "No offset found for $class::$method - skipping $filename"
            }
        }
    } else {
        $destPath = Join-Path $PoCFridaOutputDir $filename
        Copy-Item -Path $file.FullName -Destination $destPath -Force
        Write-Output "Copied generic PoC: $filename -> $destPath"
    }
}
