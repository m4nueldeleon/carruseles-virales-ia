#!/bin/zsh
# Integra un recorte PNG (foto de estudio sin fondo) a una lámina: corta en la cintura/pecho (CORTE = fracción de alto),
# desvanece el borde inferior (FADE), lo tiñe con el tono del fondo (TINTE, PCT) y le pone halo suave (HALO o none;
# HALO_OP=0.35–0.85). BYN=1 lo pasa a blanco y negro. Requiere ImageMagick 7 (magick). Ver DIRECCION-DE-ARTE.md.
# integrar.sh ENTRADA SALIDA CORTE(0-1) ANCHO FADE(0-1) TINTE PCT HALO [BYN]
set -e
in=$1; out=$2; corte=$3; ancho=$4; fade=$5; tinte=$6; pct=$7; halo=$8; byn=${9:-0}
t=$(mktemp -d)
h0=$(magick identify -format %h "$in"); w0=$(magick identify -format %w "$in")
hc=$(python3 -c "print(int($h0*$corte))")
magick "$in" -crop ${w0}x${hc}+0+0 +repage -resize ${ancho}x "$t/p0.png"
H=$(magick identify -format %h "$t/p0.png"); W=$(magick identify -format %w "$t/p0.png")
fh=$(python3 -c "print(max(1,int($H*$fade)))")
magick -size ${W}x${H} xc:white \( -size ${W}x${fh} gradient:white-black \) -gravity south -composite "$t/fade.png"
magick "$t/p0.png" -alpha extract "$t/fade.png" -compose multiply -composite "$t/mask.png"
if [[ $byn == 1 ]]; then mod="-colorspace Gray -colorspace sRGB"; else mod=""; fi
magick "$t/p0.png" -alpha off ${=mod} \( +clone -fill "$tinte" -colorize 100 \) -compose blend -define compose:args=$pct -composite "$t/mask.png" -compose CopyOpacity -composite "$t/p1.png"
pad=60
if [[ $halo != none ]]; then
  magick "$t/p1.png" -bordercolor none -border $pad "$t/p2.png"
  magick "$t/p2.png" -alpha extract -blur 0x22 -level 0,70% "$t/ha.png"
  magick -size $((W+2*pad))x$((H+2*pad)) xc:"$halo" "$t/ha.png" -alpha off -compose CopyOpacity -composite -channel A -evaluate multiply ${HALO_OP:-0.85} +channel "$t/halo.png"
  magick "$t/halo.png" "$t/p2.png" -compose over -composite "$out"
else
  cp "$t/p1.png" "$out"
fi
rm -rf "$t"
