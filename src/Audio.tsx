import React, { useState, useEffect } from "react";
import ButtonGroup from '@material-ui/core/ButtonGroup'
import IconButton from '@material-ui/core/IconButton'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import PauseIcon from '@material-ui/icons/Pause'
import SkipNextIcon from '@material-ui/icons/SkipNext'
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious'
import Slider from '@material-ui/core/Slider'
import VolSlider from './VolumeSlider'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
  root: {
    display: "inline-flex",
    verticalAlign: "top"
  },
  item: {
    display: "flex",
  },
});

const useAudio = (src: string, vol: number) => {
  const [audio] = useState(new Audio());
  const [playing, setPlaying] = useState(true);
  const [time, setTime] = useState<number>(0);
  const [dur, setDur] = useState<number>(0);
  const [canPlay, setCanPlay] = useState<boolean>(false)

  const toggle = (): void => {setPlaying(!playing)};

  useEffect(() => {
    const url: URL = new URL(window.location.protocol + "//" + window.location.host + src)
    if (url.href.localeCompare(audio.src)){
      audio.src = src;
      setCanPlay(false)
    }
  }, [src, audio.src]);

  useEffect(() => {
    if (vol !== audio.volume)
      audio.volume = vol;
  });

  useEffect(() => {
    if (canPlay) {
      if (playing) {
        if (audio.paused) {
          audio.play()
        }
      } else {
        if (!audio.paused) {
          audio.pause()
        }
      }
    }
  });

  useEffect(() => {
    audio.addEventListener('ended', () => setPlaying(false));
    return () => {
        audio.removeEventListener('ended', () => setPlaying(false));
    };
  });

  useEffect(() => {
    audio.addEventListener('timeupdate', () => setTime(audio.currentTime))
  });

  useEffect(() => {
    audio.addEventListener('durationchange', () => setDur(audio.duration))
  });

  useEffect(() => {
    audio.addEventListener('canplaythrough', () => setCanPlay(true))
  });

  return {playing, toggle, time, dur};
};

type PlayerProps = {
    url: string;
    prevCallback: () => void;
    nextCallback: () => void;
    playPauseCallback: (play: boolean) => void;
};

const Player = (props: PlayerProps): React.ReactElement => {
  const [vol, setVol] = useState<number>(0.05);
  const {playing, toggle, time, dur} = useAudio(props.url, vol);
  const styles = useStyles();
  const timeStr = new Date(1000 * time).toISOString().substr(11, 8);
  const durStr = new Date(1000 * dur).toISOString().substr(11, 8);

  const volCallback = (newVol: number): void => {
    setVol(newVol);
  }

  const playPauseClick = (): void => {
    toggle()
    props.playPauseCallback(!playing)
  }

  return (
    <Grid container item xs={11} spacing={1} className={styles.root} alignItems="center" wrap="nowrap">
      <Grid item>
        <ButtonGroup color="primary">
          <IconButton onClick={props.prevCallback}>
            <SkipPreviousIcon />
          </IconButton>
          <IconButton onClick={playPauseClick}>
              {playing ? <PauseIcon/> : <PlayArrowIcon/>}
          </IconButton>
          <IconButton onClick={props.nextCallback}>
            <SkipNextIcon />
          </IconButton>
        </ButtonGroup>
      </Grid>
      <Grid item xs={7} className={styles.item}>
        <Slider value={time} min={0} step={.01} max={dur} aria-labelledby="continuous-slider"/>
      </Grid>
      <Grid item xs={"auto"} className={styles.item}>
        <Typography component={"span"} id="audio-time">
          <Box fontFamily="Monospace">
            {timeStr}/{durStr}
          </Box>
        </Typography>
      </Grid>
      <Grid item xs={1} className={styles.item}>
        <VolSlider updateCallback={volCallback} initVol={0.05}/>
      </Grid>
    </Grid>
  )
};

const DefaultPlayer = (): React.ReactElement => {
  const styles = useStyles()

  const volCallback = (newVol: number): void => {

  }

  return (
    <Grid container item spacing={0} xs={11} className={styles.root} wrap="nowrap">
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