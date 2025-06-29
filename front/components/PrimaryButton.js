import { StyleSheet, View, Text, Pressable } from "react-native";
import { Platform } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import {moderateScale, moderateVerticalScale, scale, verticalScale } from "react-native-size-matters";

import colors from "../assets/colors/colors";

function PrimaryButton({ children, onPress }) {
  return (
    <Animated.View
      entering={FadeInUp.delay(100).duration(1000).springify()}
      style={styles.buttonContainer}
    >
      <Pressable
        style={styles.button}
        android_ripple={{ color: "rgba(0,0,0,0,1)" }}
        onPress={()=>{
          console.log("testing");
          onPress();
          
        }}
      >
        <Text style={styles.buttonTitle}>{children}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    backgroundColor: colors.accent,
    borderRadius: 12, // Responsive border radius
    elevation: 6,
    overflow: Platform.OS === "android" ? "hidden" : "visible",
    marginTop: moderateVerticalScale(5 * (680 / 915)), // Responsive margin top
    width: "100%",
  },
  button: {
    padding: 15, // Responsive padding
    justifyContent: "center",
    alignItems: "center",
  },
  buttonTitle: {
    fontFamily: "inter-bold",
    // fontWeight: "700",
    fontSize: moderateScale(16 * (350 / 412)), // Responsive font size
    color: "white",
    padding: 2, // Responsive padding
    // fontWeight: "700",
  },
});

export default PrimaryButton;
