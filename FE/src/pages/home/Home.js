import React, { useEffect, useState } from "react";

import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { TabView, TabBar, SceneMap } from "react-native-tab-view";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import AsyncStorage from "@react-native-async-storage/async-storage";

import CustomFloatingBtn from "../../components/CustomFloatingBtn";
import apiClient from "../../api/Api";

import { SHIFT_STATUS, SIGNEDIN_KEY, USER_TYPE } from "../../shared/Constants";
import { COLORS } from "../../shared/Styles";

import TaskItem from "../../components/TaskItem";
import { handleSort } from "../../utils/UtilityFuncs";

const TaskList = ({
  tasks,
  userInfo,
  onTaskPress,
  onTaskBtnPress,
  onReload,
}) => (
  <FlatList
    data={tasks}
    keyExtractor={(item) => item._id}
    contentContainerStyle={[styles.container, { padding: "3%" }]}
    onRefresh={onReload}
    refreshing={false}
    ListEmptyComponent={() => (
      <View
        style={{
          width: "100%",
          height: "90%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "700" }}>
          Tasks not found :(
        </Text>
      </View>
    )}
    renderItem={({ item }) => (
      <TaskItem
        data={item}
        userInfo={userInfo}
        onTaskPress={onTaskPress}
        onTaskBtnPress={onTaskBtnPress}
      />
    )}
  />
);

const renderTabBar = (props) => (
  <TabBar
    {...props}
    indicatorStyle={{ backgroundColor: COLORS.primary }}
    style={{ backgroundColor: COLORS.secondary, color: COLORS.secondary }}
  />
);

export default function Home({ navigation }) {
  const [userInfo, setUserInfo] = useState({});

  const [notAssignedShifts, setNotAssignedShifts] = useState({
    isCalled: false,
    data: [],
  });
  const [confirmedShifts, setConfirmedShifts] = useState({
    isCalled: false,
    data: [],
  });
  const [exchangedShifts, setExchangedShifts] = useState({
    isCalled: false,
    data: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
 
  const [routes] = useState([
    { key: SHIFT_STATUS.NOT_ASSIGNED, title: 'Open' },
    { key: SHIFT_STATUS.CONFIRMED, title: 'Confirmed' },
    { key: SHIFT_STATUS.SWAP, title: 'Exchange' },
  ]);

  useEffect(() => {
    getUserInfo();
  }, []);

  const getUserInfo = async () => {
    let info = await AsyncStorage.getItem(SIGNEDIN_KEY);
    info = JSON.parse(info);
    setUserInfo(info);
    const task = await getShifts(SHIFT_STATUS.NOT_ASSIGNED);

    setNotAssignedShifts({
      isCalled: true,
      data: task,
    });
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem(SIGNEDIN_KEY);
    navigation.reset({
      index: 0,
      routes: [{ name: "auth" }],
    });
  };

  const getShifts = async (status) => {
    setIsLoading(true);
    try {
      const shiftList = await apiClient.get("/task/getShifts", {
        params: {
          status,
        },
      });

      if (shiftList) {
       
          return shiftList.data.data || [];
        
      }
      setIsLoading(false);
      return [];
    } catch (error) {
      console.log("SHIFTLIST ERROR", error);
      setIsLoading(false);
      return [];
    }
  };

  const createProject = () => {
    return;
    navigation.navigate("task_create", {
      userInfo,
      handleTaskFetching,
    });
  };

  const taskPress = (data) => {
    navigation.navigate("task_detail", {
      taskInfo: data,
      userInfo,
      handleTaskFetching,
    });
  };

  const handleTaskFetching = async (oldStatus, newStatus, isCompleted) => {
    if (oldStatus) {
      const oldStatusTasks = await getShifts(oldStatus);
      console.log("COMING OLD", oldStatusTasks);
      switch (oldStatus) {
        case SHIFT_STATUS.NOT_ASSIGNED:
          setNotAssignedShifts({
            data: oldStatusTasks,
            isCalled: true,
          });
          break;
        case SHIFT_STATUS.CONFIRMED:
          setConfirmedShifts({
            data: oldStatusTasks,
            isCalled: true,
          });

        case SHIFT_STATUS.SWAP:
          setExchangedShifts({
            data: oldStatusTasks,
            isCalled: true,
          });

        default:
          break;
      }
    }

    if (newStatus) {
      const newStatusTasks = await getShifts(newStatus);

      switch (newStatus) {
        case SHIFT_STATUS.NOT_ASSIGNED:
          setNotAssignedShifts({
            data: newStatusTasks,
            isCalled: true,
          });
          break;
        case SHIFT_STATUS.CONFIRMED:
          setConfirmedShifts({
            data: newStatusTasks,
            isCalled: true,
          });

        case SHIFT_STATUS.SWAP:
          setExchangedShifts({
            data: newStatusTasks,
            isCalled: true,
          });

        default:
          break;
      }
    }

    if (isCompleted) {
      const newStatusTasks = await getShifts(newStatus);
      setNotAssignedShifts({
        data: newStatusTasks,
        isCalled: true,
      });
    }
  };

  const handleMemberCreation = () => {
    navigation.navigate("auth", {
      screen: "app_signup",
      params: {
        isMember: true,
        userInfo: userInfo,
      },
    });
  };

  
  const handleReload = async () => {
    let task = [];

    switch (index) {
      case 0:
        task = await getShifts(SHIFT_STATUS.NOT_ASSIGNED);
        setNotAssignedShifts({
          isCalled: true,
          data: task,
        });
        break;
      case 1:
        task = await getShifts(SHIFT_STATUS.CONFIRMED);
        setConfirmedShifts({
          isCalled: true,
          data: task,
        });
        break;
      case 2:
        task = await getShifts(SHIFT_STATUS.SWAP);
        console.log("COMING HERE", task);
        setExchangedShifts({
          isCalled: true,
          data: task,
        });
        break;

      default:
        break;
    }
  };

  const onTaskBtnPress = async (data) => {
    
    // taskPress(data);
   return;
    try {
      const result = await apiClient.put("/task/editTask", {
        taskId: data._id,
        status: SHIFT_STATUS.CONFIRMED,
      });
      if (result) {
        handleTaskFetching();
        return;
      }
    } catch (error) {
      console.log("TASK UPDATION ERROR", error);
    }
  };

  const handleIndexChange = async (index) => {
    setIndex(index);
    switch (index) {
      case 0:
        if (!notAssignedShifts.isCalled) {
          const task = await getShifts(SHIFT_STATUS.NOT_ASSIGNED);

          setNotAssignedShifts({
            isCalled: true,
            data: task,
          });
        }
        break;
      case 1:
        if (!confirmedShifts.isCalled) {
          const task = await getShifts(SHIFT_STATUS.CONFIRMED);

          setConfirmedShifts({
            isCalled: true,
            data: task,
          });
        }

        break;
      case 2:
        if (!exchangedShifts.isCalled) {
          const task = await getShifts(SHIFT_STATUS.SWAP);

          setExchangedShifts({
            isCalled: true,
            data: task,
          });
        }

        break;

      default:
        return;
        break;
    }
  };

  const renderScene = SceneMap({
    [SHIFT_STATUS.NOT_ASSIGNED]: () => (
      <Text>Not assigned shifts</Text>
      // <TaskList
      //   tasks={notAssignedShifts.data}
      //   userInfo={userInfo}
      //   onTaskPress={taskPress}
      //   onTaskBtnPress={onTaskBtnPress}
      //   onReload={handleReload}
      // />
    ),
    [SHIFT_STATUS.CONFIRMED]: () => (
      <Text>Confirmed shifts</Text>
    ),
    [SHIFT_STATUS.SWAP]: () => (
      <Text>shifts to exchange</Text>
    ),
  });

  return (
    <View style={styles.container}>
        <Text
          onPress={handleLogout}
          style={[styles.logoutText, { alignSelf: "flex-end", margin: "2%" }]}
        >
          Logout
        </Text>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={handleIndexChange}
        renderTabBar={renderTabBar}
        initialLayout={{ width: layout.width }}
      />
      {userInfo.type === USER_TYPE.MANAGER && (
        <CustomFloatingBtn onBtnPress={createProject} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    backgroundColor: "#fff",
    width: "100%",
  },
  itemContainer: {
    backgroundColor: "#fff",
    padding: "3%",
    width: "100%",
    borderColor: COLORS.secondary,
    borderBottomWidth: 1,
    borderRadius: 8,
    display: "flex",
    marginVertical: "3%",
  },
  headerContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    width: "100%",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "700",
  },

  logoutText: {
    fontSize: 16,
    fontWeight: "700",
    color: "red",
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  btnText: {
    marginTop: "3%",
    borderBottomWidth: 0.5,
    paddingVertical: "2%",
    paddingHorizontal: "5%",
    borderRadius: 8,
    color: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
});
