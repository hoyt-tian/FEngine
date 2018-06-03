curl $1 --output temp.gif
mkdir -p $2
ffmpeg -i temp.gif -start_number 0 $2/%d.png