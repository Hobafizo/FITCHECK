import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  Pressable,
  Image,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Formik } from "formik";
import colors from "../assets/colors/colors";
import PasswordInput from "../components/PasswordInput";
import PrimaryButton from "../components/PrimaryButton";
import { useUserStore } from "../store/userStore";
import Toast from "react-native-toast-message";
import ValidatedInput from "../components/ValidatedInput";

function ChangePasswordAuthScreen() {
  //   const userInfo = useUserStore();
  const navigation = useNavigation();
  const route = useRoute();
  const { Email } = route.params;

  async function handleChangePassword(values) {
    console.log({ values });
    // return;
    const showToast = (msg1, msg2, type) => {
      Toast.show({
        type: type,
        text1: msg1,
        text2: msg2,
        position: "bottom",
      });
    };
    // return;
    try {
      const res = await fetch(
        process.env.EXPO_PUBLIC_API_HOST + "/auth/forgetpw",
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
        showToast("Somethng went wrong", data.Errors[0], "error");
      } else {
        showToast(
          "Password Changed!",
          "Your password has been updated",
          "success"
        );
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen}>
      <Formik
        initialValues={{
          Email: Email,
          Password: "",
          PasswordConfirm: "",
          ForgetCode: "",
        }}
        onSubmit={(values) => handleChangePassword(values)}
      >
        {(formikProps) => (
          <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.form}>
              <View style={styles.inputArea}>
                <PasswordInput name="Password" title={"New Password"} />
                <PasswordInput
                  name="PasswordConfirm"
                  title={"Confirm Password"}
                />
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputTitle}>Confirmation Code</Text>
                  <ValidatedInput
                    placeholder={"####"}
                    error={formikProps.errors.ForgetCode}
                    touched={formikProps.touched.ForgetCode}
                    handleBlur={formikProps.handleBlur("ForgetCode")}
                    handleChange={formikProps.handleChange("ForgetCode")}
                  />
                </View>
              </View>
              <PrimaryButton
                children={"Confirm"}
                onPress={() => formikProps.handleSubmit()}
              />
            </View>
          </ScrollView>
        )}
      </Formik>
      <Toast />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.main,
  },
  container: {
    flexGrow: 1,
    paddingTop: 35,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  form: {
    width: "100%",
    // gap: 35,
    alignItems: "center",
  },
  inputArea: {
    paddingVertical: 10,
    gap: 15,
  },
  inputTitle: {
    fontFamily: "poppins-medium",
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 5,
    color: "black",
    // backgroundColor: "red",
  },
});

export default ChangePasswordAuthScreen;
