/**
 * Alert label component file
 *
 * @package    src/components
 * @author     WangTuring <wangwang@turing.com>
 * @copyright  2018 Turing Company
 * @license    Turing License
 * @version    2.0
 * @link       https://turing.ly
 */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import ErrorIcon from '@material-ui/icons/Error'
import InfoIcon from '@material-ui/icons/Info'
import WarningIcon from '@material-ui/icons/Warning'

/**
 * Component style sheets
 */
const styles = theme => ({
  success: {
    color: '#3c763d',
    backgroundColor: '#dff0d8',
    border: '1px solid #d6e9c6',
  },
  error: {
    color: '#a94442',
    backgroundColor: '#f2dede',
    border: '1px solid #ebccd1',
  },
  info: {
    color: '#31708f',
    backgroundColor: '#d9edf7',
    border: '1px solid #bce8f1',
  },
  warning: {
    color: '#8a6d3b',
    backgroundColor: '#fcf8e3',
    border: '1px solid #faebcc',
  },
  alertBox: {
    marginBottom: theme.spacing.unit * 2
  },
  labelBox: {
    paddingLeft: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2,
    paddingTop: theme.spacing.unit * 1.5,
    paddingBottom: theme.spacing.unit * 1.5,
    display: 'flex',
    alignItems: 'center'
  },
  icon: {
    fontSize: 20,
    opacity: 0.9,
    marginRight: theme.spacing.unit
  }
})

/**
 * Alert label component class
 *
 * This class will be render view for alert label
 *
 * @category  Component
 * @author    WangTuring <wangwang@turing.com>
 */
class AlertLabel extends Component {
  /**
   * Render function to view this component
   */
  render() {
    const { classes } = this.props
    const alertType = {
      success: classes.success,
      error: classes.error,
      info: classes.info,
      warning: classes.warning
    }
    const variantIcon = {
      success: CheckCircleIcon,
      error: ErrorIcon,
      warning: WarningIcon,
      info: InfoIcon
    }
    const Icon = variantIcon[this.props.type];

    return (
      <React.Fragment>
        {this.props.show 
          ? <div className={classes.alertBox}>
              <Paper elevation={0} className={alertType[this.props.type]}>
                <Typography color="inherit" className={classes.labelBox}>
                  <Icon className={classes.icon} />
                  {this.props.label}&nbsp;
                  {this.props.link === "true" && <a href={this.props.url} target="_blank" rel="noopener noreferrer">{this.props.url}</a>}
                </Typography>
              </Paper>
            </div>
          : <div></div>
        }
      </React.Fragment>
    )
  }
}

AlertLabel.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(AlertLabel)
