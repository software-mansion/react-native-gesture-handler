import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, BackHandler } from 'react-native';

export interface RouteInfo {
  component: React.ComponentType;
  title?: string;
  rightButtonAction?: () => void;
}

export type NavigatorRoutes = Record<string, RouteInfo>;

export interface NavigatorProps {
  initialRouteName?: string;
}

export interface ButtonProps {
  title: string;
  onPress: () => void;
}

const Button = (props: ButtonProps) => {
  return (
    <Pressable
      style={{
        width: 48,
        height: 48,
        justifyContent: 'center',
      }}
      onPress={() => {
        props.onPress();
      }}>
      <Text style={{ textAlign: 'center', fontSize: 24 }}>{props.title}</Text>
    </Pressable>
  );
};

export default class Navigator {
  private routes: NavigatorRoutes = {};
  private history: string[] = [];
  private setCurrentRoute!: (route: string) => void;

  static create() {
    return new Navigator();
  }

  setRoutes(routes: NavigatorRoutes) {
    this.routes = routes;
  }

  navigateTo(route: string) {
    this.history.push(route);
    this.setCurrentRoute(route);
  }

  goBack() {
    if (this.history.length === 1) {
      throw new Error("Can't go back, no history");
    }
    this.history.pop();
    this.setCurrentRoute(this.history[this.history.length - 1]);
  }

  canGoBack() {
    return this.history.length > 1;
  }

  backHandler = () => {
    if (this.canGoBack()) {
      this.goBack();
      return true;
    }

    return false;
  };

  Navigator = (props: NavigatorProps) => {
    const [currentRoute, setCurrentRoute] = useState(
      props.initialRouteName ?? Object.keys(this.routes)[0]
    );
    this.setCurrentRoute = setCurrentRoute;

    useEffect(() => {
      // eslint-disable-next-line @typescript-eslint/unbound-method, @eslint-react/web-api/no-leaked-event-listener
      return BackHandler.addEventListener('hardwareBackPress', this.backHandler)
        .remove;
    }, []);

    useEffect(() => {
      if (this.history.length === 0) {
        this.history.push(currentRoute);
      }
    }, [currentRoute]);

    const route = this.routes[currentRoute];
    return (
      <View style={{ flex: 1 }}>
        <View
          style={{
            height: 48,
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            borderBottomColor: '#ccc',
            borderBottomWidth: 1,
          }}>
          <Button
            title={this.canGoBack() ? '<' : ''}
            onPress={() => {
              this.canGoBack() ? this.goBack() : null;
            }}
          />

          <Text style={{ alignSelf: 'center', fontSize: 20 }}>
            {route.title ?? ''}
          </Text>
          <Button
            title={route.rightButtonAction ? '>' : ''}
            onPress={() => {
              route.rightButtonAction?.();
            }}
          />
        </View>
        <route.component />
      </View>
    );
  };
}
