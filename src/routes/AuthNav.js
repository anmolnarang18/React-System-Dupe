import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";

const AuthNav = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="app_signin" component={Login} />
      <Stack.Screen name="app_signup" component={Signup} />
    </Stack.Navigator>
  );
};

export default AuthNav;
