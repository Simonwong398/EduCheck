import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProfileScreen from '../screens/ProfileScreen';
import { AuthProvider } from '../context/AuthContext';

jest.mock('../api/authService', () => ({
  updateUserApi: jest.fn(() => Promise.resolve())
}));

describe('ProfileScreen', () => {
  it('should display validation error for invalid email', async () => {
    const { getByPlaceholderText, getByText } = render(<AuthProvider><ProfileScreen /></AuthProvider>);
    const emailInput = getByPlaceholderText('Email');
    const updateButton = getByText('Update');

    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.press(updateButton);

    expect(getByText('Invalid email format')).toBeTruthy();
  });

  it('should update profile successfully with valid data', async () => {
    const { getByPlaceholderText, getByText, findByText } = render(<AuthProvider><ProfileScreen /></AuthProvider>);
    const emailInput = getByPlaceholderText('Email');
    const updateButton = getByText('Update');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(updateButton);

    const successMessage = await findByText('Success');
    expect(successMessage).toBeTruthy();
  });
});
