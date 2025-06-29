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
import { Formik } from "formik";
import colors from "../assets/colors/colors";
import PasswordInput from "../components/PasswordInput";
import PrimaryButton from "../components/PrimaryButton";
import { useUserStore } from "../store/userStore";
import Toast from "react-native-toast-message";

function ChangePasswordScreen() {
  const userInfo = useUserStore();

  async function handleChangePassword(values) {
    console.log({ values });
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
        showToast("Somethng went wrong", data.Errors[0], "error");
      } else {
        console.log("here");
        
        showToast("Saved Changes!", "Account updated", "success");
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen}>
      <Formik
        initialValues={{
          FirstName: userInfo.FirstName,
          LastName: userInfo.LastName,
          Email: userInfo.Email,
          Gender: userInfo.Gender,
          BirthDate: userInfo.BirthDate,
          PhoneNum: userInfo.PhoneNum,
          Password: "",
          newPassword: "",
          NewPasswordConfirm: "",
        }}
        onSubmit={(values) => handleChangePassword(values)}
      >
        {(formikProps) => (
          <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.form}>
              <View style={styles.inputArea}>
                {/* Current Password */}
                <PasswordInput
                  name="Password"
                  title={"Current Password"}
                  isCurrent={true}
                />
                <PasswordInput name="NewPassword" title={"New Password"} />
                <PasswordInput
                  name="NewPasswordConfirm"
                  title={"Confirm Password"}
                />
              </View>
              <PrimaryButton
                children={"Confirm"}
                onPress={async () => {
                  await formikProps.handleSubmit();
                  formikProps.resetForm();
                }}
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
    gap: 35,
    alignItems: "center",
  },
  inputArea: {
    paddingVertical: 10,
    gap: 15,
  },
});

export default ChangePasswordScreen;
