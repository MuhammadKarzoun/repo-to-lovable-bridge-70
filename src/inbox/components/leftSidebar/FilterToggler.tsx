import { GroupTitle, GroupContent } from './styles';
import Icon from '@octobots/ui/src/components/Icon';
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { __ } from '@octobots/ui/src/utils';

type Props = {
  groupText: string;
  isOpen: boolean;
  toggle: (params: { isOpen: boolean }) => void;
  manageUrl?: string;
  children: React.ReactNode;
};

const FilterToggler: React.FC<Props> = ({ groupText, isOpen: initialIsOpen, toggle, manageUrl, children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(initialIsOpen);

  useEffect(() => {
    setIsOpen(initialIsOpen);
  }, [initialIsOpen]);

  const handleToggle = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    toggle({ isOpen: newIsOpen });
  };

  return (
    <>
      <GroupTitle $isOpen={isOpen}>
        <span onClick={handleToggle}>
          {__(groupText)}
          <Icon icon="angle-down" />
        </span>
        {manageUrl && (
          <Link to={manageUrl}>
            <Icon icon="cog" size={14} />
          </Link>
        )}
      </GroupTitle>
      <GroupContent $isOpen={isOpen}>
        {children}
      </GroupContent>
    </>
  );
};

export default FilterToggler;