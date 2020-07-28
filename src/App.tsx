import React, { ChangeEvent } from 'react'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import AddIcon from '@material-ui/icons/Add'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import SkipNextIcon from '@material-ui/icons/SkipNext'
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious'
import './App.css'
import { IconButton, TableContainer, Table, TableHead, TableRow, TableCell } from '@material-ui/core'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    test: {
      verticalAlign: "top",
    },
    input: {
      display: "none",
    }
  }),
);

function HandleUpload (event: ChangeEvent<HTMLInputElement>): void {
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
    () => {},
    () => {}
  )

}

function MakeButton (): React.ReactElement {
  const classes = useStyles();

  return (
    <ButtonGroup className={classes.test}>
      <input
        accept="audio/*"
        className={classes.input}
        id="icon-button-file"
        multiple
        type="file"
        onChange={HandleUpload}
      />
      <label htmlFor="icon-button-file">
        <IconButton color="primary" component="span">
          <AddIcon />
        </IconButton>
      </label>
    </ButtonGroup>
  )
}

function MakeButtonGroup (): React.ReactElement {
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
}

function MakeTable (): React.ReactElement {
  const data = ['Col1', 'Col2', 'Col3']

  return (
    <Table>
      <TableHead>
        <TableRow>
          {data.map((datum) => (
            <TableCell>{datum}</TableCell>
          ))}
        </TableRow>
      </TableHead>
    </Table>
  )
}

function App (): React.ReactElement {
  return (
    <div className="App">
        <TableContainer component={Paper}>
        <div className="Button">
          {MakeButton()}
          {MakeButtonGroup()}
        </div>
        <div className="Table">
          {MakeTable()}
        </div>
      </TableContainer>
    </div>
  )
}

export default App
