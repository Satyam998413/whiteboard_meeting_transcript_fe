import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardPage from '../pages/DashboardPage';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ToastProvider from '../components/ToastProvider';

describe('DashboardPage', () => {
  it('renders create board button', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ToastProvider>
            <DashboardPage />
          </ToastProvider>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
  });
});
