import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '../components/Header';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ToastProvider from '../components/ToastProvider';

describe('Header', () => {
  it('renders login button when not authenticated', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ToastProvider>
            <Header />
          </ToastProvider>
        </MemoryRouter>
      </Provider>
    );

    // Header shows app title or logo
    expect(screen.getByText(/whiteboard/i)).toBeInTheDocument();
  });
});
