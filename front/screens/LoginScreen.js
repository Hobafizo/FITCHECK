import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import Toast from "react-native-toast-message";

import colors from "../assets/colors/colors";
import LoginForm from "../components/LoginForm";

function LoginScreen() {
  const showToast = (msg1, msg2) => {
    Toast.show({
      type: "error",
      text1: msg1,
      text2: msg2,
      position: "bottom",
    });
  };
  return (
    <KeyboardAvoidingView style={{ height: "100%", width: "100%" }}>
      <ScrollView contentContainerStyle={styles.screen}>
        {/* Icon Area */}
        <View style={styles.iconArea}>
          <Animated.Image
            entering={FadeInUp.delay(200).duration(1000).springify()}
            source={require("../assets/images/Picture1.png")}
            style={styles.icon}
          />
        </View>

        {/* Form Area */}
        <LoginForm showToast={showToast}/>
        <Toast />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    backgroundColor: colors.main,
    padding: 4, // Adjust if needed
  },
  iconArea: {
    // flex: 3,
    height: 200,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  icon: {
    width: 70,
    height: 70,
    left: 130,
    bottom: 35,
  },
});

export default LoginScreen;
