import React, { useState, useEffect } from "react";
import VolumeDown from '@material-ui/icons/VolumeDown'
import VolumeUp from '@material-ui/icons/VolumeUp'
import Grid from '@material-ui/core/Grid'
import Slider from '@material-ui/core/Slider'
import { makeStyles } from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton'

type VSProps = {
  updateCallback: (newVol: number) => void;
  initVol: number
};

const useStyles = makeStyles({
  root: {
    width: 200,
  },
  item: {
    display: "flex",
  }
});

const VolSlider = (props: VSProps): React.ReactElement => {
  const [vol, setVol] = useState(props.initVol)
  const classes = useStyles();

  const handleChange = (event: any, newValue: number | number[]) => {
    setVol(newValue as number);
    props.updateCallback(newValue as number);
  }

  return (
    <Grid container spacing={2} className={classes.root} alignItems="center" justify="center">
      <Grid item className={classes.item}>
          <VolumeDown/>
      </Grid>
      <Grid item xs className={classes.item}>
        <Slider value={vol} min={0} step={.01} max={1} onChange={(event, num) => {handleChange(event, num)}} aria-labelledby="continuous-slider"/>
      </Grid>
      <Grid item className={classes.item}>
        <VolumeUp/>
      </Grid>
    </Grid>
  )
};

export {VolSlider as default}