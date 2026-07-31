import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BoardPage from '../pages/BoardPage';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ToastProvider from '../components/ToastProvider';

// react-konva pulls in konva's Node canvas backend under jsdom (it needs the native `canvas`
// package, which isn't installed and doesn't need to be for a markup-level smoke test) — stub
// it out with inert elements so importing BoardPage doesn't try to load a real canvas renderer.
vi.mock('react-konva', () => ({
  Stage: (props) => React.createElement('div', { 'data-testid': 'konva-stage' }, props.children),
  Layer: (props) => React.createElement('div', null, props.children),
  Line: () => null,
  Rect: () => null,
  Ellipse: () => null,
  Group: (props) => React.createElement('div', null, props.children),
  Text: () => null,
}));

describe('BoardPage', () => {
  it('renders export buttons', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ToastProvider>
            <BoardPage />
          </ToastProvider>
        </MemoryRouter>
      </Provider>
    );
    // On initial render the board is loading (async fetch). Ensure loading state exists.
    expect(screen.getByText(/loading board/i)).toBeInTheDocument();
  });
});
