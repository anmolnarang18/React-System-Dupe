import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthNav from "./AuthNav";
import Home from "../pages/home/Home";
import ShiftCreation from "../pages/tasks/ShiftCreation";
import ShiftDetails from "../pages/tasks/ShiftDetails";

const MainNav = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth" component={AuthNav} />
      <Stack.Screen name="shift_home" component={Home} />
      <Stack.Screen name="shift_create" component={ShiftCreation} />
      <Stack.Screen name="shift_detail" component={ShiftDetails} />
    </Stack.Navigator>
  );
};

export default MainNav;
