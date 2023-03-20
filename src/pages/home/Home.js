import React, { useEffect, useState } from "react";

import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";

import CustomFloatingBtn from "../../components/CustomFloatingBtn";
import CustomHeader from "../../components/CustomHeader";

import { TASKS_KEY, TASK_STATUS, LOGGEDIN_KEY } from "../../shared/Constants";
import { COLORS } from "../../shared/Styles";
import {
  showTaskStatus,
  decideTaskStatusChange,
  decideTaskClr,
} from "../../utils/UtilityFuncs";

export default function Home({ navigation }) {
  const [userInfo, setUserInfo] = useState({});

  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    getUserInfo();
  }, []);

  const getUserInfo = async () => {
    let info = await AsyncStorage.getItem(LOGGEDIN_KEY);
    info = JSON.parse(info);
    setUserInfo(info);
    getTasks(info);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem(LOGGEDIN_KEY);
    navigation.reset({
      index: 0,
      routes: [{ name: "auth" }],
    });
  };

  const getTasks = async (info) => {
    let taskList = await AsyncStorage.getItem(TASKS_KEY);

    taskList = JSON.parse(taskList) || [];

    const requiredTasks = [];

    const user = info || userInfo;

    if (user.isAdmin) {
      taskList.map((item) => {
        if (item.createdBy.email === user.email) {
          requiredTasks.push(item);
        }
      });
    } else {
      taskList.map((item) => {
        if (item.assignedTo.email === user.email) {
          requiredTasks.push(item);
        }
      });
    }

    setTasks([...requiredTasks]);
  };

  const createProject = () => {
    navigation.navigate("task_create", {
      userInfo,
      getTasks,
    });
  };

  const taskPress = (data) => {
    navigation.navigate("task_detail", {
      taskInfo: data,
      userInfo,
      getTasks,
    });
  };

  const onTaskBtnPress = async (data) => {
    if (data.status === TASK_STATUS.IN_PROGRESS) {
      taskPress(data);
      return;
    }

    const list = [...tasks];

    if (data.dependentTask) {
      let taskList = await AsyncStorage.getItem(TASKS_KEY);

      taskList = JSON.parse(taskList) || [];

      const depTask = taskList.filter((e) => e.id === data.dependentTask);

      if (depTask.length > 0) {
        if (depTask[0].status !== TASK_STATUS.COMPLETED) {
          Alert.alert("Error", `Complete ${depTask[0].name} to continue.`);
          return;
        }
      }
    }

    const taskIndex = list.findIndex(
      (e) => e.id === data.id || e.createdDate === data.createdDate
    );

    if (taskIndex !== -1) {
      list[taskIndex].status = decideTaskStatusChange(list[taskIndex].status);
    }

    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(list));

    setTasks([...list]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
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
        ListHeaderComponent={() => (
          <View style={styles.headerContainer}>
            <CustomHeader
              heading="Task List"
              containerStyles={{ width: "70%" }}
            />
            <Text onPress={handleLogout} style={styles.logoutText}>
              Log out
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              onPress={() => taskPress(item)}
              style={styles.itemContainer}
            >
              <View style={styles.row}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: COLORS.secondary,
                  }}
                >
                  #{item.name}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "400",
                    color: decideTaskClr(item.status),
                  }}
                >
                  {item.status}
                </Text>
              </View>

              <View style={[styles.row, { marginTop: "2%" }]}>
                <View>
                  <Text style={{ fontWeight: "600" }}>Start Date</Text>
                  <Text
                    style={{ fontSize: 12, fontWeight: "400", marginTop: "2%" }}
                  >
                    {moment(item.createdDate).format("DD/MMM/YY")}
                  </Text>
                </View>

                <View>
                  <Text style={{ fontWeight: "600" }}>End Date</Text>
                  <Text
                    style={{ fontSize: 12, fontWeight: "400", marginTop: "2%" }}
                  >
                    {moment(item.endDate).format("DD/MMM/YY")}
                  </Text>
                </View>
              </View>

              <Text
                numberOfLines={2}
                style={{ fontSize: 14, fontWeight: "400", marginTop: "2%" }}
              >
                {item.description}
              </Text>

              <View style={styles.row}>
                {userInfo.isAdmin ? (
                  <Text
                    style={{ fontSize: 14, fontWeight: "400", marginTop: "3%" }}
                  >
                    <Text style={{ fontWeight: "600" }}>Doer:</Text>{" "}
                    {item.assignedTo.name}
                  </Text>
                ) : (
                  <>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "400",
                        marginTop: "3%",
                      }}
                    >
                      <Text style={{ fontWeight: "600" }}>Manager:</Text>{" "}
                      {item.createdBy.name}
                    </Text>
                    {item.status !== TASK_STATUS.COMPLETED &&
                      item.status !== TASK_STATUS.TERMINATED && (
                        <TouchableOpacity
                          style={styles.btnText}
                          onPress={() => onTaskBtnPress(item)}
                        >
                          <Text style={{ color: COLORS.secondary }}>
                            {showTaskStatus(item.status)}
                          </Text>
                        </TouchableOpacity>
                      )}
                  </>
                )}

                {item.status === TASK_STATUS.COMPLETED && (
                  <Text
                    style={{ fontSize: 14, fontWeight: "400", marginTop: "3%" }}
                  >
                    <Text style={{ fontWeight: "600" }}>Total Cost:</Text> $
                    {item.totalHours * item.perHourCost}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
      {userInfo.isAdmin && <CustomFloatingBtn onBtnPress={createProject} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    // alignItems: 'center',
    backgroundColor: "#fff",
    padding: "3%",
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
    marginBottom: "5%",
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
