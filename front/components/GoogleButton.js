import { StyleSheet, View, Text, Pressable, Platform, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import { moderateScale, moderateVerticalScale, scale, verticalScale } from "react-native-size-matters";

import colors from "../assets/colors/colors";

function GoogleButton({ children }) {
  return (
    <Animated.View
      entering={FadeInUp.delay(0).duration(1000).springify()}
      style={styles.buttonContainer}
    >
      <Pressable
        style={styles.button}
        android_ripple={{ color: "rgba(0,0,0,0.1)" }}
      >
        {/* <Ionicons name="logo-google" size={moderateScale(20)} color={colors.accent} style={styles.icon} /> */}
        <Image source={require("../assets/images/google.png")} style={styles.icon}/>
        <Text style={styles.buttonTitle}>{children}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "grey",
    // elevation: 6,
    overflow: Platform.OS === "android" ? "hidden" : "visible",
    // marginTop: moderateVerticalScale(16 * (680 / 915)),
    width: "100%",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    justifyContent: "center",
  },
  icon: {
    marginRight: scale(10),
    width: moderateScale(20),
    height:moderateScale(20),
  },
  buttonTitle: {
    fontFamily: "glacial-bold",
    fontSize: moderateScale(16 * (350 / 412)),
    color: "#444",
    padding: 2,
  },
});

export default GoogleButton;