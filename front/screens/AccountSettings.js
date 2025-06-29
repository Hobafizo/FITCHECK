import {
  StyleSheet,
  View,
  Text,
  Image,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { Formik } from "formik";

import colors from "../assets/colors/colors";
import SectionWrapper from "../components/SectionWrapper";
import LightInput from "../components/LightInput";
import { useEffect, useLayoutEffect, useState, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import { useUserStore } from "../store/userStore";
import DateInput from "../components/DateInput";
import Toast from "react-native-toast-message";

function AccountSettings() {
  const navigation = useNavigation();
  const userInfo = useUserStore();
  const formikRef = useRef();
  const showToast = (msg1, msg2, type) => {
    Toast.show({
      type: type,
      text1: msg1,
      text2: msg2,
      position: "top",
    });
  };
  console.log("info", userInfo);
  const [isEdited, setIsEdited] = useState(false);

  //  make it useEffect instead if you want to support web and serverside rendering (from docs -v:7.x)
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          style={styles.headerButton}
          onPress={() => formikRef.current?.handleSubmit()}
          disabled={!isEdited}
        >
          <Text
            style={[
              styles.headerButtonTitle,
              !isEdited && styles.headerButtonDisabled,
            ]}
          >
            Save
          </Text>
        </Pressable>
      ),
    });
  }, [navigation, isEdited]);

  async function handleUpdateProfile(values) {
    values = { ...values, Password: userInfo.Password };
    console.log({ values });

    try {
      const res = await fetch(
        process.env.EXPO_PUBLIC_API_HOST + "/users/updateprofile",
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
        // console.log("Error", data.Errors[0]);
        showToast("Something went wrong", data.Errors[0], "error");
      } else {
        console.log("before:", userInfo);
        console.log({ values });

        const testing = { ...userInfo, ...values };
        userInfo.setUser(testing);
        console.log("here: ", { ...userInfo, ...values });

        console.log("after:", userInfo);
        formikRef.current?.resetForm({
          values: testing,
        });
        setIsEdited(false);
        showToast("Saved Changes!", "Account updated", "success");
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.screen}
    >
      <Formik
        innerRef={formikRef}
        initialValues={{
          FirstName: userInfo.FirstName,
          LastName: userInfo.LastName,
          Email: userInfo.Email,
          Gender: userInfo.Gender,
          BirthDate: userInfo.BirthDate,
          PhoneNum: userInfo.PhoneNum,
        }}
        onSubmit={(values) => handleUpdateProfile(values)}
      >
        {(formikProps) => {
          useEffect(() => {
            setIsEdited(formikProps.dirty);
          }, [formikProps.dirty]);
          return (
            <ScrollView contentContainerStyle={styles.container}>
              <SectionWrapper
                title={"Account Details"}
                style={{ paddingBottom: 0 }}
              >
                {/* <View style={styles.sectionRow}>
                <Text style={styles.rowTitle}>username</Text>
                
                <View style={styles.rowContent}>
                <LightInput
                name="FirstName"
                content={`${userInfo.FirstName} ${userInfo.LastName}`}
                />
                </View>
                </View> */}

                <View style={styles.sectionRow}>
                  <Text style={styles.rowTitle}>Email</Text>

                  <View style={styles.rowContent}>
                    <LightInput name="Email" content={`${userInfo.Email}`} readOnly={true} />
                  </View>
                </View>

                <View style={styles.line} />

                <View style={styles.passwordRow}>
                  <Pressable
                    style={styles.passwordTab}
                    onPress={() => navigation.push("ChangePassword")}
                  >
                    <Text style={styles.rowTitle}>Change password</Text>

                    <Image
                      source={require("../assets/images/tools/chevron.png")}
                      style={styles.chevron}
                    />
                  </Pressable>
                </View>
              </SectionWrapper>

              <SectionWrapper title={"Personal Details"}>
                <View style={styles.sectionRow}>
                  <Text style={styles.rowTitle}>Name</Text>

                  <View style={styles.rowContent}>
                    <LightInput
                      name={"FirstName"}
                      content={`${userInfo.FirstName} ${userInfo.LastName}`}
                    />
                  </View>
                </View>

                <View style={styles.sectionRow}>
                  <Text style={styles.rowTitle}>Phone</Text>

                  <View style={styles.rowContent}>
                    <LightInput
                      name={"PhoneNum"}
                      content={`${userInfo.PhoneNum}`}
                    />
                  </View>
                </View>

                <View style={styles.sectionRow}>
                  <Text style={styles.rowTitle}>Birth Date</Text>

                  <View style={styles.rowContent}>
                    <DateInput
                      name={"BirthDate"}
                      content={`${new Date(
                        formikProps.values.BirthDate
                      ).toLocaleDateString("en-us", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                      })}`}
                    />
                  </View>
                  {/* <View style={[styles.rowContent, { gap: 5 }]}>
                  <LightInput content={"Jun"} alignCenter={true} />
                  <LightInput content={"09"} alignCenter={true} />
                  <LightInput content={"2003"} alignCenter={true} />
                  </View> */}
                </View>

                <View style={styles.sectionRow}>
                  <Text style={styles.rowTitle}>Gender</Text>
                  <View style={[styles.rowContent, { gap: 5 }]}>
                    <View
                      style={[
                        styles.buttonWrapper,
                        formikProps.values.Gender == "M" &&
                          styles.buttonSelected,
                      ]}
                    >
                      <Pressable
                        style={styles.genderButton}
                        onPress={() => formikProps.setFieldValue("Gender", "M")}
                        android_ripple={{ color: "rgba(0,0,0,0.1)" }}
                      >
                        <Text
                          style={[
                            styles.buttonTitle,
                            formikProps.values.Gender == "M" &&
                              styles.buttonTitleSelected,
                          ]}
                        >
                          Male
                        </Text>
                      </Pressable>
                    </View>

                    <View
                      style={[
                        styles.buttonWrapper,
                        formikProps.values.Gender == "F" &&
                          styles.buttonSelected,
                      ]}
                    >
                      <Pressable
                        style={styles.genderButton}
                        onPress={() => {
                          formikProps.setFieldValue("Gender", "F");
                        }}
                        android_ripple={{ color: "rgba(0,0,0,0.1)" }}
                      >
                        <Text
                          style={[
                            styles.buttonTitle,
                            formikProps.values.Gender == "F" &&
                              styles.buttonTitleSelected,
                          ]}
                        >
                          Female
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </SectionWrapper>
            </ScrollView>
          );
        }}
      </Formik>

      <Toast />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerButtonDisabled: {
    color: "gray",
  },
  headerButton: {
    // backgroundColor: "red",
    height: "100%",
    width: 100,
    alignItems: "flex-end",
  },
  headerButtonTitle: {
    height: "100%",
    fontFamily: "poppins-medium",
    fontSize: 16,
    textAlignVertical: "bottom",
  },
  screen: {
    flex: 1,
    backgroundColor: colors.main,
  },
  container: {
    flexGrow: 1,
    paddingTop: 35,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  sectionRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  rowTitle: {
    // fontFamily: "poppins-medium",
    fontSize: 15,
  },
  rowContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "70%",
  },
  line: {
    width: "95%",
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  passwordRow: {
    overflow: "hidden",
    // backgroundColor: "green",
  },
  passwordTab: {
    height: 40,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",

    paddingHorizontal: 16,
  },
  chevron: {
    height: 20,
    width: 20,
  },
  buttonWrapper: {
    flex: 1,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.5)",
  },
  genderButton: {
    width: "100%",
    height: 33,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonTitle: {
    color: "rgba(0,0,0,0.5)",
    fontFamily: "poppins",
    lineHeight: 20,
    height: "100%",
    textAlignVertical: "center",
    fontSize: 16,
  },
  buttonSelected: {
    backgroundColor: colors.accent,
    borderWidth: 1.5,
    borderColor: colors.accent,
    elevation: 3,
  },
  buttonTitleSelected: {
    color: "white",
  },
});

export default AccountSettings;
