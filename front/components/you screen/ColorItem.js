import { StyleSheet, View, Pressable } from "react-native";

function ColorItem({ color, setSelectedSkin, isSelected }) {
  const colors = {
    white: "#F3DCC6",
    brown: "#8D5524",
    black: "#3B2E25",
  };
  return (
    <View
      style={[
        styles.item,
        isSelected && styles.itemSelected,
        { backgroundColor: colors[color] },
      ]}
    >
      <Pressable
        android_ripple={{ color: "rgba(0,0,0,0.1)" }}
        style={{ width: "100%", height: "100%" }}
        onPress={() => {
          setSelectedSkin(color);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    borderRadius: "50%",
    borderWidth: 1,
    height: 30,
    width: 30,
    overflow: "hidden",
  },
  itemSelected: {
    height: 32,
    width: 32,
    borderWidth: 1.5,
    elevation: 6, 
  },
});

export default ColorItem;
