import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/AntDesign";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { USER_MEMBER_KEY } from "../../shared/Constants";
import { COLORS } from "../../shared/Styles";
import CustomHeader from "../../components/CustomHeader";

export default function MembersList({ navigation, route }) {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    let list = await AsyncStorage.getItem(USER_MEMBER_KEY);
    list = JSON.parse(list) || [];
    const { memberDetail } = route.params;

    const membersList = (list || []).map((item) => {
      if (memberDetail.data && memberDetail.data.email === item.email) {
        return {
          isSelected: true,
          ...item,
        };
      }

      return {
        isSelected: false,
        ...item,
      };
    });
    setMembers(membersList);
  };

  const handleMemberPress = (data) => {
    route.params.handleMemberSelection(data);
    navigation.goBack();
  };

  return (
    <FlatList
      data={members}
      keyExtractor={(i) => i.email}
      contentContainerStyle={styles.container}
      ListEmptyComponent={() => <Text>No Members found!</Text>}
      ListHeaderComponent={() => (
        <CustomHeader
          heading="List Of Members"
          onIconPress={() => navigation.goBack()}
          iconName="arrowleft"
        />
      )}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => handleMemberPress(item)}
          style={[
            styles.memberItemContainer,
            styles.rowStyling,
            { borderColor: item.isSelected ? COLORS.secondary : "#000" },
            { borderWidth: item.isSelected ? 2 : 1 },
          ]}
        >
          <Text
            style={{ color: COLORS.secondary }}
          >{`${item.name}  #${item.email}`}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    padding: "5%",
    backgroundColor: COLORS.primary,
  },
  input: {
    width: "30%",
    borderBottomWidth: 0.5,
    borderRadius: 3,
    textAlign: "center",
    padding: "3%",
  },
  rowStyling: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  memberItemContainer: {
    borderWidth: 1,
    borderRadius: 10,
    padding: "5%",
    marginVertical: "3%",
    backgroundColor: "#fff",
  },
});
