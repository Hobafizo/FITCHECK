import { StyleSheet, View, Text, TextInput, Pressable } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import colors from "../assets/colors/colors";
import { useNavigation } from "@react-navigation/native";

function ValidatedInput({
  placeholder,
  touched,
  error,
  handleChange,
  handleBlur,
  isPassword,
  isLogin = false,
}) {
  const navigation = useNavigation();
  return (
    <View style={styles.inputWrapper}>
      <Animated.View
        entering={FadeInUp.duration(1000).springify()}
        style={[styles.inputContainer, touched && error && styles.errorBorder]}
      >
        <TextInput
          placeholder={placeholder}
          secureTextEntry={isPassword}
          placeholderTextColor={"rgba(0, 0, 0, 0.5)"}
          style={styles.inputField}
          onChangeText={handleChange}
          onBlur={handleBlur}
        />
      </Animated.View>
      {touched && error && <Text style={styles.validationText}>{error}</Text>}
      {isLogin && isPassword && (
        <Pressable
          style={styles.link}
          onPress={() => navigation.navigate("RequestPassword")}
        >
          <Text style={styles.linkText}>Forgot your password?</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    marginBottom: 15,
  },
  inputContainer: {
    backgroundColor: "#D5C8B8",
    borderRadius: 12,
    padding: 10,
    elevation: 5,
  },
  errorBorder: {
    // borderWidth: 1,
    //   borderColor: "darkred",
    backgroundColor: "#f6b1b1",
  },
  inputField: {
    fontFamily: "inter",
    fontSize: 16,
    height: 32,
    paddingVertical: 0,
  },
  validationText: {
    color: "darkred",
    marginTop: 3,
    paddingLeft: 5,
    fontSize: 12,
  },
  link: {
    marginTop: 7,
    paddingLeft: 5,
  },
  linkText: {
    color: colors.accent,
    fontFamily: "poppins-semibold",
    fontSize: 13,

    // backgroundColor: "green",
  },
});

export default ValidatedInput;
