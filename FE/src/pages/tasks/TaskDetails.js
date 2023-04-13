import React, { useState } from "react";

import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import moment from "moment";

import { COLORS } from "../../shared/Styles";
import { TASK_STATUS } from "../../shared/Constants";

import CustomHeader from "../../components/CustomHeader";
import apiClient from "../../api/Api";

import { showTaskStatus, decideTaskClr } from "../../utils/UtilityFuncs";

export default function TaskDetails({ navigation, route }) {
  const { taskInfo, userInfo, handleTaskFetching } = route.params;

  const [hours, setHours] = useState(taskInfo.totalHours.toString() || "0");

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

    if (data.status === TASK_STATUS.NOT_STARTED) {
      try {
        const result = await apiClient.put("/task/editTask", {
          taskId: data._id,
          status: TASK_STATUS.IN_PROGRESS,
        });
        if (result) {
          handleTaskFetching(TASK_STATUS.NOT_STARTED, TASK_STATUS.IN_PROGRESS);
          navigation.goBack();
        }
      } catch (error) {
        console.log("TASK UPDATION NOT STARTED ERROR", error);
      }
    } else if (data.status === TASK_STATUS.IN_PROGRESS) {
      if (hours == 0) {
        Alert.alert("Error", "Please add your total working hours.");
        return;
      }

      try {
        const result = await apiClient.put("/task/editTask", {
          taskId: data._id,
          status: TASK_STATUS.COMPLETED,
          totalHours: hours,
        });
        if (result) {
          handleTaskFetching(
            TASK_STATUS.IN_PROGRESS,
            TASK_STATUS.COMPLETED,
            true
          );
          navigation.goBack();
        }
      } catch (error) {
        console.log("TASK_UPDATION IN PROGRESS ERROR", error);
      }
    }
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
          <Text style={styles.boldText}>Wages: </Text>${taskInfo.perHourCost}
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
            {/* <Text style={styles.text}>
              <Text style={styles.boldText}>Manager: </Text>
              {`${taskInfo.createdBy.name} #${taskInfo.createdBy.email}`}
            </Text> */}

            <View style={styles.row}>
              <Text style={styles.boldText}>Total Hours: </Text>
              <TextInput
                value={hours}
                onChangeText={(val) => setHours(val)}
                style={[
                  styles.input,
                  {
                    borderBottomWidth:
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
    backgroundColor: "#fff",
    padding: "5%",
  },
  box: {
    backgroundColor: "#fff",
    paddingVertical: "5%",
    width: "100%",
    borderColor: "grey",
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
