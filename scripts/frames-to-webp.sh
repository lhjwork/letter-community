#!/usr/bin/env bash
# 작가가 준 PNG 시퀀스(투명 배경) → 애니메이션 WebP 1파일
# 사용: scripts/frames-to-webp.sh <프레임폴더> <출력.webp> [fps=12]
# 예:   scripts/frames-to-webp.sh ~/Downloads/toto_joy public/characters/toto/joy.webp 12
# 요구: brew install webp
set -euo pipefail
dir=$1; out=$2; fps=${3:-12}
ms=$((1000 / fps))
img2webp -loop 0 -lossy -q 85 -d "$ms" "$dir"/*.png -o "$out"
echo "✅ $out ($(ls "$dir"/*.png | wc -l | tr -d ' ')프레임, ${fps}fps, $(du -h "$out" | cut -f1))"
