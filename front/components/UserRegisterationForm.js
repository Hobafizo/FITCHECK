import {
  StyleSheet,
  View,
  TextInput,
  Text,
  Pressable,
  Dimensions,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useState, useContext, Fragment } from "react";
import {
  scale,
  verticalScale,
  moderateScale,
  moderateVerticalScale,
} from "react-native-size-matters";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Formik, useFormik } from "formik";
import * as yup from "yup";

import colors from "../assets/colors/colors";
import PrimaryButton from "./PrimaryButton";
import GoogleButton from "./GoogleButton";
import ValidatedInput from "./ValidatedInput";
import { useUserStore } from "../store/userStore";

// Responsive design related code
const { width, height } = Dimensions.get("window");
const isSmallWidth = width < 480;
const isSmallHeight = height < 900;

const validationSchema = yup.object().shape({
  FirstName: yup.string().label("Name").required(),
  LastName: yup.string().label("Name").required(),
  Password: yup
    .string()
    .label("Password")
    .required()
    .min(6, "Password too short!"),
  PasswordConfirm: yup
    .string()
    .label("Password")
    .required()
    .min(6, "Password too short!"),
  Month: yup.string().required(),
  Day: yup.string().required(),
  Year: yup.string().required(),
  Gender: yup.string().required(),
});

