import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ResultScreen = ({ route, navigation }) => {
  const { result } = route.params;

  const shareResult = async () => {
    try {
      const message = `
作业分析结果：
科目：${result.subject}
正确率：${result.correctRate}%
错误分析：${result.mistakes.map(m => `\n- ${m.question} => ${m.correct}`).join('')}
建议：${result.suggestions.join('\n')}
      `;

      await Share.share({
        message,
        title: '作业分析结果',
      });
    } catch (error) {
      console.error('分享失败:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreTitle}>正确率</Text>
          <Text style={styles.scoreText}>{result.correctRate}%</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>错误分析</Text>
        {result.mistakes.map((mistake, index) => (
          <View key={index} style={styles.mistakeItem}>
            <View style={styles.mistakeHeader}>
              <Icon name="error" size={20} color="#FF3B30" />
              <Text style={styles.mistakeQuestion}>{mistake.question}</Text>
            </View>
            <View style={styles.mistakeContent}>
              <Text style={styles.correctAnswer}>
                正确答案：{mistake.correct}
              </Text>
              <Text style={styles.explanation}>
                {mistake.explanation}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>学习建议</Text>
        {result.suggestions.map((suggestion, index) => (
          <View key={index} style={styles.suggestionItem}>
            <Icon name="lightbulb" size={20} color="#FF9500" />
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.buttonOutline]}
          onPress={() => navigation.navigate('Camera')}
        >
          <Text style={styles.buttonOutlineText}>继续检查</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={shareResult}
        >
          <Text style={styles.buttonText}>分享结果</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  section: {
    margin: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  mistakeItem: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
  },
  mistakeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mistakeQuestion: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  mistakeContent: {
    marginLeft: 28,
  },
  correctAnswer: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  explanation: {
    fontSize: 14,
    color: '#666',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#FFFAF0',
    borderRadius: 8,
  },
  suggestionText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  actionButtons: {
    padding: 20,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonOutline: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonOutlineText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ResultScreen;
