import Button from '@octobots/ui/src/components/Button';
import Popover from '@octobots/ui/src/components/Popover';
import { IAttachment } from '@octobots/ui/src/types';
import { IBrand } from '@octobots/ui/src/brands/types';
import { IResponseTemplate } from '../../../../../settings/responseTemplates/types';
import Icon from '@octobots/ui/src/components/Icon';
import Modal from '../../../../containers/conversationDetail/responseTemplate/Modal';
import PopoverContent from '../../../../containers/conversationDetail/responseTemplate/PopoverContent';
import React from 'react';
import { ActionIconContainer, ResponseTemplateStyled } from '@octobots/ui-inbox/src/inbox/styles';
import Tip from '@octobots/ui/src/components/Tip';
import { __ } from '@octobots/ui/src/utils/core';
import strip from 'strip';

type Props = {
  brandId?: string;
  onSelect: (responseTemplate?: IResponseTemplate) => void;
  brands: IBrand[];
  attachments?: IAttachment[];
  content?: string;
};

const ResponseTemplate = (props: Props) => {
  const { brands, content, brandId, attachments } = props;

  const saveTrigger = (
    <ActionIconContainer>
      <Tip placement="top" text={__('Save as template')}>
        <Icon icon="file-upload-alt" />
      </Tip>
    </ActionIconContainer>
  );

  const popover = (close) => (
    <div className="popover-template" id="templates-popover">
      <div className='popover-header'>{__('Response Templates')}</div>
      <PopoverContent {...props} onSelectTemplate={close} />
    </div>
  );

  return (
    <>
      <Popover
        placement="left-end"
        closeAfterSelect={true}
        trigger={
          <ActionIconContainer>
            <Tip placement="top" text={__('Response template')}>
              <Icon icon="file-bookmark-alt" />
            </Tip>
          </ActionIconContainer>
        }
      >
        {popover}
      </Popover>

      {strip(content) && <Modal
        trigger={strip(content) ? saveTrigger : <span />}
        content={content}
        files={attachments}
        brands={brands}
        brandId={brandId}
      />}
    </>
  );
};

export default ResponseTemplate;
