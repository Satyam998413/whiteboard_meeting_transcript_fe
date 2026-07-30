import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BoardPage from '../pages/BoardPage';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ToastProvider from '../components/ToastProvider';

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

    expect(screen.getByText(/export pdf/i)).toBeInTheDocument();
  });
});
