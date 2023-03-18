import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  View,
} from "react-native";
import React, { useState } from "react";
import SelectDropdown from "react-native-select-dropdown";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FontAwesome from "react-native-vector-icons/FontAwesome";

import { COLORS } from "../../shared/Styles";
import {
  USER_ADMIN_KEY,
  USER_LOGGEDIN_KEY,
  USER_MEMBER_KEY,
  USER_TYPES,
} from "../../shared/Constants";
import { handleValidation } from "../../utils/Validations";

export default function Signup({ navigation }) {
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

  const [name, setName] = useState({
    val: "",
    isValid: true,
    errMsg: "",
  });

  const [userType, setUserType] = useState(USER_TYPES.MEMBER);
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    const emailValid = handleValidation(email.val, "EMAIL");
    const passValid = handleValidation(pass.val, "PASSWORD");
    const nameValid = handleValidation(name.val, "STRING", "name");

    if (!emailValid.isValid || !passValid.isValid || !nameValid) {
      setEmail(emailValid);
      setPass(passValid);
      setName(nameValid);
      return;
    }
    let expectedData = [];
    if (userType === USER_TYPES.ADMIN) {
      expectedData = await AsyncStorage.getItem(USER_ADMIN_KEY);
    } else {
      expectedData = await AsyncStorage.getItem(USER_MEMBER_KEY);
    }

    expectedData = JSON.parse(expectedData) || [];

    const isUserAdded = expectedData.filter((e) => e.email === email.val);

    if (isUserAdded.length > 0) {
      setError("User already added");
      return;
    }

    setError("");

    if (userType === USER_TYPES.ADMIN) {
      await AsyncStorage.setItem(
        USER_ADMIN_KEY,
        JSON.stringify([
          {
            email: email.val,
            password: pass.val,
            name: name.val,
            isAdmin: true,
          },
          ...expectedData,
        ])
      );
    } else {
      await AsyncStorage.setItem(
        USER_MEMBER_KEY,
        JSON.stringify([
          {
            email: email.val,
            password: pass.val,
            name: name.val,
            isAdmin: false,
          },
          ...expectedData,
        ])
      );
    }

    await AsyncStorage.setItem(
      USER_LOGGEDIN_KEY,
      JSON.stringify({
        email: email.val,
        password: pass.val,
        name: name.val,
        isAdmin: userType === USER_TYPES.ADMIN,
      })
    );

    //Navigate from here
    navigation.replace("task_home");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Signup</Text>

      <View style={styles.box}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputText}>Name</Text>
          <TextInput
            value={name.val}
            placeholder="Please Enter Your Name"
            textContentType="name"
            autoComplete="name"
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
          <Text style={styles.inputText}>Email</Text>
          <TextInput
            value={email.val}
            textContentType="emailAddress"
            autoComplete="email"
            autoCapitalize="none"
            placeholder="Please enter your Email address"
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
            placeholder="Please Enter your Password"
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
            style={styles.input}
            secureTextEntry
          />
          {!pass.isValid && <Text style={styles.errText}>{pass.errMsg}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputText}>Select User Type</Text>
          <SelectDropdown
            data={[USER_TYPES.MEMBER, USER_TYPES.ADMIN]}
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

        <TouchableOpacity style={styles.btn} onPress={handleSignUp}>
          <Text
            style={{ color: COLORS.secondary, fontSize: 14, fontWeight: "700" }}
          >
            Sign up
          </Text>
        </TouchableOpacity>

        <Text
          onPress={() => navigation.replace("app_signin")}
          style={styles.linkText}
        >
          Already have an account? click here
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
    paddingTop: "10%",
    backgroundColor: COLORS.primary,
    // justifyContent: 'center',
  },
  box: {
    backgroundColor: "#fff",
    paddingVertical: "5%",
    width: "90%",
    borderColor: "grey",
    borderWidth: 1,
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
