import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Text,
  ActivityIndicator,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { verticalScale } from "react-native-size-matters";
import { useState, Fragment, useContext, useEffect } from "react";
import { Formik } from "formik";
import * as yup from "yup";
import Toast from "react-native-toast-message";

import colors from "../assets/colors/colors";
import PrimaryButton from "./PrimaryButton";
import GoogleButton from "./GoogleButton";
import ValidatedInput from "./ValidatedInput";
import { useUserStore } from "../store/userStore";
const validationSchema = yup.object().shape({
  Email: yup.string().label("Email").email().required(),
  Password: yup.string().label("Password").required(),
  // .min(6, "Password too short!"),
});

function LoginForm() {
  const setUser = useUserStore((state) => state.setUser);

  const showToast = (msg1, msg2) => {
    Toast.show({
      type: "error",
      text1: msg1,
      text2: msg2,
      position: "bottom",
    });
  };
  const navigation = useNavigation();

  async function handleLogin(values) {
    try {
      const res = await fetch(
        process.env.EXPO_PUBLIC_API_HOST + "/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      const data = await res.json();
      if (data.Result == false) {
        showToast("Error", data.Errors[0]);
      } else {
        setUser({ ...data, Password: values.Password });
        console.log({ ...data, Password: values.Password });

        if (data.Verified == false) {
          navigation.push("Verification", { Email: values.Email });
        } else {
          navigation.replace("MainApp");
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <View style={styles.loginForm}>
      {/* Title Area */}
      <View style={styles.titleArea}>
        <Animated.Text
          entering={FadeInUp.duration(1000).springify()}
          style={styles.title}
        >
          FitCheck
        </Animated.Text>
      </View>

      {/* Input Fields */}
      <View style={styles.inputArea}>
        <Formik
          initialValues={{ Email: "", Password: "" }}
          onSubmit={(values) => handleLogin(values)}
          validationSchema={validationSchema}
        >
          {(formikProps) => (
            <Fragment>
              <ValidatedInput
                placeholder="Email"
                touched={formikProps.touched.Email}
                error={formikProps.errors.Email}
                handleChange={formikProps.handleChange("Email")}
                handleBlur={formikProps.handleBlur("Email")}
                isLogin={true}
              />

              <ValidatedInput
                placeholder="Password"
                touched={formikProps.touched.Password}
                error={formikProps.errors.Password}
                handleChange={formikProps.handleChange("Password")}
                handleBlur={formikProps.handleBlur("Password")}
                isPassword={true}
                isLogin={true}
              />

              {formikProps.isSubmitting ? (
                <ActivityIndicator color={colors.accent} />
              ) : (
                // Button
                <PrimaryButton onPress={formikProps.handleSubmit}>
                  Login
                </PrimaryButton>
              )}
            </Fragment>
          )}
        </Formik>
        {/* -----or ----- */}
        <View style={styles.lineContainer}>
          <View style={styles.line}></View>
          <Text style={styles.lineText}>Or Continue With</Text>
          <View style={styles.line}></View>
        </View>
        {/* Google Button */}
        <GoogleButton>Google</GoogleButton>

        <Animated.View
          style={styles.switchArea}
          entering={FadeInUp.delay(400).duration(1000).springify()}
        >
          <Text style={styles.switchText}>Don't have an account?</Text>
          <Pressable onPress={() => navigation.replace("Signup")}>
            <Text style={styles.pressableText}>Register</Text>
          </Pressable>
        </Animated.View>
      </View>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  loginForm: {
    // width: "100%",
  },
  titleArea: {
    width: "100%",
    alignItems: "center",
    minHeight: 5,
    marginBottom: 30,
  },
  title: {
    fontFamily: "higuen",
    fontSize: 67,
  },
  inputArea: {
    width: "100%",
    paddingHorizontal: 20,
  },
  lineContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 22,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.secondary,
  },
  lineText: {
    marginHorizontal: 10,
    fontSize: 16,
    // fontWeight: "bold",
    color: colors.secondary,
  },
  switchArea: {
    flexDirection: "row",
    width: "100%",
    marginTop: 30,
    justifyContent: "center",
  },
  switchText: {
    fontSize: 15,
  },
  pressableText: {
    fontFamily: "glacial-bold",
    marginHorizontal: 4,
    color: colors.accent,
    fontSize: 15,
  },
});

export default LoginForm;
