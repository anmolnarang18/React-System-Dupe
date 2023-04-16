import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

import Icon from "react-native-vector-icons/AntDesign";

import { COLORS } from "../shared/Styles";

export default function CustomFloatingBtn({ onBtnPress, parentStyles, iconName='plus' }) {
  return (
    <TouchableOpacity onPress={onBtnPress} style={[styles.floatingBtn, parentStyles]}>
      <Icon name={iconName} style={styles.icon} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  floatingBtn: {
    position: "absolute",
    bottom: 60,
    right: 20,
    borderRadius: 25,
    height: 50,
    width: 50,
    backgroundColor: COLORS.secondary,
    zIndex: 999,
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
  },
  icon: {
    color: "#fff",
    fontSize: 30,
  },
});
