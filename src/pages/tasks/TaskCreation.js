import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DatePicker from "react-native-date-picker";
import SelectDropdown from "react-native-select-dropdown";

import Icon from "react-native-vector-icons/AntDesign";
import FontAwesome from "react-native-vector-icons/FontAwesome";

import moment from "moment";
import { COLORS } from "../../shared/Styles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { handleValidation } from "../../utils/Validations";
import { TASKS_KEY, TASK_STATUS } from "../../shared/Constants";
import CustomHeader from "../../components/CustomHeader";

export default function TaskCreation({ navigation, route }) {
  const [name, setName] = useState({
    isValid: true,
    errMsg: "",
    val: "",
  });

  const [desc, setDesc] = useState({
    isValid: true,
    errMsg: "",
    val: "",
  });

  const [wage, setWage] = useState({
    isValid: true,
    errMsg: "",
    val: "5",
  });

  const [memberDetail, setMemberDetail] = useState({
    isValid: true,
    errMsg: "",
    data: null,
  });

  const [createdDate, setCreatedDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [openCDate, setOpenCDate] = useState(false);
  const [openEDate, setOpenEDate] = useState(false);

  const [selectedTask, setSelectedTask] = useState({
    name: "Not dependent",
    id: null,
  });
  const [taskList, setTaskList] = useState([]);

  useEffect(() => {
    getTasks();
  }, []);

  const getTasks = async () => {
    let tasks = await AsyncStorage.getItem(TASKS_KEY);

    tasks = JSON.parse(tasks) || [];

    tasks = tasks.map((item) => {
      return {
        name: item.name,
        id: item.id,
      };
    });

    setTaskList([
      {
        name: "Not dependent",
        id: "",
      },
      ...tasks,
    ]);
  };

  const handleMemberSelection = (data) => {
    setMemberDetail({
      isValid: true,
      errMsg: "",
      data,
    });
  };

  const handleTaskCreation = async () => {
    if (!memberDetail.data) {
      setMemberDetail({
        isValid: false,
        errMsg: "Please assign member to this task",
        data: null,
      });
      return;
    }

    const nameValid = handleValidation(name.val, "STRING", "task name");
    const descValid = handleValidation(desc.val, "STRING", "task description");
    const wageValid = handleValidation(wage.val, "NUMBER", "wage per hour");

    if (!nameValid.isValid || !descValid.isValid || !wageValid.isValid) {
      setName(nameValid);
      setDesc(descValid);
      setWage(wageValid);
      return;
    }

    const taskDetails = {
      id: new Date(),
      name: name.val,
      description: desc.val,
      createdDate,
      endDate,
      assignedTo: memberDetail.data,
      createdBy: route.params.userInfo,
      status: TASK_STATUS.NOT_STARTED,
      perHourCost: wage.val,
      totalHours: 0,
      dependentTask: selectedTask.id,
      completionDate: null,
    };

    let existingTasks = await AsyncStorage.getItem(TASKS_KEY);

    existingTasks = JSON.parse(existingTasks) || [];

    await AsyncStorage.setItem(
      TASKS_KEY,
      JSON.stringify([taskDetails, ...existingTasks])
    );

    route.params.getTasks();
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        heading="New Task"
        iconName="arrowleft"
        onIconPress={() => navigation.goBack()}
      />

      <View style={styles.box}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputText}>Name</Text>
          <TextInput
            value={name.val}
            placeholder="Please enter task name"
            onChangeText={(val) =>
              setName({
                isValid: true,
                errMsg: "",
                val: val,
              })
            }
            style={styles.input}
          />
          {!name.isValid && <Text style={styles.errText}>{name.errMsg}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputText}>Description</Text>
          <TextInput
            value={desc.val}
            placeholder="Please enter task description"
            multiline
            onChangeText={(val) =>
              setDesc({
                isValid: true,
                errMsg: "",
                val: val,
              })
            }
            style={styles.input}
          />
          {!desc.isValid && <Text style={styles.errText}>{desc.errMsg}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputText}>Wages per hour</Text>
          <TextInput
            value={wage.val}
            keyboardType="numeric"
            maxLength={3}
            onChangeText={(val) =>
              setWage({
                isValid: true,
                errMsg: "",
                val,
              })
            }
            style={styles.input}
          />

          {!wage.isValid && <Text style={styles.errText}>{wage.errMsg}</Text>}
        </View>

        <View style={{ marginVertical: "2%", paddingHorizontal: "5%" }}>
          <Text>Select Dependendency (if any)</Text>
          <SelectDropdown
            data={taskList}
            onSelect={(selectedItem, index) => {
              setSelectedTask(selectedItem);
            }}
            defaultValue={selectedTask}
            defaultButtonText="Select task"
            buttonStyle={styles.dropdown1BtnStyle}
            buttonTextStyle={styles.dropdown1BtnTxtStyle}
            renderDropdownIcon={(isOpened) => {
              return (
                <FontAwesome
                  name={isOpened ? "chevron-up" : "chevron-down"}
                  color={"#444"}
                  size={18}
                />
              );
            }}
            dropdownIconPosition={"right"}
            dropdownStyle={styles.dropdown1DropdownStyle}
            rowStyle={styles.dropdown1RowStyle}
            rowTextStyle={styles.dropdown1BtnTxtStyle}
            buttonTextAfterSelection={(selectedItem, index) => {
              // text represented after item is selected
              // if data array is an array of objects then return selectedItem.property to render after item is selected
              return `${selectedItem.name}(${selectedItem.id})`;
            }}
            rowTextForSelection={(item, index) => {
              // text represented for each item in dropdown
              // if data array is an array of objects then return item.property to represent item in dropdown
              return `${item.name}(${item.id})`;
            }}
          />
        </View>

        <View style={styles.dateContainer}>
          <View>
            <Text
              onPress={() => setOpenCDate((prev) => !prev)}
              style={styles.inputText}
            >
              Created date
            </Text>
            <DatePicker
              modal
              minimumDate={new Date()}
              open={openCDate}
              date={createdDate}
              onConfirm={(date) => {
                setOpenCDate((prev) => !prev);
                setCreatedDate(date);
                if (moment(endDate).diff(date) < 0) {
                  setEndDate(date);
                }
              }}
              onCancel={() => {
                setOpenCDate((prev) => !prev);
              }}
            />

            <Text onPress={() => setOpenCDate(true)} style={styles.inputText}>
              {moment(createdDate).format("DD/M/YYYY")}
            </Text>
          </View>

          <View>
            <Text
              onPress={() => setOpenEDate((prev) => !prev)}
              style={styles.inputText}
            >
              Last date
            </Text>
            <DatePicker
              modal
              open={openEDate}
              minimumDate={createdDate}
              date={endDate}
              onConfirm={(date) => {
                setOpenEDate((prev) => !prev);
                setEndDate(date);
              }}
              onCancel={() => {
                setOpenEDate((prev) => !prev);
              }}
            />

            <Text onPress={() => setOpenEDate(true)} style={styles.inputText}>
              {moment(endDate).format("DD/M/YYYY")}
            </Text>
          </View>
        </View>

        {memberDetail.data ? (
          <View style={styles.memberContainer}>
            <View style={{ display: "flex", flex: 1, flexDirection: "column" }}>
              <Text>Name: {memberDetail.data.name}</Text>
              <Text numberOfLines={1}>Email: {memberDetail.data.email}</Text>
            </View>
          </View>
        ) : null}

        {!memberDetail.isValid ? (
          <Text
            style={[styles.errText, { alignSelf: "center", marginTop: "5%" }]}
          >
            {memberDetail.errMsg}
          </Text>
        ) : null}

        <Text
          onPress={() =>
            navigation.navigate("member_list", {
              handleMemberSelection,
              memberDetail,
            })
          }
          style={styles.addText}
        >
          + Assign member
        </Text>

        <TouchableOpacity style={styles.btn} onPress={handleTaskCreation}>
          <Text style={styles.btnText}>Add Task</Text>
        </TouchableOpacity>
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
  },
  dropdown1BtnStyle: {
    width: "100%",
    height: 40,
    backgroundColor: "#FFF",
    borderBottomWidth: 0.5,
    borderRadius: 8,
    borderColor: "#444",
    alignSelf: "center",
    marginTop: "3%",
  },
  dropdown1BtnTxtStyle: { color: "#444", textAlign: "left", fontSize: 14 },
  dropdown1DropdownStyle: { backgroundColor: "#EFEFEF" },
  dropdown1RowStyle: {
    backgroundColor: "#EFEFEF",
    borderBottomColor: "#C5C5C5",
  },

  memberContainer: {
    backgroundColor: COLORS.primary,
    alignSelf: "center",
    padding: "5%",
    marginTop: "3%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: "5%",
    marginTop: "3%",
  },
  inputContainer: {
    marginTop: "5%",
    marginBottom: "2%",
    width: "100%",
    paddingHorizontal: "5%",
  },
  input: {
    backgroundColor: "#fff",
    borderColor: "#444",
    borderBottomWidth: 0.5,
    borderRadius: 8,
    padding: "2%",
  },
  inputText: {
    fontSize: 14,
    fontWeight: "400",
    marginBottom: "2%",
  },
  errText: {
    fontSize: 12,
    fontWeight: "400",
    color: "red",
    marginTop: "1%",
  },
  addText: {
    fontSize: 14,
    fontWeight: "400",
    color: COLORS.secondary,
    padding: "3%",
    alignSelf: "flex-end",
  },
  btn: {
    marginTop: "5%",
    marginBottom: "2%",
    width: "80%",
    padding: "3%",
    alignItems: "center",
    backgroundColor: COLORS.secondary,
    borderRadius: 30,
    alignSelf: "center",
  },
  btnText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
});
