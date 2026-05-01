'use client';

import { Component, type ReactNode } from 'react';

// Catches errors from inside the WebGL Canvas tree (R3F + postprocessing).
// In production Chrome reclaims the WebGL context for canvases positioned
// offscreen during navigation; when the user comes back to / R3F's Canvas
// tries to (re)create a renderer with a null GL ref and throws
// `Cannot read properties of null (reading 'alpha')`. Without a boundary
// that crash bubbles to the root and breaks the page tree.
//
// On error this component renders the provided fallback (the static SVG
// infinity logo). The page stays usable; refreshing typically restores the
// 3D Canvas because a fresh page-load gets a fresh GL context.

type Props = {
  children: ReactNode;
  fallback: ReactNode;
};

type State = { hasError: boolean };

export class CanvasErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    if (typeof window !== 'undefined') {
      console.warn('[CanvasErrorBoundary] caught:', error.message);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
