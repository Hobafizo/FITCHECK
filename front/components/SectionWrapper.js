import { StyleSheet, View, Text } from "react-native";

function SectionWrapper({ title, style, children }) {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={[styles.sectionContent, style]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    width: "100%",
    marginBottom: 34,
    // backgroundColor: "red",
  },
  sectionTitle: {
    fontFamily: "poppins-medium",
    fontSize: 20,
    color: "#1E2E33",
    // marginBottom: 4,
    fontWeight: "medium",
  },
  sectionContent: {
    backgroundColor: "#E8DDCC",
    paddingVertical: 21,
    // paddingHorizontal: 16,
    alignItems: "flex-end",
    borderRadius: 10,
    justifyContent: "space-between",
    gap: 15,
    elevation: 6,
  },
});

export default SectionWrapper;
