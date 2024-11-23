import React from 'react';
import { View, Button } from 'react-native';

function SettingsScreen({ toggleTheme }) {
  return (
    <View>
      <Button title="切换夜间模式" onPress={toggleTheme} />
      {/* 其他设置选项 */}
    </View>
  );
}

export default SettingsScreen;
