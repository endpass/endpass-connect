import React, { Fragment } from 'react';

import { withStyles } from '@material-ui/core/styles';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Input from '@material-ui/core/Input';
import Grid from '@material-ui/core/Grid';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';

import styles from '../styles';

class EndpassForm extends React.Component {
  constructor(props) {
    super(props);
    this.onChangeInputByName = this.onChangeInputByName.bind(this);
  }

  onChangeInputByName(name) {
    const { onChange } = this.props;

    return e => {
      onChange({
        ...this.props.form,
        [name]: e.target.value,
      });
    };
  }

  renderAccountsSelect() {
    const { classes, accounts, form } = this.props;

    return (
      <Select
        className={classes.fluid}
        value={form.from}
        disabled={accounts.length === 0}
        onChange={this.onChangeInputByName('from')}
      >
        <MenuItem value="" disabled>
          Select account
        </MenuItem>
        {accounts.map(account => (
          <MenuItem key={account} value={account}>
            {account}
          </MenuItem>
        ))}
      </Select>
    );
  }

  render() {
    const {
      classes,
      form,
      onSign,
      onSignTypedData,
      onRecover,
      onPresonalSign,
      onSignOut,
      onRequestAccount,
    } = this.props;

    return (
      <Fragment>
        {this.renderAccountsSelect()}
        <Grid className={classes.row} container>
          <Grid item xs={6}>
            <Input
              multiline
              rows={8}
              className={classes.fluid}
              disabled={!form.from}
              value={form.message}
              placeholder="Enter message to sign..."
              onChange={this.onChangeInputByName('message')}
            />
          </Grid>
          <Grid item xs={6}>
            <Input
              multiline
              rows={8}
              className={classes.fluid}
              value={form.signature}
              placeholder="Signed data..."
              onChange={this.onChangeInputByName('signature')}
            />
          </Grid>
        </Grid>
        <Grid>
          <Grid item xs={12}>
            <Button
              className={classes.row}
              color="primary"
              variant="contained"
              onClick={onRequestAccount}
            >
              eth_accounts
            </Button>
          </Grid>
        </Grid>
        <FormControl className={classes.field} component="fieldset">
          <FormLabel className={classes.field} component="legend">
            Common
          </FormLabel>
          <Grid>
            <Grid item xs={12}>
              <Button
                className={classes.row}
                variant="contained"
                disabled={!form.from || !form.message}
                onClick={onSign}
              >
                eth_sign
              </Button>
            </Grid>
          </Grid>
        </FormControl>
        <FormControl className={classes.field} component="fieldset">
          <FormLabel className={classes.field} component="legend">
            Legacy typed data (EIP-712 jsonrpc accepted standard)
          </FormLabel>
          <Grid>
            <Grid item xs={12}>
              <Button
                className={classes.row}
                variant="contained"
                disabled={!form.from}
                onClick={onSignTypedData}
              >
                eth_signTypedData
              </Button>
            </Grid>
          </Grid>
        </FormControl>
        <FormControl className={classes.field} component="fieldset">
          <FormLabel className={classes.field} component="legend">
            Personal
          </FormLabel>
          <Grid container spacing={8}>
            <Grid item xs={6}>
              <Button
                className={classes.row}
                variant="contained"
                disabled={!form.from || !form.message}
                onClick={onPresonalSign}
              >
                personal_sign
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                className={classes.row}
                variant="contained"
                disabled={!form.signature}
                onClick={onRecover}
              >
                personal_ecRecover
              </Button>
            </Grid>
          </Grid>
        </FormControl>
        <FormControl className={classes.field} component="fieldset">
          <Grid>
            <Grid item xs={12}>
              <Button
                className={classes.row}
                variant="contained"
                color="secondary"
                onClick={onSignOut}
              >
                Sign out from Endpass
              </Button>
            </Grid>
          </Grid>
        </FormControl>
      </Fragment>
    );
  }
}

export default withStyles(styles)(EndpassForm);
