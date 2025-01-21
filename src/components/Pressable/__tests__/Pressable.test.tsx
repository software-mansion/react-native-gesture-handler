import React from 'react';
import { Pressable as RNPressable, Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import RNGHPressable from '../Pressable';

type MyComponentProps = {
  onPress: () => void;
  children: React.ReactNode;
  disabled?: boolean;
};

const MyRNPressableComponent = ({
  children,
  onPress,
  disabled,
}: MyComponentProps) => (
  <RNPressable onPress={onPress} disabled={disabled}>
    {children}
  </RNPressable>
);

const MyRNGHPressable = ({ children, onPress, disabled }: MyComponentProps) => (
  <RNGHPressable onPress={onPress} disabled={disabled}>
    {children}
  </RNGHPressable>
);

describe('Pressable', () => {
  describe('checking drop-in replacement', () => {
    describe('onPress', () => {
      it('enabled', () => {
        const onPressRN = jest.fn();
        render(
          <MyRNPressableComponent onPress={onPressRN}>
            <Text>Pressable</Text>
          </MyRNPressableComponent>
        );

        fireEvent(screen.getByText('Pressable'), 'press');
        expect(onPressRN).toHaveBeenCalled();

        const onPressRNGN = jest.fn();
        render(
          <MyRNGHPressable onPress={onPressRNGN}>
            <Text>Pressable</Text>
          </MyRNGHPressable>
        );

        fireEvent(screen.getByText('Pressable'), 'press');
        expect(onPressRNGN).toHaveBeenCalled();
      });

      it('disabled', () => {
        const onPressRN = jest.fn();
        render(
          <MyRNPressableComponent onPress={onPressRN} disabled>
            <Text>Pressable</Text>
          </MyRNPressableComponent>
        );

        fireEvent(screen.getByText('Pressable'), 'press');
        expect(onPressRN).not.toHaveBeenCalled();

        const onPressRNGN = jest.fn();
        render(
          <MyRNGHPressable onPress={onPressRNGN} disabled>
            <Text>Pressable</Text>
          </MyRNGHPressable>
        );

        fireEvent(screen.getByText('Pressable'), 'press');
        expect(onPressRNGN).not.toHaveBeenCalled();
      });
    });
  });
});
