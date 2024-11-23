import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';

function FeedbackScreen({ studentId }) {
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await axios.get(`/api/feedback/${studentId}`);
        setFeedback(response.data);
      } catch (error) {
        console.error('获取反馈时出错', error);
      }
    };

    fetchFeedback();
  }, [studentId]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>作业反馈</Text>
      <FlatList
        data={feedback}
        keyExtractor={(item) => item._id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
            <Text style={styles.feedback}>{item.feedback}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  item: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  date: {
    fontSize: 14,
    color: '#888',
  },
  feedback: {
    fontSize: 16,
  },
});

export default FeedbackScreen;
