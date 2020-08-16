import React, { ChangeEvent } from 'react'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import AddIcon from '@material-ui/icons/Add'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import SkipNextIcon from '@material-ui/icons/SkipNext'
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious'
import './App.css'
import { Input, IconButton, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'

type AppProps = {

};

type AppState = {
  names: string[];
  selected: boolean[];
  shiftSelected: boolean[];
  shiftPivot: number;
};
class App extends React.Component<AppProps, AppState> {
  state: AppState = {
    names: [],
    selected: [],
    shiftSelected: [],
    shiftPivot: -1,
  };

  useStyles = makeStyles((theme: Theme) =>
    createStyles({
      test: {
        verticalAlign: "top",
      },
      input: {
        display: "none",
      },
      noselect: {
        "user-select": "none",
      },
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
          (data) => {console.log(data); this.setState((state) => ({names: data.names, selected: state.selected.concat(Array(data.names.length).fill(false)), shiftSelected: state.shiftSelected.concat(Array(data.names.length).fill(false))})); console.log(this.state.names)},
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
  
  MakeTable = (props: Object): React.ReactElement => {
    const data = ['Title'];
    const classes = this.useStyles();

    const isSelected = (name: string) => (this.state.selected[this.state.names.indexOf(name)] || this.state.shiftSelected[this.state.names.indexOf(name)]);
  

    const handleClick = (event: React.MouseEvent<unknown>, name: string): void => {
      const clickIdx = this.state.names.indexOf(name);
      
      if (event.ctrlKey) {
        let newSelected: boolean[] = this.state.selected.map((set, idx) => { return set || this.state.shiftSelected[idx]; });
        newSelected[clickIdx] = !newSelected[clickIdx];

        this.setState((state) => ({selected: newSelected, shiftSelected: Array(this.state.shiftSelected.length).fill(false), shiftPivot: clickIdx}));
      } else if (event.shiftKey) {
        let end = this.state.shiftPivot === -1 ? clickIdx : this.state.shiftPivot;
        const low: number = end > clickIdx ? clickIdx : end;
        const high: number = end > clickIdx ? end : clickIdx;
        let newSelected: boolean[] = Array(this.state.shiftSelected.length).fill(false);
        if (low !== high)
          newSelected.splice(low, high-low+1, ...Array(high-low+1).fill(true));
        
        this.setState((state) => ({shiftSelected: newSelected}));
      } else {
        let newSelected: boolean[] = Array(this.state.selected.length).fill(false);
        newSelected[clickIdx] = true;
        this.setState((state) => ({selected: newSelected, shiftSelected: Array(this.state.shiftSelected.length).fill(false), shiftPivot: clickIdx}));
      }
    };
  
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
            <TableRow 
              onClick={(event) => {handleClick(event, row)}}
              selected={isSelected(row)}
              key={row}>
              <TableCell align="left" className={classes.noselect}>{row}</TableCell>
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
          (data) => {console.log(data); this.setState((state) => ({names: data.names, selected: Array(data.names.length).fill(false), shiftSelected: Array(data.names.length).fill(false)})); console.log(this.state.names)},
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
            <this.MakeTable />
          </div>
        </TableContainer>
      </div>
    )
  }

}

export default App
