import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  Image,
} from "react-native";

import colors from "../assets/colors/colors";
// import visible from "../assets/images/tools/visible.png";
// import hidden from "../assets/images/tools/hidden.png";

import { Ionicons } from "@expo/vector-icons";

import { useState } from "react";
import { useField } from "formik";

function PasswordInput({ name, title, isCurrent = false }) {
  const [isVisible, setIsVisible] = useState(false);

  const [field, meta, helpers] = useField(name);
  console.log(name, field);

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputTitle}>{title}</Text>
      <View style={styles.input}>
        <TextInput
          style={styles.textBox}
          secureTextEntry={!isVisible}
          cursorColor={colors.accent}
          value={field.value}
          onChangeText={(text) => helpers.setValue(text)}
        />
        <View style={styles.textBoxIcon}>
          <Pressable
            android_ripple={{ color: "rgba(132, 95, 57, 0.7)" }}
            onPress={() =>
              setIsVisible((current) => {
                return !current;
              })
            }
          >
            {/* <Image
              source={isVisible ? hidden : visible}
              style={styles.iconImg}
            /> */}
            <Ionicons
              name={isVisible ? "eye-off-outline" : "eye-outline"}
              size={26}
              color={colors.accent}
            />
          </Pressable>
        </View>
      </View>
      {/* only for current password fields */}
      {isCurrent && (
        <Pressable style={styles.link}>
          <Text style={styles.linkText}>Forgot your password?</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    width: "100%",
    // gap: 5,
  },
  inputTitle: {
    fontFamily: "poppins-medium",
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 5,
    color: "black",
    // backgroundColor: "red",
  },
  input: {
    width: "100%",
    flexDirection: "row",
    backgroundColor: "#D5C8B8",
    borderRadius: 12,
    gap: 20,
    padding: 10,
    elevation: 4,
    alignItems: "center",
  },
  textBox: {
    flex: 1,
    height: 32,
    fontFamily: "poppins",
    fontSize: 16,
    lineHeight: 20,
    textAlignVertical: "center",
    padding: 0,
  },
  textBoxIcon: {
    borderRadius: "50%",
    overflow: "hidden",
    // opacity: 0.6,
  },
  iconImg: {
    height: 26,
    width: 26,
  },
  link: {},
  linkText: {
    color: colors.accent,
    fontFamily: "poppins-semibold",
    fontSize: 12,
    marginTop: 3,
    // backgroundColor: "green",
  },
});

export default PasswordInput;
