param([string]$AndroidRoot = '..')
$ErrorActionPreference = 'Stop'
node scripts/export-android.mjs $AndroidRoot
if ($LASTEXITCODE -ne 0) { throw 'Export preparation failed' }
$cacheRoot = Join-Path $env:USERPROFILE '.gradle/caches/modules-2/files-2.1'
function Find-Jar([string]$group,[string]$artifact,[string]$version) {
  return (Get-ChildItem -LiteralPath (Join-Path $cacheRoot "$group/$artifact/$version") -Recurse -Filter "$artifact-$version.jar" | Select-Object -First 1).FullName
}
$compiler = Find-Jar 'org.jetbrains.kotlin' 'kotlin-compiler-embeddable' '2.1.20'
$stdlib = Find-Jar 'org.jetbrains.kotlin' 'kotlin-stdlib' '2.1.20'
$runtime = Find-Jar 'org.jetbrains.kotlin' 'kotlin-script-runtime' '2.1.20'
$daemon = Find-Jar 'org.jetbrains.kotlin' 'kotlin-daemon-embeddable' '2.1.20'
$trove = Find-Jar 'org.jetbrains.intellij.deps' 'trove4j' '1.0.20200330'
$annotations = Find-Jar 'org.jetbrains' 'annotations' '13.0'
$coroutines = Find-Jar 'org.jetbrains.kotlinx' 'kotlinx-coroutines-core-jvm' '1.8.0'
$gson = Find-Jar 'com.google.code.gson' 'gson' '2.11.0'
$javaBin = 'C:/Program Files/Android/Android Studio/jbr/bin/java.exe'
if (!(Test-Path -LiteralPath $javaBin)) { $javaBin = 'java' }
$compilerClasspath = @($compiler,$stdlib,$runtime,$daemon,$trove,$annotations,$coroutines) -join ';'
$appClasspath = @($stdlib,$gson,$annotations) -join ';'
$sources = @(Get-ChildItem -LiteralPath '.content-export' -Filter '*.kt' | ForEach-Object {$_.FullName})
& $javaBin -cp $compilerClasspath org.jetbrains.kotlin.cli.jvm.K2JVMCompiler -no-stdlib -no-reflect -classpath $appClasspath -d .content-export/export.jar @sources
if ($LASTEXITCODE -ne 0) { throw 'Kotlin compilation failed' }
& $javaBin -cp ".content-export/export.jar;$appClasspath" ExportKt .content-export/content.json
if ($LASTEXITCODE -ne 0) { throw 'Kotlin export failed' }
node scripts/export-android.mjs $AndroidRoot --assets
if ($LASTEXITCODE -ne 0) { throw 'Asset export failed' }
Add-Type -AssemblyName System.Drawing
foreach ($item in (Get-Content -Raw .content-export/bmp.json | ConvertFrom-Json)) {
  $image = [System.Drawing.Image]::FromFile($item.source)
  try { $image.Save($item.target,[System.Drawing.Imaging.ImageFormat]::Png) } finally { $image.Dispose() }
}
