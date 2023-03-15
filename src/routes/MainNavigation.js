import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Home from '../pages/home/Home';
import AuthNavigation from './AuthNavigation';
import TaskCreation from '../pages/home/TaskCreation';
import TaskDetails from '../pages/home/TaskDetails';
import MembersList from '../pages/home/MembersList';

const MainNavigation = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="AUTH" component={AuthNavigation} />
      <Stack.Screen name="HOME" component={Home} />
      <Stack.Screen name="CREATE" component={TaskCreation} />
      <Stack.Screen name="DETAIL" component={TaskDetails} />
      <Stack.Screen name="LIST" component={MembersList} />
    </Stack.Navigator>
  );
};

export default MainNavigation;
