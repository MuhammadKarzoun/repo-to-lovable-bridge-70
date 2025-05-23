import Button from '@octobots/ui/src/components/Button';
import EmptyState from '@octobots/ui/src/components/EmptyState';
import Info from '@octobots/ui/src/components/Info';
import { ModalFooter } from '@octobots/ui/src/styles/main';
import { __, getEnv } from 'coreui/utils';
import { MarkdownWrapper } from '@octobots/ui-settings/src/styles';
import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import ReactMarkdown from 'react-markdown';
import { ILeadIntegration } from '@octobots/ui-leads/src/types';

type Props = {
  integration: ILeadIntegration;
  closeModal: () => void;
};

type State = {
  code?: string;
  embedCode?: string;
  buttonCode?: string;
  copied: boolean;
};

const installCodeIncludeScript = (type: string) => {
  const { REACT_APP_CDN_HOST } = getEnv();

  return `
    (function() {
      var script = document.createElement('script');
      script.src = "${REACT_APP_CDN_HOST}/build/${type}Widget.bundle.js";
      script.async = true;

      var entry = document.getElementsByTagName('script')[0];
      entry.parentNode.insertBefore(script, entry);
    })();
  `;
};

const getInstallCode = (brandCode: string, formCode: string) => {
  return `
    <script>
      window.octoSettings = {
        forms: [{
          brand_id: "${brandCode}",
          form_id: "${formCode}"
        }],
      };
      ${installCodeIncludeScript('form')}
    </script>
  `;
};

const getEmbedCode = (formCode: string) => {
  return `
    <div data-octobots-embed="${formCode}" style="width:900px;height:300px"></div>
  `;
};

const getButtonCode = (formCode: string) => {
  return `
    data-octobots-modal="${formCode}"
  `;
};

class Manage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    let code = '';
    let embedCode = '';
    let buttonCode = '';
    const integration = props.integration;

    // showed install code automatically in edit mode
    if (integration._id) {
      const brand = integration.brand;
      const form = integration.form || ({} as any);

      if (brand) {
        code = getInstallCode(brand.code, form.code || '');
      }

      embedCode = getEmbedCode(form.code || '');
      buttonCode = getButtonCode(form.code || '');
    }

    this.state = {
      code,
      embedCode,
      buttonCode,
      copied: false
    };
  }

  onSimulate = () => {
    const { REACT_APP_CDN_HOST } = getEnv();
    const integration = this.props.integration;
    const brand = integration.brand || ({} as ILeadIntegration);
    const form = integration.form || ({} as any);

    window.open(
      `${REACT_APP_CDN_HOST}/test?type=form&brand_id=${brand.code}&form_id=${form.code}`,
      'formrWindow',
      'width=800,height=800'
    );
  };

  renderContent = () => {
    const onCopy = () => this.setState({ copied: true });

    const { code, embedCode, copied, buttonCode } = this.state;

    return (
      <>
        <MarkdownWrapper>
          <ReactMarkdown children={code || ''} />
          {code ? (
            <CopyToClipboard text={code} onCopy={onCopy}>
              <Button btnStyle='primary' icon='copy-1'>
                {copied ? 'Copied' : 'Copy to clipboard'}
              </Button>
            </CopyToClipboard>
          ) : (
            <EmptyState
              icon='copy'
              text='No copyable code. You should connect Form to brand first'
              size='small'
            />
          )}
        </MarkdownWrapper>
        <br />
        <Info>
          {__(
            'If your form style is embedded, additionally paste this code after the main code. '
          )}
        </Info>
        <MarkdownWrapper>
          <ReactMarkdown children={embedCode || ''} />
        </MarkdownWrapper>
        <br />
        <Info>
          {__(
            'If your form style is a popup, additionally paste this code after the main code.'
          )}
        </Info>
        <MarkdownWrapper>
          <ReactMarkdown children={buttonCode || ''} />
        </MarkdownWrapper>
      </>
    );
  };

  render() {
    return (
      <>
        <Info>
          {__(
            ' Paste this main code before the body tag on every page you want this form to appear.'
          )}
        </Info>

        {this.renderContent()}

        <ModalFooter>
          <Button
            btnStyle='primary'
            icon='plus-circle'
            onClick={this.onSimulate}
          >
            Preview
          </Button>

          <Button
            btnStyle='simple'
            icon='times-circle'
            onClick={this.props.closeModal}
          >
            Close
          </Button>
        </ModalFooter>
      </>
    );
  }
}

export default Manage;
