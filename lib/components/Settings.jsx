import React, { Component, PropTypes } from 'react';
import Formsy from 'formsy-react';
import { Link } from 'react-router';

import FormInput from './ui/FormInput.jsx';
import enableHtmlTag from '../utils/enableHtmlTag';

import Crossing from 'crossing';
import urlTable from '../containers/urlTable';
const urls = new Crossing(new RegExp(':([A-Za-z0-9-_%]{1,})'));
urls.load(urlTable);

class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = { canSubmit: false };
  }

  enableButton() {
    this.setState({ canSubmit: true });
  }
  disableButton() {
    this.setState({ canSubmit: false });
  }
  submit (model) {
    this.props.saveSettings(model);
  }

  render() {
    const submitText = (this.state.canSubmit) ? 'Save' : 'Invalid';
    const { setting } = this.props;
    return (
      <Formsy.Form
        onValidSubmit={this.submit.bind(this)}
        onValid={this.enableButton.bind(this)}
        onInvalid={this.disableButton.bind(this)}
        className='settings'
        >
        <FormInput
          name='apiendpoint'
          placeholder={setting.defaultApiendpoint}
          validationError='Api Endpoint is required'
          value={setting.apiendpoint}
          required
          />
        <FormInput
          name='webendpoint'
          placeholder={setting.defaultWebendpoint}
          validationError='Web Endpoint is required'
          value={setting.webendpoint}
          required
          />
        <FormInput
          name='token'
          type='password'
          value={setting.token}
          />
        <a
          href={setting.tokenUrl}
          >
          Get AccessToken
        </a>.
        <button
          type='submit'
          {...enableHtmlTag(this.state.canSubmit)}
          >
          {submitText}
        </button>

        <Link to={urls.get('home')}>home</Link>, <Link to={urls.get('debug')}>debug</Link>
      </Formsy.Form>
    );
  }
}

Settings.propTypes = {
  setting: PropTypes.object.isRequired,
  saveSettings: PropTypes.func.isRequired,
  doNothing: PropTypes.func.isRequired,
  updateSettings: PropTypes.func.isRequired
};

export default Settings;
