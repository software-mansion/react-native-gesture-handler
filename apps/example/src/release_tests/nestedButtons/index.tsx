import React from 'react';
import { View } from 'react-native';

import { RectButton } from 'react-native-gesture-handler';

export default function Example() {
  return (
    <View style={{ flex: 1 }}>
      <RectButton
        style={{ width: 400, height: 800, backgroundColor: 'yellow' }}>
        <RectButton style={{ width: 375, height: 700, backgroundColor: 'red' }}>
          <RectButton
            style={{ width: 350, height: 650, backgroundColor: 'green' }}>
            <RectButton
              style={{
                width: 325,
                height: 600,
                backgroundColor: 'blue',
              }}>
              <RectButton
                style={{ width: 300, height: 550, backgroundColor: 'cyan' }}>
                <RectButton
                  style={{
                    width: 275,
                    height: 500,
                    backgroundColor: 'purple',
                  }}>
                  <RectButton
                    style={{
                      width: 250,
                      height: 450,
                      backgroundColor: 'orange',
                    }}>
                    <RectButton
                      style={{
                        width: 225,
                        height: 400,
                        backgroundColor: 'gray',
                      }}>
                      <RectButton
                        style={{
                          width: 200,
                          height: 350,
                          backgroundColor: 'magenta',
                        }}>
                        <RectButton
                          style={{
                            width: 175,
                            height: 300,
                            backgroundColor: 'wheat',
                          }}>
                          <RectButton
                            style={{
                              width: 150,
                              height: 250,
                              backgroundColor: 'pink',
                            }}>
                            <RectButton
                              style={{
                                width: 125,
                                height: 200,
                                backgroundColor: 'lightgreen',
                              }}>
                              <RectButton
                                style={{
                                  width: 100,
                                  height: 150,
                                  backgroundColor: 'navy',
                                }}
                              />
                            </RectButton>
                          </RectButton>
                        </RectButton>
                      </RectButton>
                    </RectButton>
                  </RectButton>
                </RectButton>
              </RectButton>
            </RectButton>
          </RectButton>
        </RectButton>
      </RectButton>
    </View>
  );
}
