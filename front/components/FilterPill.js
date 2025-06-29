import { StyleSheet, View, Text, Pressable } from "react-native";
import colors from "../assets/colors/colors";
import { useEffect, useState } from "react";

function FilterPill({ title, isSelected, handleList }) {
  const [isPillSelected, setIsPillSelected] = useState(false);
  useEffect(() => {
    setIsPillSelected(isSelected);
  }, [isSelected]);
  return (
    <View style={[styles.wrapper, isPillSelected && styles.wrapperSelected]}>
      <Pressable
        style={styles.container}
        onPress={() => {
          setIsPillSelected((prev) => !prev);
          handleList(title);
        }}
      >
        <Text
          style={[styles.pillTitle, isPillSelected && styles.pillTitleSelected]}
        >
          {title}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    borderColor: "#CAC4D0",
    borderRadius: 5,
  },
  wrapperSelected: {
    borderColor: colors.pineGreen,
    backgroundColor: colors.pineGreen,
  },
  container: {
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  pillTitle: {
    fontFamily: "inter",
    fontSize: 14,
    color: "#49454F",
  },
  pillTitleSelected: {
    color: "white",
  },
});

export default FilterPill;
