import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LoginScreen from '../screens/LoginScreen';
import { AuthProvider } from '../context/AuthContext';

jest.mock('../api/authService', () => ({
  loginUserApi: jest.fn(() => Promise.resolve({ data: { user: { name: 'Test User', email: 'test@example.com' } } }))
}));

describe('LoginScreen', () => {
  it('should display validation error for invalid email', async () => {
    const { getByPlaceholderText, getByText } = render(<AuthProvider><LoginScreen /></AuthProvider>);
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const loginButton = getByText('Login');

    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.changeText(passwordInput, '123456');
    fireEvent.press(loginButton);

    expect(getByText('Invalid email format')).toBeTruthy();
  });

  it('should login successfully with valid credentials', async () => {
    const { getByPlaceholderText, getByText, findByText } = render(<AuthProvider><LoginScreen /></AuthProvider>);
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const loginButton = getByText('Login');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, '123456');
    fireEvent.press(loginButton);

    const successMessage = await findByText('Success');
    expect(successMessage).toBeTruthy();
  });
});
