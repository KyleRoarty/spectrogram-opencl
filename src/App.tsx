import React, { ChangeEvent, useState } from 'react'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import AddIcon from '@material-ui/icons/Add'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import SkipNextIcon from '@material-ui/icons/SkipNext'
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious'
import './App.css'
import { Input, IconButton, TableContainer, Table, TableHead, TableRow, TableCell, TableBody} from '@material-ui/core'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'

type AppProps = {

};

type AppState = {
  names: [];
};
class App extends React.Component<AppProps, AppState> {
  state: AppState = {
    names: [],
  };

  useStyles = makeStyles((theme: Theme) =>
    createStyles({
      test: {
        verticalAlign: "top",
      },
      input: {
        display: "none",
      }
    }),
  );
  
  
  HandleUpload = (event: ChangeEvent<HTMLInputElement>): void => {
    event.preventDefault()
    const data = new FormData();
    if (event?.target?.files != null){
      Array.from(event.target.files).forEach(file => data.append('file', file))
      Array.from(event.target.files).forEach(file => console.log(file))
      console.log(data)
    }
    fetch('/upload', {
      method: 'POST',
      body: data,
    }).then(
      (res) => {res.json().then(
          (data) => {console.log(data); this.setState((state) => ({names: data.names})); console.log(this.state.names)},
          () => {console.log("Err1")}
        )},
      () => {console.log("Err2")}
    )
  
  };
  
  MakeButton = (props: Object): React.ReactElement => {
    const classes = this.useStyles();
    
    return (
      <ButtonGroup className={classes.test}>
        <Input
          inputProps={{
            input: { accept: "audio/*" ,
                     multiple: true }
          }}
          className={classes.input}
          id="icon-button-file"
          type="file"
          onChange={this.HandleUpload}
          color="primary"
        />
        <label htmlFor="icon-button-file">
          <IconButton color="primary" component="span">
            <AddIcon />
          </IconButton>
        </label>
      </ButtonGroup>
    )
  };
  
  MakeButtonGroup = (props: Object): React.ReactElement => {
    return (
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
    )
  };
  
  MakeTable = (): React.ReactElement => {
    const data = ['Title']
  
    return (
      <Table
        size='small'
        style={{
          width: 1200
        }}>
        <TableHead>
          <TableRow>
            {data.map((datum) => (
              <TableCell
                align="center">
                {datum}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {this.state.names.map((row) => (
            <TableRow key={row}>
              <TableCell align="left">{row}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  };

  componentDidMount (): void {
    fetch('/get-data', {
      method: 'GET',
    }).then(
      (res) => {res.json().then(
          (data) => {console.log(data); this.setState((state) => ({names: data.names})); console.log(this.state.names)},
          () => {console.log("Err1")}
        )},
      () => {console.log("Err2")}
    )
  }

  render (): React.ReactElement {
    return (
      <div className="App">
          <TableContainer component={Paper}>
          <div className="Button">
            <this.MakeButton />
            <this.MakeButtonGroup />
          </div>
          <div className="Table">
            {this.MakeTable()}
          </div>
        </TableContainer>
      </div>
    )
  }

}

export default App
