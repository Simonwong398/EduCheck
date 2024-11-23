import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HomeScreen = ({ navigation }) => {
  const user = useSelector(state => state.auth.user);

  const features = [
    {
      id: 1,
      title: '拍照检查',
      icon: 'camera-alt',
      onPress: () => navigation.navigate('Camera'),
    },
    {
      id: 2,
      title: '历史记录',
      icon: 'history',
      onPress: () => navigation.navigate('History'),
    },
    {
      id: 3,
      title: '学习报告',
      icon: 'assessment',
      onPress: () => navigation.navigate('Report'),
    },
    {
      id: 4,
      title: '设置',
      icon: 'settings',
      onPress: () => navigation.navigate('Settings'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            欢迎回来，{user?.email}
          </Text>
        </View>
        
        <View style={styles.featuresGrid}>
          {features.map(feature => (
            <TouchableOpacity
              key={feature.id}
              style={styles.featureItem}
              onPress={feature.onPress}
            >
              <Icon name={feature.icon} size={40} color="#007AFF" />
              <Text style={styles.featureText}>{feature.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>最近活动</Text>
          <View style={styles.recentItem}>
            <Text style={styles.recentTitle}>数学作业</Text>
            <Text style={styles.recentTime}>2小时前</Text>
          </View>
          <View style={styles.recentItem}>
            <Text style={styles.recentTitle}>英语作文</Text>
            <Text style={styles.recentTime}>昨天</Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Camera')}
      >
        <Icon name="add-a-photo" size={30} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  featureItem: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featureText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  recentSection: {
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
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recentTitle: {
    fontSize: 16,
    color: '#333',
  },
  recentTime: {
    fontSize: 14,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default HomeScreen;
