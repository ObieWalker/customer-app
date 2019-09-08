/**
 * AuthToken Error Dialog component file
 *
 * @package    src/components
 * @author     YingTuring <ying@turing.com>
 * @copyright  2018 Turing Company
 * @license    Turing License
 * @version    2.0
 * @link       https://turing.ly/
 */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import withMobileDialog from '@material-ui/core/withMobileDialog'

/**
 * AuthToken Error Dialog component class
 *
 * This class will be render view for AuthToken Error dialog on test page
 *
 * @category  Component
 * @author    YingTuring <ying@turing.com>
 */
class ResponsiveDialog extends Component {

  render() {
    const { fullScreen } = this.props

    return (
      <div>
        <Dialog
          fullScreen={fullScreen}
          open={this.props.openOption}
          onClose={this.props.onClose}
          aria-labelledby="responsive-dialog-title"
        >
          <DialogTitle id="responsive-dialog-title">{"Authentication Error"}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Your auth token is invalid or expired. Getting new auth token, you have to Login.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.props.handleLogin()} color="primary" >
              Login
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }
}

ResponsiveDialog.propTypes = {
  fullScreen: PropTypes.bool.isRequired
}

export default withMobileDialog()(ResponsiveDialog)
