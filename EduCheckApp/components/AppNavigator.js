import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TeacherHome from '../screens/TeacherHome';
import ParentHome from '../screens/ParentHome';

const Stack = createStackNavigator();

function AppNavigator({ toggleTheme }) {
  // 假设有一个方法来获取当前用户类型
  const userType = "teacher"; // or "parent"

  return (
    <Stack.Navigator>
      {userType === "teacher" ? (
        <Stack.Screen name="TeacherHome" component={TeacherHome} />
      ) : (
        <Stack.Screen name="ParentHome" component={ParentHome} />
      )}
      {/* 其他公共界面 */}
    </Stack.Navigator>
  );
}

export default AppNavigator;
