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

import { TASK_STATUS, SIGNEDIN_KEY, USER_TYPE } from "../../shared/Constants";
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

  const [notStartedTasks, setNotStartedTasks] = useState({
    isCalled: false,
    data: [],
  });
  const [inProgressTasks, setInProgressTasks] = useState({
    isCalled: false,
    data: [],
  });
  const [completedTasks, setCompletedTasks] = useState({
    isCalled: false,
    data: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isAsc, setIsAsc] = useState(true);
  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  // const [routes] = React.useState([
  //   { key: "first", title: "First" },
  //   { key: "second", title: "Second" },
  // ]);
  const [routes] = useState([
    { key: TASK_STATUS.NOT_STARTED, title: TASK_STATUS.NOT_STARTED },
    { key: TASK_STATUS.IN_PROGRESS, title: TASK_STATUS.IN_PROGRESS },
    { key: TASK_STATUS.COMPLETED, title: TASK_STATUS.COMPLETED },
  ]);

  useEffect(() => {
    getUserInfo();
  }, []);

  const getUserInfo = async () => {
    let info = await AsyncStorage.getItem(SIGNEDIN_KEY);
    info = JSON.parse(info);
    setUserInfo(info);
    const task = await getTasks(TASK_STATUS.NOT_STARTED);

    setNotStartedTasks({
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

  const getTasks = async (status) => {
    setIsLoading(true);
    try {
      const taskList = await apiClient.get("/task/getTasks", {
        params: {
          status,
        },
      });

      if (taskList) {
        if (status === TASK_STATUS.COMPLETED) {
          if (isAsc) {
            const ascList = handleSort(taskList.data.data, true);
            return ascList;
          } else {
            const dscList = handleSort(taskList.data.data, false);
            console.log("COMING HERE", dscList);
            return dscList;
          }
        } else {
          return taskList.data.data || [];
        }
      }
      setIsLoading(false);
      return [];
    } catch (error) {
      console.log("TASKLIST ERROR", error);
      setIsLoading(false);
      return [];
    }
  };

  const createProject = () => {
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
      const oldStatusTasks = await getTasks(oldStatus);
      console.log("COMING OLD", oldStatusTasks);
      switch (oldStatus) {
        case TASK_STATUS.NOT_STARTED:
          setNotStartedTasks({
            data: oldStatusTasks,
            isCalled: true,
          });
          break;
        case TASK_STATUS.IN_PROGRESS:
          setInProgressTasks({
            data: oldStatusTasks,
            isCalled: true,
          });

        case TASK_STATUS.COMPLETED:
          setCompletedTasks({
            data: oldStatusTasks,
            isCalled: true,
          });

        default:
          break;
      }
    }

    if (newStatus) {
      const newStatusTasks = await getTasks(newStatus);

      switch (newStatus) {
        case TASK_STATUS.NOT_STARTED:
          setNotStartedTasks({
            data: newStatusTasks,
            isCalled: true,
          });
          break;
        case TASK_STATUS.IN_PROGRESS:
          setInProgressTasks({
            data: newStatusTasks,
            isCalled: true,
          });

        case TASK_STATUS.COMPLETED:
          setCompletedTasks({
            data: newStatusTasks,
            isCalled: true,
          });

        default:
          break;
      }
    }

    if (isCompleted) {
      const newStatusTasks = await getTasks(newStatus);
      setNotStartedTasks({
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

  const handleOrderPress = () => {
    const newIsAsc = !isAsc;
    const completedData = [...completedTasks.data];

    const newData = handleSort(completedData, newIsAsc);
    setCompletedTasks({
      data: newData,
      isCalled: true,
    });
    setIsAsc(newIsAsc);
  };

  const handleReload = async () => {
    let task = [];

    switch (index) {
      case 0:
        task = await getTasks(TASK_STATUS.NOT_STARTED);
        setNotStartedTasks({
          isCalled: true,
          data: task,
        });
        break;
      case 1:
        task = await getTasks(TASK_STATUS.IN_PROGRESS);
        setInProgressTasks({
          isCalled: true,
          data: task,
        });
        break;
      case 2:
        task = await getTasks(TASK_STATUS.COMPLETED);
        console.log("COMING HERE", task);
        setCompletedTasks({
          isCalled: true,
          data: task,
        });
        break;

      default:
        break;
    }
  };

  const onTaskBtnPress = async (data) => {
    const { dependentTask: depTask } = data;
    if (depTask) {
      if (
        depTask.status === TASK_STATUS.NOT_STARTED ||
        depTask.status === TASK_STATUS.IN_PROGRESS
      ) {
        Alert.alert("Error", `Complete ${depTask.name} to continue.`);
        return;
      }
    }

    if (data.status === TASK_STATUS.IN_PROGRESS) {
      taskPress(data);
      return;
    }

    try {
      const result = await apiClient.put("/task/editTask", {
        taskId: data._id,
        status: TASK_STATUS.IN_PROGRESS,
      });
      if (result) {
        handleTaskFetching(TASK_STATUS.NOT_STARTED, TASK_STATUS.IN_PROGRESS);
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
        if (!notStartedTasks.isCalled) {
          const task = await getTasks(TASK_STATUS.NOT_STARTED);

          setNotStartedTasks({
            isCalled: true,
            data: task,
          });
        }
        break;
      case 1:
        if (!inProgressTasks.isCalled) {
          const task = await getTasks(TASK_STATUS.IN_PROGRESS);

          setInProgressTasks({
            isCalled: true,
            data: task,
          });
        }

        break;
      case 2:
        if (!completedTasks.isCalled) {
          const task = await getTasks(TASK_STATUS.COMPLETED);

          setCompletedTasks({
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
    [TASK_STATUS.NOT_STARTED]: () => (
      <TaskList
        tasks={notStartedTasks.data}
        userInfo={userInfo}
        onTaskPress={taskPress}
        onTaskBtnPress={onTaskBtnPress}
        onReload={handleReload}
      />
    ),
    [TASK_STATUS.IN_PROGRESS]: () => (
      <TaskList
        tasks={inProgressTasks.data}
        userInfo={userInfo}
        onTaskPress={taskPress}
        onTaskBtnPress={onTaskBtnPress}
        onReload={handleReload}
      />
    ),
    [TASK_STATUS.COMPLETED]: () => (
      <TaskList
        tasks={completedTasks.data}
        userInfo={userInfo}
        onTaskPress={taskPress}
        onTaskBtnPress={onTaskBtnPress}
        onReload={handleReload}
      />
    ),
  });

  return (
    <View style={styles.container}>
      {userInfo.type === USER_TYPE.ADMIN ? (
        <View style={[styles.row, { padding: "3%" }]}>
          <Text
            onPress={handleMemberCreation}
            style={[styles.logoutText, { color: COLORS.primary }]}
          >
            + Create Member
          </Text>

          <Text onPress={handleLogout} style={styles.logoutText}>
            Logout
          </Text>
        </View>
      ) : index === 2 ? (
        <View style={[styles.row, { padding: "3%" }]}>
          <TouchableOpacity
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={handleOrderPress}
          >
            <Icon
              name={
                isAsc ? "sort-numeric-ascending" : "sort-numeric-descending"
              }
              style={{ fontSize: 20, marginRight: "5%", color: COLORS.primary }}
            />
            <Text style={[styles.logoutText, { color: COLORS.primary }]}>
              {isAsc ? "Ascending order" : "Descending order"}
            </Text>
          </TouchableOpacity>

          <Text onPress={handleLogout} style={styles.logoutText}>
            Logout
          </Text>
        </View>
      ) : (
        <Text
          onPress={handleLogout}
          style={[styles.logoutText, { alignSelf: "flex-end", margin: "3%" }]}
        >
          Logout
        </Text>
      )}
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={handleIndexChange}
        renderTabBar={renderTabBar}
        initialLayout={{ width: layout.width }}
      />
      {userInfo.type === USER_TYPE.ADMIN && (
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
