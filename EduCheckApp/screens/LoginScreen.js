import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Dimensions } from 'react-native';
import * as yup from 'yup';
import { loginUser } from '../api/authService';
import { useAuth } from '../context/AuthContext';
import Toast from 'react-native-toast-message';

const validationSchema = yup.object().shape({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const { width, height } = Dimensions.get('window');

const LoginScreen = React.memo(({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = useCallback(async () => {
    try {
      setLoading(true);
      await validationSchema.validate({ email, password });
      const response = await loginUser({ email, password });
      login(response.data.user);
      Toast.show({
        type: 'success',
        text1: 'Login Successful',
        text2: 'Welcome back!',
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
          text1: 'Login Failed',
          text2: error.message,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [email, password, login]);

  return (
    <View style={styles.container} accessible={true} accessibilityLabel="Login Screen">
      <Text style={styles.title}>Login</Text>
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
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          accessibilityLabel="Login Button"
          accessibilityHint="Press to login"
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Register')}
        accessibilityLabel="Register Button"
        accessibilityHint="Press to navigate to the registration screen"
      >
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: width * 0.05,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: height * 0.02,
    paddingHorizontal: 8,
  },
  button: {
    backgroundColor: '#007BFF', // Ensure this color meets accessibility contrast standards
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

export default LoginScreen;
