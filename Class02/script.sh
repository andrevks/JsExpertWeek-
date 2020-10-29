ASSETSFOLDER=assets/timeline 

for mediaFile in `ls $ASSETSFOLDER | grep .mp4`; do 
    #cut the file extension and resolution
    FILENAME=$(echo $mediaFile | sed -n 's/.mp4//p' | sed -n 's/-1920x1080//p')
    INPUT=$ASSETSFOLDER/$mediaFile
    #create a folder for each file 
    FOLDER_TARGET=$ASSETSFOLDER/$FILENAME
    mkdir -p $FOLDER_TARGET
    
    #create files with other resolution in this folder
    OUTPUT=$ASSETSFOLDER/$FILENAME/$FILENAME
    #taking the duration of each video file. It's easier to use the duration
    DURATION=$(ffprobe -i $INPUT -show_format -v quiet | sed -n 's/duration=//p')
    
    OUTPUT144=$OUTPUT-$DURATION-144
    OUTPUT360=$OUTPUT-$DURATION-360
    OUTPUT720=$OUTPUT-$DURATION-720

    #(-c:a aac -ac 2)Audio channel, two channnels 
    #(-ab 128k)average bitrate
    #(-b:v 1500k)bitrate
    #(-bufsize 1000k)Every new 1000k the file will be cut into pieces
    #(-vf "scale=-1:720")Filter 

    echo 'redering in 720p'
    ffmpeg -y -i $INPUT \
        -c:a aac -ac 2\
        -vcodec h264 -acodec aac \
        -ab 128k \
        -movflags frag_keyframe+empty_moov+default_base_moof \
        -b:v 1500k \
        -maxrate 1500k \
        -bufsize 1000k \
        -vf "scale=-1:720"\
        -v quiet \
        $OUTPUT720.mp4

    echo 'redering in 360p'
    ffmpeg -y -i $INPUT \
        -c:a aac -ac 2\
        -vcodec h264 -acodec aac \
        -ab 128k \
        -movflags frag_keyframe+empty_moov+default_base_moof \
        -b:v 400k \
        -maxrate 400k \
        -bufsize 400k \
        -vf "scale=-1:360"\
        -v quiet \
        $OUTPUT360.mp4

    echo 'redering in 144p'
    ffmpeg -y -i $INPUT \
        -c:a aac -ac 2 \
        -vcodec h264 -acodec aac \
        -ab 128k \
        -movflags frag_keyframe+empty_moov+default_base_moof\
        -b:v 300k \
        -maxrate 300k \
        -bufsize 300k \
        -vf "scale=256/144" \
        -v quiet \
        $OUTPUT144.mp4
    echo '--- --- --- ---' 
    echo $OUTPUT144.mp4
    echo $OUTPUT360.mp4
    echo $OUTPUT720.mp4
    echo '--- --- --- ---' 

done 