function UserRegisterationForm({ showToast }) {
  const navigation = useNavigation();
  const Email = useRoute().params.values.Email;
  const setUser = useUserStore((state) => state.setUser);
  
  async function handleRegister(values) {
    const birthDate = values.Year + "-" + values.Month + "-" + values.Day;
    values = { ...values, BirthDate: birthDate, Email };
    const { Month, Day, Year, ...filteredValues } = values;
    values = filteredValues;
    console.log(values);

    try {
      const res = await fetch(
        process.env.EXPO_PUBLIC_API_HOST + "/auth/register",
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
        setUser({ ...data });
        navigation.push("Verification", { Email });
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Month options
  const months = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ];

  // Generate days (1-31)
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

  // Generate years (1900 - current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 125 }, (_, i) =>
    (currentYear - i).toString()
  );

  return (
    <View style={styles.UserRegisterationForm}>
      {/* title Area */}
      <View style={styles.titleArea}>
        <Animated.Text
          //   entering={FadeInUp.duration(1000).springify()}
          style={styles.title}
        >
          Register
        </Animated.Text>
      </View>
      <View style={styles.inputArea}>
        <Formik
          initialValues={{
            FirstName: "",
            LastName: "",
            Password: "",
            PasswordConfirm: "",
            Month: "",
            Day: "",
            Year: "",
            Gender: "",
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => handleRegister(values)}
        >
          {(formikProps) => (
            <Fragment>
              <ValidatedInput
                placeholder={"First Name"}
                touched={formikProps.touched.FirstName}
                error={formikProps.errors.FirstName}
                handleChange={formikProps.handleChange("FirstName")}
                handleBlur={formikProps.handleBlur("FirstName")}
              />
              <ValidatedInput
                placeholder={"Last Name"}
                touched={formikProps.touched.LastName}
                error={formikProps.errors.LastName}
                handleChange={formikProps.handleChange("LastName")}
                handleBlur={formikProps.handleBlur("LastName")}
              />
              <ValidatedInput
                placeholder={"Password"}
                touched={formikProps.touched.Password}
                error={formikProps.errors.Password}
                handleChange={formikProps.handleChange("Password")}
                handleBlur={formikProps.handleBlur("Password")}
                isPassword={true}
              />
              <ValidatedInput
                placeholder={"Confirm Password"}
                touched={formikProps.touched.PasswordConfirm}
                error={formikProps.errors.PasswordConfirm}
                handleChange={formikProps.handleChange("PasswordConfirm")}
                handleBlur={formikProps.handleBlur("PasswordConfirm")}
                isPassword={true}
              />

              {/* Date of Birth Area */}
              <View style={styles.dobArea}>
                {/* Month Picker */}
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formikProps.values.Month}
                    onValueChange={(itemValue) =>
                      formikProps.setFieldValue("Month", itemValue)
                    }
                    style={[
                      styles.picker,
                      formikProps.touched.Month &&
                        formikProps.errors.Month && {
                          backgroundColor: "#f6b1b1",
                        },
                    ]}
                  >
                    <Picker.Item label="MM" value="" />
                    {months.map((month, index) => (
                      <Picker.Item key={index} label={month} value={month} />
                    ))}
                  </Picker>
                </View>

                {/* Day Picker */}
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formikProps.values.Day}
                    onValueChange={(itemValue) =>
                      formikProps.setFieldValue("Day", itemValue)
                    }
                    style={[
                      styles.picker,
                      formikProps.touched.Day &&
                        formikProps.errors.Day && {
                          backgroundColor: "#f6b1b1",
                        },
                    ]}
                  >
                    <Picker.Item label="DD" value="" />
                    {days.map((day, index) => (
                      <Picker.Item key={index} label={day} value={day} />
                    ))}
                  </Picker>
                </View>

                {/* Year Picker */}
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formikProps.values.Year}
                    onValueChange={(itemValue) =>
                      formikProps.setFieldValue("Year", itemValue)
                    }
                    style={[
                      styles.picker,
                      formikProps.touched.Year &&
                        formikProps.errors.Year && {
                          backgroundColor: "#f6b1b1",
                        },
                    ]}
                  >
                    <Picker.Item label={currentYear} value="" />
                    {years.map((year, index) => (
                      <Picker.Item key={index} label={year} value={year} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.genderRow}>
                <View
                  style={[
                    styles.genderButtonWrapper,
                    formikProps.values.Gender == "M" && styles.buttonSelected,
                  ]}
                >
                  <Pressable
                    style={[
                      styles.genderButton,
                      formikProps.touched.Gender &&
                        formikProps.errors.Gender && {
                          backgroundColor: "#f6b1b1",
                        },
                    ]}
                  >
                    <Text
                      style={[
                        styles.genderButtonTitle,
                        formikProps.values.Gender == "M" &&
                          styles.buttonTitleSelected,
                      ]}
                      onPress={() => formikProps.setFieldValue("Gender", "M")}
                    >
                      Male
                    </Text>
                  </Pressable>
                </View>
                <View
                  style={[
                    styles.genderButtonWrapper,
                    formikProps.values.Gender == "F" && styles.buttonSelected,
                  ]}
                >
                  <Pressable
                    style={[
                      styles.genderButton,
                      formikProps.touched.Gender &&
                        formikProps.errors.Gender && {
                          backgroundColor: "#f6b1b1",
                        },
                    ]}
                    onPress={() => formikProps.setFieldValue("Gender", "F")}
                  >
                    <Text
                      style={[
                        styles.genderButtonTitle,
                        formikProps.values.Gender == "F" &&
                          styles.buttonTitleSelected,
                      ]}
                    >
                      Female
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Button */}
              <View style={styles.button}>
                <PrimaryButton onPress={formikProps.handleSubmit}>
                  Sign Up
                </PrimaryButton>
              </View>
            </Fragment>
          )}
        </Formik>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  UserRegisterationForm: {
    paddingTop: 150,
    width: "100%",
    alignItems: "center",
    // backgroundColor: "darkred",
  },
  titleArea: {
    width: "100%",
    alignItems: "center",
    marginBottom: 35,
    // backgroundColor: "red",
  },
  title: {
    fontFamily: "higuen",
    fontSize: isSmallWidth ? scale(60) : 60,
  },
  inputArea: {
    flex: 8,
    width: "100%",
    paddingHorizontal: scale(17),
    width: isSmallWidth ? "100%" : "80%",
    // backgroundColor: "green",
  },
  inputContainer: {
    backgroundColor: "#D5C8B8",
    borderRadius: moderateScale(10), //12 before responsive
    padding: moderateScale(8), //10 before responsive
    marginBottom: verticalScale(15 * (680 / 915)),
    elevation: 5,
    width: "100%",
    // borderWidth: 1,
    // borderBottomColor: "#746d67",
    // borderStyle: "dashed",
  },
  inputField: {
    // fontFamly: "glacial-bold",
    fontWeight: "700",
    fontSize: 12,
    color: "black",
  },
  dobArea: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  pickerContainer: {
    flex: 1,
    borderRadius: 10,
    overflow: "hidden",
    height: 50,
    backgroundColor: "#D5C8B8",
    marginBottom: 15,
  },
  picker: {
    flex: 1,
    width: "100%",
    backgroundColor: "#D5C8B8",
  },
  genderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 15,
  },
  genderButtonWrapper: {
    flex: 1,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.5)",
  },
  genderButton: {
    width: "100%",
    height: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonSelected: {
    backgroundColor: colors.accent,
    borderWidth: 1.5,
    borderColor: colors.accent,
    elevation: 3,
  },
  genderButtonTitle: {
    color: "rgba(0,0,0,0.5)",
    fontFamily: "poppins",
    lineHeight: 20,
    height: "100%",
    textAlignVertical: "center",
    fontSize: 16,
  },
  buttonTitleSelected: {
    color: "white",
  },
  button: {
    marginVertical: 20,
  },
});

export default UserRegisterationForm;
