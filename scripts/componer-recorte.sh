#!/bin/zsh
# componer-recorte.sh FONDO RECORTE SALIDA X ABAJO ANCHO CORTE [BYN]
# Mete un recorte PNG (foto de estudio sin fondo) EN la escena, sin halo de contorno (Manuel, 4-nov-2026: el glow
# «se ve muy chafa, como hecho con Canva»): corte en cintura/pecho (CORTE = fracción de alto), borde de corte en ABAJO
# (px de la lámina; normalmente el borde inferior, 1350), color y luz igualados al fondo, «light wrap» (la luz del
# fondo se mete en el borde), sombra de contacto y grano común. Cuida la piel: tinte suave (TINTE_PCT=6), saturación
# 145 y un toque cálido (las fotos del estudio salen pálidas) (Manuel, 4-nov-2026: «ponle más color a la piel»). FONDO ya en 1080x1350. Requiere ImageMagick 7.
set -e
bg=$1; rc=$2; out=$3; x=$4; abajo=$5; ancho=$6; corte=$7; byn=${8:-0}
t=$(mktemp -d)
w0=$(magick identify -format %w "$rc"); h0=$(magick identify -format %h "$rc")
magick "$rc" -crop ${w0}x$(python3 -c "print(int($h0*$corte))")+0+0 +repage -resize ${ancho}x "$t/p.png"
W=$(magick identify -format %w "$t/p.png"); H=$(magick identify -format %h "$t/p.png"); y=$((abajo-H))
[[ $byn == 1 ]] && magick "$t/p.png" -colorspace Gray -colorspace sRGB "$t/p.png"
# zona del fondo detrás del sujeto: color medio y luminancia para igualar
magick "$bg" -crop ${W}x${H}+${x}+${y} +repage -blur 0x30 "$t/zona.png"
media=$(magick "$t/zona.png" -resize 1x1! -format "#%[hex:u.p{0,0}]" info:)
lb=$(magick "$t/zona.png" -colorspace Gray -format "%[fx:mean]" info:)
ls=$(magick "$t/p.png" -alpha off -colorspace Gray -format "%[fx:mean]" info:)
brillo=$(python3 -c "b=100*(0.62+0.38*min(1.4,max(0.5,($lb+0.08)/max($ls,0.05))));print(int(min(105,max(70,b))))")
magick "$t/p.png" \( +clone -alpha off -fill "$media" -colorize 100 \) -compose blend -define compose:args=${TINTE_PCT:-6} -composite \
  -modulate $brillo,${SAT:-145} -channel R -evaluate multiply ${PIEL_R:-1.10} -channel G -evaluate multiply 1.02 -channel B -evaluate multiply ${PIEL_B:-0.88} +channel \( "$t/p.png" -alpha extract \) -alpha off -compose CopyOpacity -composite "$t/p2.png"
# light wrap: banda interior del borde rellena con el fondo desenfocado, en «screen»
magick "$t/p.png" -alpha extract \( +clone -morphology Erode Disk:7 \) -compose minus -composite -blur 0x6 "$t/banda.png"
magick "$t/zona.png" "$t/banda.png" -alpha off -compose CopyOpacity -composite -channel A -evaluate multiply ${WRAP:-0.4} +channel "$t/wrap.png"
magick "$t/p2.png" "$t/wrap.png" -compose screen -composite \( "$t/p.png" -alpha extract \) -alpha off -compose CopyOpacity -composite "$t/p3.png"
# sombra de contacto suave
magick "$t/p.png" -alpha extract -blur 0x26 -level 0,160% \( +clone -fill black -colorize 100 \) +swap -alpha off -compose CopyOpacity -composite -channel A -evaluate multiply 0.45 +channel "$t/sombra.png"
magick "$bg" "$t/sombra.png" -geometry +$((x+18))+$((y+22)) -compose over -composite "$t/p3.png" -geometry +$x+$y -compose over -composite \
  -attenuate 0.18 +noise Gaussian "$out"
rm -rf "$t"
