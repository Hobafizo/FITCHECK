import React from "react";
import { View, Text, StyleSheet, StatusBar, Platform } from "react-native";
import colors from "../assets/colors/colors";

const TopBarItemDetails = ({ title }) => {
  return (
    <View style={styles.topBarItemDetails}>
      <Text style={styles.header}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  topBarItemDetails: {
    backgroundColor: colors.main,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    paddingBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.accent,
    marginBottom: 5,
  },
  header: {
    fontSize: 22,
    color: colors.accent,
  },
});

export default TopBarItemDetails;