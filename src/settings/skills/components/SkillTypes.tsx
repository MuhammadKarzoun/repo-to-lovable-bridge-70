import { ActionButtons, SidebarListItem } from "@octobots/ui-settings/src/styles";
import { FieldStyle, SidebarList } from "@octobots/ui/src/layout/styles";
import {
  ISkillType,
  ISkillTypesDocument,
} from "@octobots/ui-inbox/src/settings/skills/types";

import Button from "@octobots/ui/src/components/Button";
import DataWithLoader from "@octobots/ui/src/components/DataWithLoader";
import { Header } from "@octobots/ui-settings/src/styles";
import { IButtonMutateProps } from "@octobots/ui/src/types";
import Icon from "@octobots/ui/src/components/Icon";
import { Link } from "react-router-dom";
import LoadMore from "@octobots/ui/src/components/LoadMore";
import ModalTrigger from "@octobots/ui/src/components/ModalTrigger";
import React from "react";
import Sidebar from "@octobots/ui/src/layout/components/Sidebar";
import SkillTypeForm from "./SkillTypeForm";
import Tip from "@octobots/ui/src/components/Tip";
import Wrapper from "@octobots/ui/src/layout/components/Wrapper";
import { __ } from "coreui/utils";

type Props = {
  queryParams: any;
  history: any;
  totalCount: number;
  loading: boolean;
  refetch: any;
  remove: (id: string) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  objects: ISkillTypesDocument[];
};

const { Section } = Wrapper.Sidebar;

function SkillTypes({
  objects,
  queryParams,
  history,
  totalCount,
  loading,
  refetch,
  remove,
  renderButton,
}: Props) {
  const isItemActive = (id: string) => {
    const currentType = queryParams.typeId || "";

    return currentType === id;
  };

  function renderEditAction(object: ISkillTypesDocument) {
    const trigger = (
      <Button id="skilltype-edit" btnStyle="link">
        <Icon icon="edit" />
      </Button>
    );

    return renderFormTrigger(trigger, object);
  }

  function renderRemoveAction(object: ISkillTypesDocument) {
    const handleRemove = () => remove(object._id);

    return (
      <Tip text={__("Remove")} placement="bottom">
        <Button btnStyle="link" onClick={handleRemove}>
          {/* <Icon icon="cancel-1" /> */}
          <img src="/images/delete-blue-lined.svg" />
        </Button>
      </Tip>
    );
  }

  function renderForm(props) {
    return (
      <SkillTypeForm {...props} refetch={refetch} renderButton={renderButton} />
    );
  }

  function renderFormTrigger(trigger: React.ReactNode, object?: ISkillType) {
    const content = (props) => renderForm({ ...props, object });

    return (
      <ModalTrigger
        title="New skill type"
        trigger={trigger}
        tipText={object && "Edit"}
        content={content}
      />
    );
  }

  function renderHeader() {
    const trigger = (
      <Button
        id="skilltype-new"
        btnStyle="primary"
        icon="plus-circle"
        iconLeftAlignment
        block
        style={{
          borderBottomRightRadius:0,
          borderBottomLeftRadius:0

        }}
      >
        Create skill type
      </Button>
    );

    return (
      <>
        {renderFormTrigger(trigger)} 
        <Section.Title   >{__("Skill types")}</Section.Title>
      </>
    );
  }

  function renderContent() {
    return (
      <SidebarList $noTextColor={true} $noBackground={true}>
        {objects.map((object) => (
          <SidebarListItem
            key={object._id}
            $isActive={isItemActive(object._id)}
          >
            <Link to={`?typeId=${object._id}`}>
              <FieldStyle>{object.name}</FieldStyle>
            </Link>
            <ActionButtons>
              {renderEditAction(object)}
              {renderRemoveAction(object)}
            </ActionButtons>
          </SidebarListItem>
        ))}
      </SidebarList>
    );
  }

  return (
    <Sidebar   header={renderHeader()}  >
      <DataWithLoader
        data={renderContent()}
        loading={loading}
        count={totalCount}
        emptyText={`${__("Get started by grouping the skills into types")}.${__(
          "For example, language skills"
        )}`}
        emptyImage="/images/actions/26.svg"
      />
      <LoadMore all={totalCount} loading={loading} />
    </Sidebar>
  );
}

export default SkillTypes;
