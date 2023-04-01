import React from "react";
import { StyleSheet, Text, View } from "react-native";

import Icon from "react-native-vector-icons/AntDesign";

export default function CustomHeader({
  heading = "",
  iconName = "arrowleft",
  onIconPress,
  containerStyles,
}) {
  return (
    <View style={[styles.headingContainer, containerStyles]}>
      {onIconPress && (
        <Icon
          onPress={onIconPress}
          name={iconName}
          style={{
            alignSelf: "flex-start",
            fontSize: 30,
            marginRight: "5%",
          }}
        />
      )}
      <Text style={styles.headingText}>{heading}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headingContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: "5%",
    width: "100%",
  },
  headingText: {
    fontSize: 20,
    fontWeight: "700",
  },
});
