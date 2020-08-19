import React, { useState, useEffect } from "react";
import IconButton from '@material-ui/core/IconButton'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import PauseIcon from '@material-ui/icons/Pause'

const useAudio = (src: string) => {
  const [audio] = useState(new Audio(src));
  const [playing, setPlaying] = useState(true);

  audio.volume = .05;

  const toggle = (): void => {setPlaying(!playing)};

  useEffect(() => {
    if (src.localeCompare(audio.src))
      audio.src = src;
  }, [src, audio.src]);

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

  return {playing, toggle};
};

type PlayerProps = {
    url: string
};

const Player = (props: PlayerProps): React.ReactElement => {
  console.log(props.url)
  const {playing, toggle} = useAudio(props.url);

  return (
    <IconButton onClick={() => {toggle()}}>
        {playing ? <PauseIcon/> : <PlayArrowIcon/>}
    </IconButton>
  )
};

export default Player;