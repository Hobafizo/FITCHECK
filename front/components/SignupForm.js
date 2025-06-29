import {
  StyleSheet,
  View,
  TextInput,
  Text,
  Pressable,
  Dimensions,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import {
  scale,
  verticalScale,
  moderateScale,
  moderateVerticalScale,
} from "react-native-size-matters";
import { useNavigation } from "@react-navigation/native";
import { Formik } from "formik";
import * as yup from "yup";

import colors from "../assets/colors/colors";
import PrimaryButton from "./PrimaryButton";
import GoogleButton from "./GoogleButton";
import ValidatedInput from "./ValidatedInput";
import { Fragment } from "react";

const validationSchema = yup.object().shape({
  Email: yup.string().label("Email").email().required(),
});

// Responsive design related code
const { width, height } = Dimensions.get("window");
const isSmallWidth = width < 480;
const isSmallHeight = height < 900;

function SignupForm({ showToast }) {
  const navigation = useNavigation();

  async function handleSignup(values) {
    console.log(process.env.EXPO_PUBLIC_API_HOST);

    try {
      const res = await fetch(
        process.env.EXPO_PUBLIC_API_HOST + "/auth/checkemail",
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
        navigation.push("UserRegisteration", { values });
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <View style={styles.signupForm}>
      {/* title Area */}
      <View style={styles.titleArea}>
        <Animated.Text
          entering={FadeInUp.duration(1000).springify()}
          style={styles.title}
        >
          FitCheck
        </Animated.Text>
      </View>
      <View style={styles.inputArea}>
        <Formik
          initialValues={{ Email: "" }}
          onSubmit={(values) => handleSignup(values)}
          validationSchema={validationSchema}
        >
          {(formikProps) => (
            <Fragment>
              <ValidatedInput
                placeholder={"Email"}
                error={formikProps.errors.Email}
                touched={formikProps.touched.Email}
                handleChange={formikProps.handleChange("Email")}
                handleBlur={formikProps.handleBlur("Email")}
                // isPassword={false}
              />
              {/* Button */}
              <PrimaryButton onPress={formikProps.handleSubmit}>
                Proceed
              </PrimaryButton>
            </Fragment>
          )}
        </Formik>
        {/* <Text>testing</Text> */}
        {/* -----or ----- */}
        <View style={styles.lineContainer}>
          <View style={styles.line}></View>
          <Text style={styles.lineText}>Or Continue With</Text>
          <View style={styles.line}></View>
        </View>
        {/* Google Button */}
        <GoogleButton>Google</GoogleButton>

        {/* navigation text */}
        <Animated.View
          style={styles.switchArea}
          entering={FadeInUp.delay(200).duration(1000).springify()}
        >
          <Text style={styles.switchText}>Already have an account?</Text>
          <Pressable onPress={() => navigation.replace("Login")}>
            <Text style={styles.pressableText}>Sign In</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  signupForm: {
    // flex: 13,
    // height: 650,
    width: "100%",
    alignItems: "center",
  },
  titleArea: {
    marginTop: 30,
    marginBottom: 30,
    width: "100%",
    alignItems: "center",
  },
  title: {
    fontFamily: "higuen",
    fontSize: isSmallWidth ? scale(57) : 67,
  },
  inputArea: {
    width: "100%",
    paddingHorizontal: scale(17),
    width: isSmallWidth ? "100%" : "80%",
  },
  inputContainer: {
    backgroundColor: "#D5C8B8",
    borderRadius: moderateScale(10), //12 before responsive
    padding: moderateScale(8), //10 before responsive
    marginBottom: verticalScale(15 * (680 / 915)),
    elevation: 5,
  },
  inputField: {
    fontSize: 16,
    height: 32,
    paddingVertical: 0,
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

export default SignupForm;
