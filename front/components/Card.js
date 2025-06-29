import { StyleSheet, View, Pressable } from "react-native";

function Card({ onPress, onLongPress, children }) {
  return (
    <View style={styles.container}>
      <Pressable
        android_ripple={{ color: "rgba(0,0,0,0.1)" }}
        style={styles.innerContainer}
        onPress={onPress}
        onLongPress={onLongPress}
      >
        {children}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    elevation: 4,
    backgroundColor: "#EEEDEB",
    overflow: "hidden",
  },
  innerContainer: {
    flexDirection: "row",
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 3,
    overflow: "hidden",
  },
});

export default Card;
