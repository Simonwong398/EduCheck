import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Dimensions } from 'react-native';
import Toast from 'react-native-toast-message';
import { registerUser } from '../api/authService';
import { useAuth } from '../context/AuthContext';
import * as yup from 'yup';

const validationSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const { width, height } = Dimensions.get('window');

const RegisterScreen = React.memo(({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('parent'); // 默认角色为家长
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleRegister = useCallback(async () => {
    try {
      setLoading(true);
      await validationSchema.validate({ name, email, password });
      const userData = { name, email, password, role };
      const response = await registerUser(userData);
      login(response.data.user);
      Toast.show({
        type: 'success',
        text1: 'Registration Successful',
        text2: 'You can now log in.',
      });
    } catch (error) {
      if (error.name === 'ValidationError') {
        Toast.show({
          type: 'error',
          text1: 'Validation Error',
          text2: error.message,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: error.message || 'An error occurred during registration.',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [name, email, password, role, login]);

  return (
    <View style={styles.container} accessible={true} accessibilityLabel="Register Screen">
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
        accessibilityLabel="Name Input"
        accessibilityHint="Enter your name"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        accessibilityLabel="Email Input"
        accessibilityHint="Enter your email address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        accessibilityLabel="Password Input"
        accessibilityHint="Enter your password"
      />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleRegister} accessibilityLabel="Register Button" accessibilityHint="Press to register">
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')} accessibilityLabel="Back to Login Button" accessibilityHint="Press to navigate to the login screen">
        <Text style={styles.buttonText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.3,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: height * 0.01,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
