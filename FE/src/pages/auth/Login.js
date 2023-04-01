import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import SelectDropdown from "react-native-select-dropdown";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FontAwesome from "react-native-vector-icons/FontAwesome";

import apiClient from "../../api/Api";

import { SIGNEDIN_KEY, USER_TYPE } from "../../shared/Constants";
import { COLORS } from "../../shared/Styles";
import { handleValidation } from "../../utils/Validations";

export default function Login({ navigation }) {
  const [email, setEmail] = useState({
    val: "",
    isValid: true,
    errMsg: "",
  });
  const [pass, setPass] = useState({
    val: "",
    isValid: true,
    errMsg: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [userType, setUserType] = useState(USER_TYPE.MEMBER);

  useEffect(() => {
    isUserLoggedIn();
  }, []);

  const isUserLoggedIn = async () => {
    let info = await AsyncStorage.getItem(SIGNEDIN_KEY);
    info = info ? JSON.parse(info) : null;

    setIsLoading(false);

    if (info?.email) {
      navigation.replace("task_home");
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    const emailValidation = handleValidation(email.val, "EMAIL");
    const passValidation = handleValidation(pass.val, "PASSWORD");

    if (!emailValidation.isValid || !passValidation.isValid) {
      setEmail(emailValidation);
      setPass(passValidation);
      setIsLoading(false);
      return;
    }

    try {
      const user = await apiClient.post("/auth/login", {
        email: email.val,
        password: pass.val,
        type: userType,
      });

      if (user) {
        await AsyncStorage.setItem(
          SIGNEDIN_KEY,
          JSON.stringify(user.data.data)
        );
        setIsLoading(false);
        //Navigate from here
        navigation.replace("task_home");
      }

      setError("Something went wrong");
      setIsLoading(false);
    } catch (error) {
      console.log("ERROR", error);
      setError(error?.response?.data || "Something went wrong!");
      setIsLoading(false);
    }

    // let expectedData = [];
    // if (userType === USER_TYPE.ADMIN) {
    //   expectedData = await AsyncStorage.getItem(ADMIN_KEY);
    // } else {
    //   expectedData = await AsyncStorage.getItem(MEMBER_KEY);
    // }

    // expectedData = JSON.parse(expectedData) || [];

    // const isUserAdded = expectedData.filter((e) => e.email === email.val);

    // if (isUserAdded.length === 0) {
    //   setError("Invalid email or password");
    //   return;
    // }

    // setError("");
    // await AsyncStorage.setItem(SIGNEDIN_KEY, JSON.stringify(isUserAdded[0]));
    //Navigate from here
    // navigation.replace("task_home");
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" />
        <Text style={styles.inputText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Login</Text>

      <View style={styles.box}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputText}>Email Address</Text>
          <TextInput
            value={email.val}
            placeholder="Please enter your Email address"
            textContentType="emailAddress"
            autoCapitalize="none"
            autoComplete="email"
            onChangeText={(val) =>
              setEmail({
                isValid: true,
                errMsg: "",
                val: val,
              })
            }
            style={styles.input}
          />
          {!email.isValid && <Text style={styles.errText}>{email.errMsg}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputText}>Password</Text>
          <TextInput
            value={pass.val}
            placeholder="Please enter your Password"
            textContentType="password"
            autoComplete="password"
            autoCapitalize="none"
            onChangeText={(val) =>
              setPass({
                isValid: true,
                errMsg: "",
                val: val,
              })
            }
            secureTextEntry
            style={styles.input}
          />
          {!pass.isValid && <Text style={styles.errText}>{pass.errMsg}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputText}>Select User Type</Text>
          <SelectDropdown
            data={[USER_TYPE.MEMBER, USER_TYPE.ADMIN]}
            onSelect={(selectedItem, index) => {
              setUserType(selectedItem);
            }}
            defaultValue={userType}
            defaultButtonText="Select task (if any)"
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
              return selectedItem;
            }}
            rowTextForSelection={(item, index) => {
              // text represented for each item in dropdown
              // if data array is an array of objects then return item.property to represent item in dropdown
              return item;
            }}
          />
        </View>

        <Text style={[styles.errText, { marginBottom: "3%" }]}>{error}</Text>

        <TouchableOpacity style={styles.btn} onPress={handleSignIn}>
          <Text
            style={{ color: COLORS.secondary, fontSize: 14, fontWeight: "700" }}
          >
            Login
          </Text>
        </TouchableOpacity>

        <Text
          onPress={() =>
            navigation.replace("app_signup", {
              isMember: null,
              userInfo: null,
            })
          }
          style={styles.linkText}
        >
          New here? Signup
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    alignItems: "center",
    paddingTop: "20%",
    backgroundColor: "#fff",
  },
  box: {
    backgroundColor: "#fff",
    paddingVertical: "5%",
    width: "90%",
    borderColor: "grey",
    // borderWidth: 1,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "10%",
  },
  btn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: "5%",
    paddingVertical: "3%",
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.secondary,
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
    borderRadius: 8,
    borderBottomWidth: 0.5,
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
  linkText: {
    fontSize: 12,
    fontWeight: "400",
    color: COLORS.link,
    marginTop: "5%",
  },

  dropdown1BtnStyle: {
    width: "100%",
    height: 40,
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 0,
    borderBottomWidth: 0.5,
    borderColor: "#444",
    alignSelf: "center",
  },
  dropdown1BtnTxtStyle: { color: "#444", textAlign: "left", fontSize: 14 },
  dropdown1DropdownStyle: { backgroundColor: "#EFEFEF" },
  dropdown1RowStyle: {
    backgroundColor: "#EFEFEF",
    borderBottomColor: "#C5C5C5",
  },
});
