import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity } from "react-native";

import { COLORS } from "../../shared/Styles";

import CustomHeader from "../../components/CustomHeader";
import apiClient from "../../api/Api";

export default function MembersList({ navigation, route }) {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const members = await apiClient.get("/auth/fetchMembers");

      if (members) {
        const { memberDetail } = route.params;

        const membersList = (members?.data?.data || []).map((item) => {
          if (memberDetail && memberDetail._id === item._id) {
            return {
              isSelected: true,
              ...item,
            };
          } else {
            return {
              isSelected: false,
              ...item,
            };
          }
        });

        setMembers(membersList);
      }
    } catch (error) {
      console.log("MEMBER FETCHING ERROR", error);
    }
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
            { borderBottomWidth: item.isSelected ? 2 : 1 },
          ]}
        >
          <Text
            style={{
              color: COLORS.secondary,
              fontWeight: item.isSelected ? "800" : "500",
            }}
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
    backgroundColor: "#fff",
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
    borderBottomWidth: 1,
    borderRadius: 8,
    padding: "5%",
    marginVertical: "3%",
    backgroundColor: "#fff",
  },
});
