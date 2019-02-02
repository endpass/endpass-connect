import React, { Fragment } from 'react'

import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import styles from '../styles'

const AuthForm = ({ classes, onSignIn }) => {
  return (
    <Fragment>
      <Button variant="contained" className={classes.fluid} onClick={onSignIn}>
        Sign in with Endpass
      </Button>
    </Fragment>
  )
}

export default withStyles(styles)(AuthForm)
