declare module 'react-swm-icon-pack' {
  import { ComponentType } from 'react';

  interface SWMIconProps {
    name: string;
    style?: object;
    set?: 'outline' | 'broken' | 'duotone' | 'curved';
    size?: string | number;
    color?: string;
  }

  export const SWMIcon: ComponentType<SWMIconProps>;
}
