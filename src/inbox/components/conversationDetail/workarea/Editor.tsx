import { IResponseTemplate } from '../../../../settings/responseTemplates/types';
import { MentionSuggestionParams } from '@octobots/ui/src/components/richTextEditor/utils/getMentionSuggestions';
import React, { forwardRef, useEffect, useState } from 'react';
import {
  EditorMethods,
  RichTextEditor,
} from '@octobots/ui/src/components/richTextEditor/TEditor';
import TemplateList from './TemplateList';
import styled from 'styled-components';
import { modernColors, borderRadius, spacing, typography, transitions } from '../../../../styles/theme';

const EditorContainer = styled.div`
  position: relative;
  
  .RichEditor-root {
    border: none;
    background-color: transparent;
    
    &:focus-within {
      outline: none;
    }
  }
  
  .RichEditor-editor {
    min-height: 100px;
    max-height: 200px;
    overflow-y: auto;
    padding: 0;
    
    .public-DraftEditor-content {
      min-height: 100px;
      max-height: 200px;
    }
  }
  
  .RichEditor-controls {
    border-top: 1px solid ${modernColors.border};
    padding: ${spacing.xs} ${spacing.sm};
    background-color: ${modernColors.messageBackground};
  }
  
  .RichEditor-styleButton {
    padding: ${spacing.xs} ${spacing.sm};
    margin-right: ${spacing.xs};
    border-radius: ${borderRadius.sm};
    
    &:hover {
      background-color: ${modernColors.hover};
    }
    
    &.RichEditor-activeButton {
      background-color: ${modernColors.active};
      color: ${modernColors.primary};
    }
  }
`;

const TemplateListContainer = styled.div`
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  box-shadow: 0 -4px 12px ${modernColors.shadow};
  border-radius: ${borderRadius.md} ${borderRadius.md} 0 0;
  overflow: hidden;
  background-color: ${modernColors.contentBackground};
  border: 1px solid ${modernColors.border};
  border-bottom: none;
`;

const PlainTextEditorContainer = styled.div`
  position: relative;
  
  textarea {
    width: 100%;
    min-height: 100px;
    max-height: 200px;
    resize: none;
    border: none;
    outline: none;
    padding: 0;
    font-family: ${typography.fontFamily};
    font-size: ${typography.fontSizes.md};
    line-height: ${typography.lineHeights.normal};
    background-color: transparent;
    
    &::placeholder {
      color: ${modernColors.textSecondary};
    }
  }
`;

type EditorProps = {
  currentConversation: string;
  integrationKind: string;
  content: string;
  onChange: (content: string) => void;
  showMentions: boolean;
  responseTemplates: IResponseTemplate[];
  placeholder?: string;
  limit?: number;
  mentionSuggestion?: MentionSuggestionParams;
  onCtrlEnter?: () => void;
};

type State = {
  collectedMentions: any;
  templatesState: any;
  hideTemplates: boolean;
};

const Editor = forwardRef(
  (props: EditorProps, ref: React.ForwardedRef<EditorMethods>) => {
    const {
      showMentions,
      content,
      responseTemplates,
      currentConversation,
      placeholder,
      integrationKind,
      mentionSuggestion,
      onChange,
      limit,
      onCtrlEnter,
    } = props;

    const [state, setState] = useState<State>({
      collectedMentions: [],
      templatesState: null,
      hideTemplates: props.showMentions,
    });

    useEffect(() => {
      setState((prevState) => ({
        ...prevState,
        hideTemplates: showMentions,
      }));
    }, [showMentions]);

    useEffect(() => {
      window.requestAnimationFrame(() => {
        onTemplatesStateChange(getTemplatesState());
      });
    }, [content, responseTemplates]);

    const onTemplatesStateChange = (templatesState: any) => {
      setState((prevState) => ({ ...prevState, templatesState }));
    };

    const getTemplatesState = () => {
      // get html content as text
      const textContent = content.toLowerCase().replace(/<[^>]+>/g, '');

      if (!textContent) {
        return null;
      }

      // search from response templates
      const foundTemplates = responseTemplates.filter(
        (template) =>
          template.name.toLowerCase().includes(textContent) ||
          template.content.toLowerCase().includes(textContent),
      );

      if (foundTemplates.length > 0) {
        return {
          templates: foundTemplates.slice(0, 5),
          searchText: textContent,
          selectedIndex: 0,
        };
      }

      return null;
    };

    const changeEditorContent = (content: string) => {
      onChange(content);
      setState((prevState) => ({ ...prevState, templatesState: null }));
    };

    const onSelectTemplate = (index?: number) => {
      const { templatesState } = state;
      const { templates, selectedIndex } = templatesState;
      const selectedTemplate = templates[index || selectedIndex];

      if (!selectedTemplate) {
        return null;
      }

      changeEditorContent(`${selectedTemplate.content}\n`);
    };

    // Render response templates suggestions
    const renderTemplates = () => {
      const { templatesState, hideTemplates } = state;

      if (!templatesState || hideTemplates) {
        return null;
      }

      return (
        <TemplateListContainer>
          <TemplateList
            onSelect={onSelectTemplate}
            suggestionsState={templatesState}
          />
        </TemplateListContainer>
      );
    };

    // Determine if we should use rich text based on integration kind
    const shouldUseRichText = () => {
      // Integrations that don't support rich text
      const plainTextIntegrations = [
        'whatsapp',
        'instagram-messenger',
        'facebook-messenger',
        'telegram',
        'viber',
        'line',
        'telnyx'
      ];
      
      return !plainTextIntegrations.some(type => integrationKind.includes(type));
    };

    return (
      <EditorContainer>
        {renderTemplates()}
          <RichTextEditor
            ref={ref}
            name={currentConversation}
            placeholder={placeholder}
            integrationKind={integrationKind}
            showMentions={showMentions}
            mentionSuggestion={mentionSuggestion}
            content={content}
            onChange={onChange}
            autoGrow={true}
            autoGrowMinHeight={100}
            autoGrowMaxHeight="55vh"
            limit={limit}
            onCtrlEnter={onCtrlEnter}
            toolbar={shouldUseRichText() ? undefined : [] }
          />
      </EditorContainer>
    );
  },
);

export default Editor;