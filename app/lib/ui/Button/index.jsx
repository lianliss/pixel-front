'use strict';
import React from 'react';
import {Button as BluePrintButton, Icon} from '@blueprintjs/core';

function Button(_props) {
  const props = {..._props};
  const classNames = [
    (props.className || '').split(' '),
    'pixel-button',
  ];
  if (props.primary) {
    classNames.push('pixel-button-primary');
  }
  delete props.primary;
  const iconSize = props.minimal
    ? 12
    : props.large
      ? 20
      : 16;
  const icon = typeof props.icon === 'string'
    ? <Icon size={iconSize} icon={props.icon} />
    : props.icon;
  return <BluePrintButton {...props} {...{icon}} className={classNames.join(' ')} />
}

export default Button;
