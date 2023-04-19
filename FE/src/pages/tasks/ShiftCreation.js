import React, { useState } from "react";

import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import DatePicker from "react-native-date-picker";
import moment from "moment";

import apiClient from "../../api/Api";

import { COLORS } from "../../shared/Styles";
import { handleValidation } from "../../utils/Validations";
import { SHIFT_STATUS } from "../../shared/Constants";

import CustomHeader from "../../components/CustomHeader";

export default function ShiftCreation({ navigation, route }) {

  const [desc, setDesc] = useState({
    isValid: true,
    errMsg: "",
    val: "",
  });

  const [startDate, setStartDate] = useState( new Date(moment().add(1,'d')) );
  const [endDate, setEndDate] = useState( new Date(moment().add({days:1, hours: 8})) );

  const [openCDate, setOpenCDate] = useState(false);
  const [openEDate, setOpenEDate] = useState(false);

  const handleShiftCreation = async () => {
    
    const descValid = handleValidation(desc.val, "STRING", "shift description");
   
    if (!descValid.isValid) {
      setDesc(descValid);
      return;
    }

    const shiftDetails = {
      description: desc.val,
      startDate,
      endDate,
    };

    try {
      const result = await apiClient.post("/shift/createShift", shiftDetails);

      if (result) {
        route.params.handleShiftFetching(SHIFT_STATUS.NOT_ASSIGNED);
        navigation.goBack();
      }
    } catch (error) {
      console.log("SHIFT CREATION ERROR", error);
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        heading="New Shift"
        iconName="arrowleft"
        onIconPress={() => navigation.goBack()}
      />

      <View style={styles.box}>
      
        <View style={styles.inputContainer}>
          <Text style={styles.inputText}>Description</Text>
          <TextInput
            value={desc.val}
            placeholder="Please enter shift description"
            numberOfLines={2}
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

      
          <View style={styles.inputContainer} >
            <Text
              onPress={() => setOpenCDate((prev) => !prev)}
              style={styles.inputText}
            >
              Start date/time
            </Text>
            <DatePicker
              modal
              minimumDate={new Date()}
              open={openCDate}
              date={startDate}
              onConfirm={(date) => {
             
                setStartDate(date);
                setEndDate(new Date(moment(date).add({hours: 8})))
                setOpenCDate((prev) => !prev);
                // if (moment(endDate).diff(date) < 0) {
                //   setEndDate(date);
                // }
              }}
              onCancel={() => {
                setOpenCDate((prev) => !prev);
              }}
            />

            <Text onPress={() => setOpenCDate(true)} style={styles.input}>
            Time: {moment(startDate).format("hh:mm a")} & Date: {moment(startDate).format("DD/M/YYYY")}
            </Text>
          </View>

          <View style={styles.inputContainer} >
            <Text
              onPress={() => setOpenEDate((prev) => !prev)}
              style={styles.inputText}
            >
              End date/time
            </Text>
            <DatePicker
              modal
              open={openEDate}
              minimumDate={ new Date(moment(startDate).add(4,'h'))}
              maximumDate={ new Date(moment(startDate).add(12,'h')) }
              date={endDate}
              onConfirm={(date) => {
                setOpenEDate((prev) => !prev);
                setEndDate(date);
              }}
              onCancel={() => {
                setOpenEDate((prev) => !prev);
              }}
            />

            <Text onPress={() => setOpenEDate(true)} style={styles.input}>
            Time: {moment(endDate).format("hh:mm a")} & Date: {moment(endDate).format("DD/M/YYYY")}
            </Text>
          </View>
      

        <TouchableOpacity style={styles.btn} onPress={handleShiftCreation}>
          <Text style={styles.btnText}>Create Shift</Text>
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
    backgroundColor: "#fff",
    padding: "5%",
  },
  box: {
    backgroundColor: "#fff",
    paddingVertical: "5%",
    width: "100%",
    borderColor: "grey",
    // borderWidth: 1,
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
    marginTop: "1%",
  },
  dropdown1BtnTxtStyle: { color: "#444", textAlign: "left", fontSize: 14 },
  dropdown1DropdownStyle: { backgroundColor: "#EFEFEF" },
  dropdown1RowStyle: {
    backgroundColor: "#EFEFEF",
    borderBottomColor: "#C5C5C5",
  },

  memberContainer: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignSelf: "center",
    padding: "5%",
    marginTop: "5%",
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
    alignSelf: "center",
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
