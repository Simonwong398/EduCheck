import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

const FeedbackScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    // Simulate feedback submission
    Toast.show({
      type: 'success',
      text1: 'Feedback Submitted',
      text2: 'Thank you for your feedback!',
    });
    setName('');
    setEmail('');
    setFeedback('');
  };

  return (
    <View style={styles.container} accessible={true} accessibilityLabel="Feedback Screen">
      <Text style={styles.title}>Feedback</Text>
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
        style={styles.textArea}
        placeholder="Your Feedback"
        value={feedback}
        onChangeText={setFeedback}
        multiline
        accessibilityLabel="Feedback Input"
        accessibilityHint="Enter your feedback"
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit} accessibilityLabel="Submit Feedback Button" accessibilityHint="Press to submit feedback">
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: width * 0.05,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: height * 0.02,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: height * 0.02,
    paddingHorizontal: 8,
  },
  textArea: {
    height: 100,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: height * 0.02,
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

export default FeedbackScreen;
