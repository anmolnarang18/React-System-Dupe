import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import moment from "moment";

import { TASK_STATUS, USER_TYPE } from "../shared/Constants";
import { COLORS } from "../shared/Styles";
import { decideTaskClr, showTaskStatus } from "../utils/UtilityFuncs";

export default function TaskItem({
  data,
  userInfo,
  onTaskPress,
  onTaskBtnPress,
}) {
  return (
    <TouchableOpacity
      onPress={() => onTaskPress(data)}
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
          #{data.name}
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "400",
            color: decideTaskClr(data.status),
          }}
        >
          {data.status}
        </Text>
      </View>

      <View style={[styles.row, { marginTop: "2%" }]}>
        <View>
          <Text style={{ fontWeight: "600" }}>Start Date</Text>
          <Text style={{ fontSize: 12, fontWeight: "400", marginTop: "2%" }}>
            {moment(data.createdDate).format("DD/MMM/YY")}
          </Text>
        </View>

        <View>
          <Text style={{ fontWeight: "600" }}>End Date</Text>
          <Text style={{ fontSize: 12, fontWeight: "400", marginTop: "2%" }}>
            {moment(data.endDate).format("DD/MMM/YY")}
          </Text>
        </View>
      </View>

      <Text
        numberOfLines={2}
        style={{ fontSize: 14, fontWeight: "400", marginTop: "2%" }}
      >
        {data.description}
      </Text>

      <View style={styles.row}>
        {userInfo.type === USER_TYPE.MANAGER ? (
          <Text style={{ fontSize: 14, fontWeight: "400", marginTop: "3%" }}>
            <Text style={{ fontWeight: "600" }}>Doer:</Text>{" "}
            {data.assignedTo.name}
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
              {data.createdBy.name}
            </Text>
            {data.status !== TASK_STATUS.COMPLETED &&
              data.status !== TASK_STATUS.TERMINATED && (
                <TouchableOpacity
                  style={styles.btnText}
                  onPress={() => onTaskBtnPress(data)}
                >
                  <Text style={{ color: COLORS.secondary }}>
                    {showTaskStatus(data.status)}
                  </Text>
                </TouchableOpacity>
              )}
          </>
        )}

        {data.status === TASK_STATUS.COMPLETED && (
          <Text style={{ fontSize: 14, fontWeight: "400", marginTop: "3%" }}>
            <Text style={{ fontWeight: "600" }}>Total Cost:</Text> $
            {data.totalHours * data.perHourCost}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },
});
