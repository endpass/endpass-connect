const styles = theme => ({
  loader: {
    textAlign: 'center',
    padding: theme.spacing.unit * 2,
  },
  appWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    marginBottom: theme.spacing.unit * 1.5,
    width: '100%',
  },
  field: {
    display: 'flex',
    width: '100%',
    marginRight: 0,
    marginLeft: 0,
    marginBottom: theme.spacing.unit * 1.5,
  },
  card: {
    padding: theme.spacing.unit * 2,
    maxWidth: 480,
    margin: `${theme.spacing.unit}px auto`,
  },
  fluid: {
    width: '100%',
  },
  inlineButton: {
    flex: '1 1 auto',
    marginLeft: theme.spacing.unit,
  },
  title: {
    marginBottom: theme.spacing.unit * 3,
  },
})

export default styles
