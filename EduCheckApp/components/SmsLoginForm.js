import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';

function SmsLoginForm() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);

  const handleLogin = async () => {
    try {
      const response = await axios.post('/api/login', { phone, password });
      if (response.data.success) {
        const codeResponse = await axios.post('/api/send-code', { phone });
        if (codeResponse.data.success) {
          setIsCodeSent(true);
          Alert.alert('验证码已发送');
        } else {
          Alert.alert('验证码发送失败');
        }
      } else {
        Alert.alert('登录失败');
      }
    } catch (error) {
      console.error('登录过程中出错', error);
      Alert.alert('登录过程中出错');
    }
  };

  const handleVerifyCode = async () => {
    try {
      const response = await axios.post('/api/verify-code', { phone, code });
      if (response.data.success) {
        Alert.alert('登录成功');
        // 登录成功后的操作，例如跳转到主界面
      } else {
        Alert.alert('验证码验证失败');
      }
    } catch (error) {
      console.error('验证码验证过程中出错', error);
      Alert.alert('验证码验证过程中出错');
    }
  };

  return (
    <View>
      <TextInput
        placeholder="手机号"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        placeholder="密码"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="登录" onPress={handleLogin} />
      {isCodeSent && (
        <>
          <TextInput
            placeholder="验证码"
            value={code}
            onChangeText={setCode}
            keyboardType="numeric"
          />
          <Button title="验证验证码" onPress={handleVerifyCode} />
        </>
      )}
    </View>
  );
}

export default SmsLoginForm;
