#!/bin/zsh
# circulo.sh ENTRADA SALIDA DIAMETRO  → imagen en círculo con borde blanco y sombra
set -e; d=$3; r=$((d/2)); B=$((d+24)); t=$(mktemp -d)
magick "$1" -resize ${d}x${d}^ -gravity center -extent ${d}x${d} -alpha set \( -size ${d}x${d} xc:none -fill white -draw "circle $r,$r $r,2" \) -compose DstIn -composite "$t/c.png"
magick -size ${B}x${B} xc:none -fill white -draw "circle $((B/2)),$((B/2)) $((B/2)),1" "$t/c.png" -gravity center -compose over -composite "$t/b.png"
magick "$t/b.png" \( +clone -background black -shadow 60x18+0+14 \) +swap -background none -layers merge +repage "$2"; rm -rf "$t"
