import React, { useEffect } from 'react';

let groupTag = 1;

export class WaitForGroup extends React.Component {
  constructor(props) {
    super(props);
    this._groupTag = `${groupTag++}`;
  }

  render() {
    return false;
  }
}

export function useWaitForGroup() {
  useEffect(() => {
    groupTag++;
  });

  return `${groupTag}`;
}
