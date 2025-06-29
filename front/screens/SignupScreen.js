import {
  StyleSheet,
  View,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { scale, verticalScale } from "react-native-size-matters";
import Toast from "react-native-toast-message";

import colors from "../assets/colors/colors";
import SignupForm from "../components/SignupForm";

// Responsive design related code
const { width, height } = Dimensions.get("window");
const isSmallWidth = width < 480;
const isSmallHeight = height < 900;

function SignupScreen() {
  const showToast = (msg1, msg2) => {
    Toast.show({
      type: "error",
      text1: msg1,
      text2: msg2,
      position: "bottom",
    });
  };
  return (
    <KeyboardAvoidingView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* star Area */}
        <View style={styles.starArea}>
          <Animated.Image
            entering={FadeInUp.delay(200).duration(1000).springify()}
            source={require("../assets/images/Picture1.png")}
            style={styles.star}
          />
        </View>

        {/* Form Area */}
        <SignupForm showToast={showToast}/>
        <Toast />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    backgroundColor: colors.main,
    padding: scale(4 * (350 / 412)),
    paddingVertical: verticalScale(40),
  },
  starArea: {
    height: 170,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  star: {
    width: isSmallWidth ? scale(70 * (350 / 412)) : 70, // Responsive width
    height: isSmallWidth ? scale(70 * (350 / 412)) : 70, // Responsive width
    // left: 130, // Responsive left position
    // bottom: 35, // Responsive bottom position
    left: isSmallWidth ? scale(130 * (350 / 412)) : "25%", // Responsive left position
    bottom: isSmallHeight ? verticalScale(35 * (680 / 915)) : "15", // Responsive bottom position
  },
});

export default SignupScreen;
