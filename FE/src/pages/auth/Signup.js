import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/AntDesign";

import apiClient from "../../api/Api";

import { COLORS } from "../../shared/Styles";
import { SIGNEDIN_KEY, USER_TYPE } from "../../shared/Constants";
import { handleValidation } from "../../utils/Validations";

export default function Signup({ navigation, route }) {
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

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { isMember, userInfo } = route.params;

  const handleSignUp = async () => {
    setIsLoading(true);
    const emailValid = handleValidation(email.val, "EMAIL");
    const passValid = handleValidation(pass.val, "PASSWORD");
    const nameValid = handleValidation(name.val, "STRING", "name");

    if (!emailValid.isValid || !passValid.isValid || !nameValid) {
      setEmail(emailValid);
      setPass(passValid);
      setName(nameValid);
      setIsLoading(false);
      return;
    }

    let obj = {
      name: name.val,
      email: email.val,
      password: pass.val,
      type: USER_TYPE.ADMIN,
    };

    if (isMember) {
      obj = {
        name: name.val,
        email: email.val,
        password: pass.val,
        type: USER_TYPE.MEMBER,
        createdBy: userInfo._id,
      };
    }
    console.log("OBJ", obj);
    try {
      const user = await apiClient.post("/auth/createUser", obj);

      if (user) {
        if (isMember) {
          setIsLoading(false);
          navigation.goBack();
          return;
        }
        console.log("USER", user.data);
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
      console.log("ERROR", error?.data);
      setError(error?.data?.message || "Something went wrong!");
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

    // if (isUserAdded.length > 0) {
    //   setError("User already added");
    //   return;
    // }

    // setError("");

    // if (userType === USER_TYPE.ADMIN) {
    //   await AsyncStorage.setItem(
    //     ADMIN_KEY,
    //     JSON.stringify([
    //       {
    //         email: email.val,
    //         password: pass.val,
    //         name: name.val,
    //         isAdmin: true,
    //       },
    //       ...expectedData,
    //     ])
    //   );
    // } else {
    //   await AsyncStorage.setItem(
    //     MEMBER_KEY,
    //     JSON.stringify([
    //       {
    //         email: email.val,
    //         password: pass.val,
    //         name: name.val,
    //         isAdmin: false,
    //       },
    //       ...expectedData,
    //     ])
    //   );
    // }

    // await AsyncStorage.setItem(
    //   SIGNEDIN_KEY,
    //   JSON.stringify({
    //     email: email.val,
    //     password: pass.val,
    //     name: name.val,
    //     isAdmin: userType === USER_TYPE.ADMIN,
    //   })
    // );

    // //Navigate from here
    // navigation.replace("task_home");
  };

  return (
    <View style={styles.container}>
      {isMember ? (
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: "5%",
            width: "100%",
          }}
        >
          <Icon
            style={{ marginRight: "5%", fontSize: 24 }}
            name="arrowleft"
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerText}>Signup</Text>
        </View>
      ) : (
        <Text style={styles.headerText}>Signup</Text>
      )}
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

        <Text style={[styles.errText, { marginBottom: "3%" }]}>{error}</Text>

        <TouchableOpacity style={styles.btn} onPress={handleSignUp}>
          <Text
            style={{ color: COLORS.secondary, fontSize: 14, fontWeight: "700" }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.secondary} />
            ) : (
              "Sign up"
            )}
          </Text>
        </TouchableOpacity>
        {!isMember && (
          <Text
            onPress={() => navigation.replace("app_signin")}
            style={styles.linkText}
          >
            Already have an account? click here
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
    paddingTop: "10%",
    backgroundColor: "#fff",
    // justifyContent: 'center',
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
