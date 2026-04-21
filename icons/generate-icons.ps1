Add-Type -AssemblyName System.Drawing

$outDir = $PSScriptRoot

function New-PawIcon {
    param(
        [int]$Size,
        [string]$OutPath,
        [bool]$Maskable = $false
    )

    $bmp = New-Object System.Drawing.Bitmap $Size, $Size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode  = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    # --- Cream yellow background ---
    $bgTop = [System.Drawing.Color]::FromArgb(255, 243, 199)   # #fff3c7
    $bgBottom = [System.Drawing.Color]::FromArgb(253, 230, 138) # #fde68a
    $rect = New-Object System.Drawing.Rectangle 0, 0, $Size, $Size
    $grad = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rect,
        $bgTop,
        $bgBottom,
        [System.Drawing.Drawing2D.LinearGradientMode]::Vertical
    )
    if ($Maskable) {
        $g.FillRectangle($grad, $rect)
    } else {
        $radius = [int]($Size * 0.22)
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        $path.AddArc(0, 0, $radius * 2, $radius * 2, 180, 90)
        $path.AddArc($Size - $radius * 2, 0, $radius * 2, $radius * 2, 270, 90)
        $path.AddArc($Size - $radius * 2, $Size - $radius * 2, $radius * 2, $radius * 2, 0, 90)
        $path.AddArc(0, $Size - $radius * 2, $radius * 2, $radius * 2, 90, 90)
        $path.CloseFigure()
        $g.FillPath($grad, $path)
    }

    # Safe zone for maskable icons
    $scale = if ($Maskable) { 0.72 } else { 0.92 }
    $innerSize = $Size * $scale
    $cx = $Size / 2
    $cy = $Size / 2

    # --- Paw print in warm brown ---
    $pawColor = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(146, 94, 56)) # #925e38

    # Main pad (bottom, larger, rounded triangle-ish shape via ellipse)
    $padW = $innerSize * 0.48
    $padH = $innerSize * 0.38
    $padX = $cx - $padW / 2
    $padY = $cy + $innerSize * 0.03
    $g.FillEllipse($pawColor, [float]$padX, [float]$padY, [float]$padW, [float]$padH)

    # Toes: 4 ovals arranged in an arc above the pad
    $toeW = $innerSize * 0.17
    $toeH = $innerSize * 0.22
    $toeArcR = $innerSize * 0.30  # distance from center to toe center
    $toeTopY = $cy - $innerSize * 0.18  # vertical anchor for toes

    # Outer toes (angled outward)
    $outerOffsetX = $innerSize * 0.26
    $outerY = $toeTopY + $innerSize * 0.08
    # Inner toes (more vertical)
    $innerOffsetX = $innerSize * 0.09
    $innerY = $toeTopY - $innerSize * 0.02

    # Draw 4 toes: outer-left, inner-left, inner-right, outer-right
    $toePositions = @(
        @{ x = $cx - $outerOffsetX - $toeW/2; y = $outerY - $toeH/2 },
        @{ x = $cx - $innerOffsetX - $toeW/2; y = $innerY - $toeH/2 },
        @{ x = $cx + $innerOffsetX - $toeW/2; y = $innerY - $toeH/2 },
        @{ x = $cx + $outerOffsetX - $toeW/2; y = $outerY - $toeH/2 }
    )
    foreach ($t in $toePositions) {
        $g.FillEllipse($pawColor, [float]$t.x, [float]$t.y, [float]$toeW, [float]$toeH)
    }

    $bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $g.Dispose()
    $bmp.Dispose()
    $grad.Dispose()
    Write-Host "Generated: $OutPath"
}

New-PawIcon -Size 192 -OutPath (Join-Path $outDir "icon-192.png") -Maskable $false
New-PawIcon -Size 512 -OutPath (Join-Path $outDir "icon-512.png") -Maskable $false
New-PawIcon -Size 512 -OutPath (Join-Path $outDir "icon-maskable-512.png") -Maskable $true
Write-Host "Done."
