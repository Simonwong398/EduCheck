import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';
import { updateUserApi } from '../api/authService';
import { useNavigation } from '@react-navigation/native';
import * as yup from 'yup';

const validationSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
});

const { width, height } = Dimensions.get('window');

const ProfileScreen = React.memo(() => {
  const { user, logout, updateUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleUpdate = useCallback(async () => {
    try {
      setLoading(true);
      await validationSchema.validate({ name, email });
      const updatedUserData = { name, email };
      await updateUserApi(updatedUserData);
      updateUser(updatedUserData);
      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Your profile has been updated successfully.',
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
          text1: 'Update Failed',
          text2: error.message || 'An error occurred while updating your profile.',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [name, email, updateUser]);

  const handleLogout = useCallback(() => {
    logout();
    navigation.navigate('Login');
  }, [logout, navigation]);

  return (
    <View style={styles.container} accessible={true} accessibilityLabel="Profile Screen">
      <Text style={styles.title}>Profile</Text>
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
        accessibilityLabel="Email Input"
        accessibilityHint="Enter your email address"
      />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleUpdate} accessibilityLabel="Update Profile Button" accessibilityHint="Press to update your profile">
          <Text style={styles.buttonText}>Update Profile</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout} accessibilityLabel="Logout Button" accessibilityHint="Press to logout">
        <Text style={styles.buttonText}>Logout</Text>
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
  logoutButton: {
    backgroundColor: '#B00020',
  },
});

export default ProfileScreen;
