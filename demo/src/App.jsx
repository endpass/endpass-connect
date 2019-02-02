import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';

import EndpassApp from './components/EndpassApp.jsx';
import styles from './styles';

class App extends React.Component {
  render() {
    const { classes } = this.props;

    return (
      <div className={classes.appWrapper}>
        <Card className={classes.card}>
          <Grid container>
            <Grid xs={12} item>
              <EndpassApp />
            </Grid>
          </Grid>
        </Card>
      </div>
    );
  }
}

export default withStyles(styles)(App);
