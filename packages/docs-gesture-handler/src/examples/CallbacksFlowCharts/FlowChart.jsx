import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network/standalone';
import { useColorMode } from '@docusaurus/theme-common';

const COLORS = {
  SWM_OFF_WHITE: '#f8f9ff',
  SWM_PURPLE_LIGHT_100: '#782aeb',
  SWM_NAVY_DARK_140: '#1b2445',
  SWM_NAVY_DARK_100: '#001a72',
};

export default function FlowChart({ nodes, edges }) {
  const containerRef = useRef(null);

  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  useEffect(() => {
    const nodesOptions = {
      shape: 'box',
      margin: { top: 15, bottom: 15, left: 15, right: 15 },
      font: {
        face: 'Aeonik',
        size: 18,
        color: isDark ? COLORS.SWM_OFF_WHITE : COLORS.SWM_PURPLE_LIGHT_100,
      },
      color: {
        background: isDark ? COLORS.SWM_NAVY_DARK_140 : COLORS.SWM_OFF_WHITE,
        border: COLORS.SWM_PURPLE_LIGHT_100,
        hover: {
          background: isDark
            ? COLORS.SWM_PURPLE_LIGHT_100
            : COLORS.SWM_OFF_WHITE,
          border: COLORS.SWM_PURPLE_LIGHT_100,
        },
        highlight: {
          background: isDark
            ? COLORS.SWM_PURPLE_LIGHT_100
            : COLORS.SWM_OFF_WHITE,
          border: COLORS.SWM_PURPLE_LIGHT_100,
        },
      },
    };

    const edgesOptions = {
      smooth: { enabled: true, type: 'continuous', roundness: 0.1 },
      color: {
        color: isDark ? COLORS.SWM_OFF_WHITE : COLORS.SWM_NAVY_DARK_100,
        hover: COLORS.SWM_PURPLE_LIGHT_100,
        highlight: COLORS.SWM_PURPLE_LIGHT_100,
      },
      selfReference: { size: 25, angle: Math.PI / 2 },
      arrows: { to: { scaleFactor: 0.8 } },
      arrowStrikethrough: false,
    };

    const layoutOptions = {
      hierarchical: {
        direction: 'LR',
        sortMethod: 'directed',
        levelSeparation: 300,
      },
    };

    const interactionOptions = {
      dragNodes: false,
      dragView: false,
      zoomView: false,
      hover: true,
    };

    const options = {
      nodes: nodesOptions,
      edges: edgesOptions,
      layout: layoutOptions,
      physics: false,
      interaction: interactionOptions,
    };

    const network = new Network(
      containerRef.current,
      { nodes, edges },
      options
    );

    return () => network.destroy();
  }, [isDark, edges, nodes]);

  return (
    <div
      ref={containerRef}
      style={{
        height: '300px',
        border: '1px solid var(--swm-border)',
        background: 'var(--swm-off-background)',
      }}
    />
  );
}
