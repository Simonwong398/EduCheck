import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useDispatch } from 'react-redux';

const CameraScreen = ({ navigation }) => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const takePhoto = async () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
      saveToPhotos: true,
    };

    try {
      const result = await launchCamera(options);
      if (result.assets && result.assets[0]) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('错误', '无法拍摄照片');
    }
  };

  const pickImage = async () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    try {
      const result = await launchImageLibrary(options);
      if (result.assets && result.assets[0]) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('错误', '无法选择照片');
    }
  };

  const analyzeImage = async () => {
    if (!image) {
      Alert.alert('提示', '请先拍摄或选择一张照片');
      return;
    }

    setLoading(true);
    dispatch({ type: 'ANALYZE_HOMEWORK_REQUEST' });

    try {
      // 这里将来需要实现实际的图像分析逻辑
      // 模拟分析过程
      setTimeout(() => {
        const mockResult = {
          subject: '数学',
          correctRate: 85,
          mistakes: [
            { question: '1+1=3', correct: '1+1=2', explanation: '基本加法运算错误' }
          ],
          suggestions: ['建议复习基础加法运算']
        };

        dispatch({
          type: 'ANALYZE_HOMEWORK_SUCCESS',
          payload: mockResult
        });

        setLoading(false);
        navigation.navigate('Result', { result: mockResult });
      }, 2000);
    } catch (error) {
      setLoading(false);
      dispatch({
        type: 'ANALYZE_HOMEWORK_FAILURE',
        payload: error.message
      });
      Alert.alert('错误', '分析失败，请重试');
    }
  };

  return (
    <View style={styles.container}>
      {image ? (
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: image.uri }}
            style={styles.preview}
            resizeMode="contain"
          />
        </View>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            请拍摄或选择一张作业照片
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.buttonOutline]}
          onPress={takePhoto}
          disabled={loading}
        >
          <Text style={styles.buttonOutlineText}>拍照</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonOutline]}
          onPress={pickImage}
          disabled={loading}
        >
          <Text style={styles.buttonOutlineText}>从相册选择</Text>
        </TouchableOpacity>

        {image && (
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={analyzeImage}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>开始分析</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  previewContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  preview: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
  },
  buttonContainer: {
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

export default CameraScreen;
