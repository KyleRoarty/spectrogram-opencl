import React, { useState, useEffect } from "react";
import IconButton from '@material-ui/core/IconButton'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import PauseIcon from '@material-ui/icons/Pause'

const useAudio = () => {
    const [audio] = useState(new Audio());
    const [playing, setPlaying] = useState(false);

    const toggle = (): void => {setPlaying(!playing)};

    const setSource = (url: string): void => { audio.src = url;};

    useEffect(() => {
        playing ? audio.play() : audio.pause();
    });

    useEffect(() => {
        audio.addEventListener('ended', () => setPlaying(false));
        return () => {
            audio.removeEventListener('ended', () => setPlaying(false));
        };
    });

    useEffect(() => {
        audio.addEventListener('error', (e: ErrorEvent) => console.log(e));
    });

    return {playing, toggle, setSource};
};

type PlayerProps = {
    url: string | null
};

const Player = (props: PlayerProps): React.ReactElement => {
    console.log(props.url)
    const {playing, toggle, setSource} = useAudio();
    if (props?.url)
        setSource(props.url) 

    return (
        <IconButton onClick={() => {toggle()}}>
            {playing ? <PauseIcon/> : <PlayArrowIcon/>}
        </IconButton>
    )
};

export default Player;