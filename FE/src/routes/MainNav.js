import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthNav from "./AuthNav";
import MembersList from "../pages/home/MembersList";

import Home from "../pages/home/Home";
import TaskCreation from "../pages/tasks/TaskCreation";
import TaskDetails from "../pages/tasks/TaskDetails";

const MainNav = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth" component={AuthNav} />
      <Stack.Screen name="member_list" component={MembersList} />
      <Stack.Screen name="shift_home" component={Home} />
      <Stack.Screen name="task_create" component={TaskCreation} />
      <Stack.Screen name="task_detail" component={TaskDetails} />
    </Stack.Navigator>
  );
};

export default MainNav;
