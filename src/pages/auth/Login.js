import {
  ActivityIndicator,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  EMAIL_VALIDATION,
  USER_ADMIN_KEY,
  USER_LOGGEDIN_KEY,
  USER_MEMBER_KEY,
} from "../../shared/Constants";
import { COLORS } from "../../shared/Styles";

const handleValidation = (val, type) => {
  switch (type) {
    case "EMAIL":
      if (!val || !EMAIL_VALIDATION.test(val)) {
        return {
          val: val,
          isValid: false,
          errMsg: "email address is invalid",
        };
      } else {
        return {
          val: val,
          isValid: true,
          errMsg: "",
        };
      }
    case "PASSWORD":
      if (!val) {
        return {
          val: val,
          isValid: false,
          errMsg: "Please Enter Password.",
        };
      } else {
        return {
          val: val,
          isValid: true,
          errMsg: "",
        };
      }

    default:
      return {
        val: val,
        isValid: true,
        errMsg: "",
      };
  }
};

export default function Login({ navigation }) {
  const [email, setEmail] = useState({
    val: "",
    isValid: true,
    errMsg: "",
  });
  const [password, setPassword] = useState({
    val: "",
    isValid: true,
    errMsg: "",
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    isUserLoggedIn();
  }, []);

  const isUserLoggedIn = async () => {
    let info = await AsyncStorage.getItem(USER_LOGGEDIN_KEY);
    info = info ? JSON.parse(info) : null;

    if (info?.email) {
      navigation.replace("HOME");
    }
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    const emailValidation = handleValidation(email.val, "EMAIL");
    const passValidation = handleValidation(password.val, "PASSWORD");

    if (!emailValidation.isValid || !passValidation.isValid) {
      setEmail(emailValidation);
      setPassword(passValidation);
      return;
    }
    let expectedData = [];
    if (isAdmin) {
      expectedData = await AsyncStorage.getItem(USER_ADMIN_KEY);
    } else {
      expectedData = await AsyncStorage.getItem(USER_MEMBER_KEY);
    }

    expectedData = JSON.parse(expectedData) || [];

    const isUserAdded = expectedData.filter((e) => e.email === email.val);

    if (isUserAdded.length === 0) {
      setError("User not found");
      return;
    }

    setError("");
    await AsyncStorage.setItem(
      USER_LOGGEDIN_KEY,
      JSON.stringify(isUserAdded[0])
    );
    //Navigate from here
    navigation.replace("HOME");
  };

  const toggleSwitch = () => {
    setIsAdmin((prev) => !prev);
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
          <Text style={styles.inputText}>Email </Text>
          <TextInput
            value={email.val}
            placeholder="Please Enter Your Email address"
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
            value={password.val}
            placeholder="Please Enter Password"
            textContentType="password"
            autoComplete="password"
            autoCapitalize="none"
            onChangeText={(val) =>
              setPassword({
                isValid: true,
                errMsg: "",
                val: val,
              })
            }
            secureTextEntry
            style={styles.input}
          />
          {!password.isValid && (
            <Text style={styles.errText}>{password.errMsg}</Text>
          )}
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
          <Text>Login</Text>
        </TouchableOpacity>

        <View style={styles.switchContainer}>
          <Text
            style={[
              { color: isAdmin ? COLORS.primary : "grey" },
              styles.inputText,
            ]}
          >
            Admin
          </Text>
          <Switch
            trackColor={{ false: COLORS.primary, true: "#767577" }}
            thumbColor={!isAdmin ? "#fff" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            style={styles.switch}
            value={!isAdmin}
          />

          <Text
            style={[
              { color: isAdmin ? "grey" : COLORS.primary },
              styles.inputText,
            ]}
          >
            Member
          </Text>
        </View>

        <Text style={[styles.errText, { marginBottom: "3%" }]}>{error}</Text>

        <Text
          onPress={() => navigation.replace("SIGNUP")}
          style={styles.linkText}
        >
          New to the management? click here
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
    paddingTop: "30%",
    // justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  box: {
    paddingVertical: "5%",
    width: "90%",
    borderColor: "grey",
    borderWidth: 1,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "10%",
    backgroundColor: "#fff",
  },
  btn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: "5%",
    paddingVertical: "3%",
    borderRadius: 50,
    width: "80%",
    alignItems: "center",
    marginTop: "5%",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "700",
  },
  inputContainer: {
    marginTop: "5%",
    marginBottom: "2%",
    width: "100%",
    paddingHorizontal: "5%",
  },
  input: {
    backgroundColor: "#fff",
    borderColor: "grey",
    borderBottomWidth: 1,
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
  },
  linkText: {
    fontSize: 12,
    fontWeight: "400",
    color: COLORS.link,
  },
  switchContainer: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: "#fff",
  },
  switch: {
    marginHorizontal: "3%",
    marginVertical: "3%",
  },
});
