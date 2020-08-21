import React, { useState, useEffect } from "react";
import ButtonGroup from '@material-ui/core/ButtonGroup'
import IconButton from '@material-ui/core/IconButton'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import PauseIcon from '@material-ui/icons/Pause'
import SkipNextIcon from '@material-ui/icons/SkipNext'
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious'
import VolSlider from './VolumeSlider'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
  root: {
    display: "inline-flex",
    verticalAlign: "top"
  },
});

const useAudio = (src: string, vol: number) => {
  const [audio] = useState(new Audio(src));
  const [playing, setPlaying] = useState(true);

  const toggle = (): void => {setPlaying(!playing)};

  useEffect(() => {
    if (src.localeCompare(audio.src))
      audio.src = src;
  }, [src, audio.src]);

  useEffect(() => {
    if (vol !== audio.volume)
      audio.volume = vol;
  });

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
    url: string;
};

const Player = (props: PlayerProps): React.ReactElement => {
  const [vol, setVol] = useState<number>(0.05);
  const {playing, toggle} = useAudio(props.url, vol);
  const styles = useStyles();

  const volCallback = (newVol: number): void => {
    setVol(newVol);
  }

  return (
    <Grid container spacing={0} sm={3} className={styles.root} wrap="nowrap">
      <Grid item>
        <ButtonGroup color="primary">
          <IconButton>
            <SkipPreviousIcon/>
          </IconButton>
          <IconButton onClick={() => {toggle()}}>
              {playing ? <PauseIcon/> : <PlayArrowIcon/>}
          </IconButton>
          <IconButton>
            <SkipNextIcon/>
          </IconButton>
        </ButtonGroup>
      </Grid>
      <VolSlider updateCallback={volCallback} initVol={0.05}/>
    </Grid>
  )
};

const DefaultPlayer = (): React.ReactElement => {
  const styles = useStyles()

  const volCallback = (newVol: number): void => {

  }

  return (
    <Grid container spacing={0} sm={3} className={styles.root} wrap="nowrap">
      <Grid item>
        <ButtonGroup color="primary">
          <IconButton>
            <SkipPreviousIcon/>
          </IconButton>
          <IconButton>
              <PlayArrowIcon/>
          </IconButton>
          <IconButton>
            <SkipNextIcon/>
          </IconButton>
        </ButtonGroup>
      </Grid>
      <VolSlider updateCallback={volCallback} initVol={0.05}/>
    </Grid>
  )
};

export {Player as default, DefaultPlayer};