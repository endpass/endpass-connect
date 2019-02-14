import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';

import Connect from '../../../dist/endpass-connect.esm';
import web3 from '../utils/web3';

import AuthForm from './AuthForm.jsx';
import EndpassForm from './EndpassForm.jsx';
import styles from '../styles';

class EndpassApp extends React.Component {
  constructor(props) {
    super(props);

    this.initConnect();
    this.state = {
      form: {
        from: '',
        message: '',
        signature: '',
      },
      accounts: [],
      currentId: 1,
      authorized: null,
      error: null,
    };

    this.errorNotification = this.errorNotification.bind(this);
    this.sign = this.sign.bind(this);
    this.signTypedData = this.signTypedData.bind(this);
    this.personalSign = this.personalSign.bind(this);
    this.recover = this.recover.bind(this);
    this.requestAccount = this.requestAccount.bind(this);
    this.onClickSignInButton = this.onClickSignInButton.bind(this);
    this.onClickSignOutButton = this.onClickSignOutButton.bind(this);

    this.onChangeEndpassForm = this.onChangeEndpassForm.bind(this);
  }

  async componentDidMount() {
    await this.getAccountDataAndUpdateProviderSettings();
  }

  initConnect() {
    this.connect = new Connect({
      appUrl: 'https://auth-dev.endpass.com',
    });

    window.web3 = web3;
  }

  async getAccountDataAndUpdateProviderSettings() {
    try {
      const { activeAccount, activeNet } = await this.connect.getAccountData();
      const connectProvider = this.connect.extendProvider(
        web3.providers.HttpProvider,
      );

      web3.setProvider(connectProvider);

      this.connect.setProviderSettings({
        activeAccount,
        activeNet,
      });

      this.setState({
        ...this.state,
        authorized: true,
        accounts: [activeAccount],
        form: {
          ...this.state.form,
          from: activeAccount,
        },
      });
    } catch (err) {
      console.log(err);
      this.setState({
        ...this.state,
        authorized: false,
        accounts: [],
        accountData: null,
      });
    }
  }

  /* eslint-disable-next-line */
  isNewWeb3() {
    return !Array.isArray(window.web3.accounts);
  }

  /* eslint-disable-next-line */
  errorNotification() {
    /* eslint-disable */
    new Notification('Action denied', {
      body: 'An error occured, see console for more details',
    });
    /* eslint-enable */
  }

  makeRequest(method, params, callback) {
    const { currentId } = this.state;
    (window.ethereum || window.web3.currentProvider).sendAsync(
      {
        id: currentId,
        jsonrpc: '2.0',
        method,
        params,
      },
      callback,
    );
  }

  recover() {
    const { message, signature } = this.state.form;

    window.web3.eth.personal.ecRecover(message, signature, (err, res) => {
      if (err) {
        this.errorNotification();
        console.error(err);
        return;
      }

      alert(`Address verified. Recovered address: ${res}`);
    });
  }

  sign() {
    const { from, message } = this.state.form;

    window.web3.eth.sign(message, from, (err, res) => {
      if (err) {
        this.errorNotification();
        console.error(err);
        return;
      }

      this.setState(state => ({
        ...state,
        signature: res,
      }));
    });
  }

  // legacy EIP
  signTypedData() {
    const { from } = this.state;
    const typedData = [
      {
        type: 'string',
        name: 'Message',
        value: 'Hi, Alice!',
      },
      {
        type: 'uint32',
        name: 'A number',
        value: '1337',
      },
    ];

    this.setState({
      ...this.state,
      form: {
        ...this.state.form,
        message: JSON.stringify(typedData, null, 2),
      },
    });

    this.makeRequest('eth_signTypedData', [typedData, from], (err, res) => {
      if (err) {
        this.errorNotification();
        console.error(err);
        return;
      }

      this.setState(state => ({
        ...state,
        form: {
          ...state.form,
          signature: res.result,
        },
      }));
    });
  }

  personalSign() {
    const { form } = this.state;

    window.web3.eth.personal.sign(form.message, form.from, '', (err, res) => {
      if (err) {
        this.errorNotification();
        console.error(err);
        return;
      }

      this.setState(state => ({
        ...state,
        form: {
          ...state.form,
          signature: res,
        },
      }));
    });
  }

  requestAccount() {
    window.web3.eth.getAccounts((err, res) => {
      if (err) {
        this.errorNotification();
        console.error(err);
        return;
      }

      this.setState(state => ({
        ...state,
        accounts: res,
        form: {
          ...state.form,
          from: res[0] || null,
        },
      }));
    });
  }

  onChangeEndpassForm(data) {
    this.setState({
      ...this.state,
      form: {
        ...this.state.form,
        ...data,
      },
    });
  }

  async onClickSignInButton() {
    try {
      await this.connect.auth();
      await this.getAccountDataAndUpdateProviderSettings();

      this.setState({
        ...this.state,
        error: null,
      });
    } catch (err) {
      this.setState({
        ...this.state,
        error: err.toString(),
      });
    }
  }

  async onClickSignOutButton() {
    try {
      await this.connect.logout();

      this.setState({
        ...this.state,
        form: {
          from: '',
          message: '',
          signature: '',
        },
        authorized: false,
        accountData: null,
      });
    } catch (err) {
      this.setState({
        ...this.state,
        error: err.toString(),
      });
    }
  }

  renderContent() {
    const { authorized, form, message, signature, accounts } = this.state;
    const { classes } = this.props;

    if (authorized === null) {
      return (
        <div className={classes.loader}>
          <CircularProgress />
        </div>
      );
    }

    return (
      <div>
        {authorized ? (
          <EndpassForm
            form={form}
            message={message}
            signature={signature}
            accounts={accounts}
            onSign={this.sign}
            onSignTypedData={this.signTypedData}
            onRecover={this.recover}
            onPresonalSign={this.personalSign}
            onRequestAccount={this.requestAccount}
            onSignOut={this.onClickSignOutButton}
            onChange={this.onChangeEndpassForm}
          />
        ) : (
          <AuthForm onSignIn={this.onClickSignInButton} />
        )}
      </div>
    );
  }

  render() {
    const { error } = this.state;
    const { classes } = this.props;

    return (
      <div>
        {error && (
          <Typography className={classes.row} color="error" variant="caption">
            {error}
          </Typography>
        )}
        {this.renderContent()}
      </div>
    );
  }
}

export default withStyles(styles)(EndpassApp);
