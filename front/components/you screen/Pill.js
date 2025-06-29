import { StyleSheet, View, Text, Pressable } from "react-native";
import colors from "../../assets/colors/colors";

function Pill({ title, isSelected, setIsSelected }) {
  return (
    <View style={[styles.container, isSelected && styles.pillSelected]}>
      <Pressable
        style={styles.pill}
        android_ripple={{ color: "rgba(0,0,0,0.1)" }}
        onPress={() => setIsSelected((prev) => title)}
      >
        <Text style={[styles.pillTitle, isSelected && styles.titleSelected]}>
          {title}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#CAC4D0",
    // borderColor: colors.accent,
    // backgroundColor: colors.main,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    minWidth: 70,
    overflow: "hidden",
  },
  pill: {
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  pillTitle: {
    // fontFamily: "poppins-medium",
    fontSize: 14,
    color: "#49454F",
    fontFamily: "inter",
    // color: colors.accent,
    // lineHeight: 20,
    // backgroundColor: "green",
  },
  pillSelected: {
    backgroundColor: colors.pineGreen,
    borderWidth: 0,
    elevation: 4,
  },
  titleSelected: {
    color: "white",
  },
});

export default Pill;
