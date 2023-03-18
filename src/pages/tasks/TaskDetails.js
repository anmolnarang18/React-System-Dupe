import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import Icon from "react-native-vector-icons/AntDesign";
import moment from "moment";
import { COLORS } from "../../shared/Styles";
import { TASKS_KEY, TASK_STATUS } from "../../shared/Constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  showTaskStatus,
  decideTaskStatusChange,
  decideTaskClr,
} from "../../utils/UtilityFuncs";
import CustomHeader from "../../components/CustomHeader";

export default function TaskDetails({ navigation, route }) {
  const { taskInfo, userInfo, getTasks } = route.params;

  const [hours, setHours] = useState(taskInfo.totalHours || "0");

  const onTaskBtnPress = async (data) => {
    if (data.status === TASK_STATUS.IN_PROGRESS && hours == 0) {
      Alert.alert("Error", "Please add your total working hours.");
      return;
    }

    let list = await AsyncStorage.getItem(TASKS_KEY);
    list = JSON.parse(list);

    if (data.dependentTask) {
      const depTask = list.filter((e) => e.id === data.dependentTask);

      if (depTask.length > 0) {
        if (depTask[0].status !== TASK_STATUS.COMPLETED) {
          Alert.alert(
            "Warning",
            `${depTask[0].name}(${depTask[0].id}) task is not completed yet.`
          );
          return;
        }
      }
    }

    const taskIndex = list.findIndex(
      (e) => e.id === data.id || e.createdDate === data.createdDate
    );

    if (taskIndex !== -1) {
      list[taskIndex].status = decideTaskStatusChange(list[taskIndex].status);

      if (data.status === TASK_STATUS.IN_PROGRESS) {
        list[taskIndex].totalHours = hours;
      }
    }

    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(list));

    getTasks();
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        heading="Details Of Task"
        iconName="arrowleft"
        onIconPress={() => navigation.goBack()}
      />

      <View style={styles.box}>
        <Text style={styles.text}>
          <Text style={styles.boldText}>Name: </Text>
          {taskInfo.name}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.boldText}>Description: </Text>
          {taskInfo.description}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.boldText}>Start Date: </Text>
          {moment(taskInfo.createdDate).format("DD/MMM/YY")}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.boldText}>End Date: </Text>
          {moment(taskInfo.endDate).format("DD/MMM/YY")}
        </Text>

        <Text style={styles.text}>
          <Text style={styles.boldText}>Wage per hour: </Text>$
          {taskInfo.perHourCost}
        </Text>

        <Text style={[styles.text, { color: decideTaskClr(taskInfo.status) }]}>
          <Text style={styles.boldText}>Status: </Text>
          {taskInfo.status}
        </Text>

        {userInfo.isAdmin ? (
          <>
            <Text style={styles.text}>
              <Text style={styles.boldText}>Doer: </Text>
              {`${taskInfo.assignedTo.name} #${taskInfo.assignedTo.email}`}
            </Text>
            <Text style={styles.text}>
              <Text style={styles.boldText}>Total Hours: </Text>
              {hours}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.text}>
              <Text style={styles.boldText}>Manager: </Text>
              {`${taskInfo.createdBy.name} #${taskInfo.createdBy.email}`}
            </Text>

            <View style={styles.row}>
              <Text style={styles.boldText}>Total Hours: </Text>
              <TextInput
                value={hours}
                onChangeText={(val) => setHours(val)}
                style={[
                  styles.input,
                  {
                    borderWidth:
                      taskInfo.status === TASK_STATUS.IN_PROGRESS ? 1 : 0,
                    paddingHorizontal:
                      taskInfo.status === TASK_STATUS.IN_PROGRESS ? "5%" : 0,
                  },
                ]}
                keyboardType="numeric"
                maxLength={2}
                editable={taskInfo.status === TASK_STATUS.IN_PROGRESS}
              />
            </View>
            {taskInfo.status !== TASK_STATUS.COMPLETED &&
              taskInfo.status !== TASK_STATUS.TERMINATED && (
                <TouchableOpacity
                  style={styles.btn}
                  onPress={() => onTaskBtnPress(taskInfo)}
                >
                  <Text style={{ color: COLORS.primary, fontWeight: "600" }}>
                    {showTaskStatus(taskInfo.status)}
                  </Text>
                </TouchableOpacity>
              )}
          </>
        )}

        {taskInfo.status === TASK_STATUS.COMPLETED && (
          <Text style={styles.text}>
            <Text style={styles.boldText}>Total Cost: </Text>$
            {taskInfo.totalHours * taskInfo.perHourCost}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    alignItems: "center",
    backgroundColor: COLORS.primary,
    padding: "5%",
  },
  box: {
    backgroundColor: "#fff",
    paddingVertical: "5%",
    width: "100%",
    borderColor: "grey",
    borderWidth: 1,
    borderRadius: 10,
    display: "flex",
    padding: "5%",
  },
  btn: {
    backgroundColor: COLORS.secondary,
    width: "80%",
    marginTop: "5%",
    alignSelf: "center",
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    paddingVertical: "2%",
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
    color: "#444",
    marginVertical: "4%",
  },
  boldText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  row: {
    flexDirection: "row",
    display: "flex",
    alignItems: "center",
  },
  input: {
    paddingVertical: "1%",
  },
});
