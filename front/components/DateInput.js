import { useState } from "react";
import { StyleSheet, View, TextInput, Pressable, Platform } from "react-native";
import { useField } from "formik";
import DateTimePicker from "@react-native-community/datetimepicker";

function DateInput({ name, content, alignCenter = false }) {
  const [value, setValue] = useState(content);
  const [field, meta, helpers] = useField(name);
  const [showPicker, setShowPicker] = useState(false);

  function toggleDatePicker() {
    setShowPicker((prev) => {
      return !prev;
    });
  }

  function onChange({ type }, selectedDate) {
    if (type == "set") {
      const currentDate = selectedDate;
      setValue(
        currentDate.toLocaleDateString("en-us", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })
      );
      if (Platform.OS == "android") {
        toggleDatePicker();
        console.log("here");

        helpers.setValue(currentDate.toISOString().slice(0, 10));

        console.log("testing", currentDate.toISOString().slice(0, 10));
      }
    } else {
      toggleDatePicker();
    }
  }
  return (
    <View
      style={[styles.inputContainer, alignCenter && { alignItems: "center" }]}
    >
      {showPicker && (
        <DateTimePicker
          mode="date"
          value={field.value ? new Date(field.value) : new Date()}
          onChange={onChange}
        />
      )}
      <Pressable onPress={toggleDatePicker}>
        <TextInput value={value} style={styles.inputField} editable={false} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: "#F5ECE3",
    borderRadius: 8,
    elevation: 3,
  },
  inputField: {
    fontFamily: "poppins",
    fontSize: 14,
    height: 32,
    lineHeight: 20,
    textAlignVertical: "center",
    paddingVertical: 0,
    color: "#00000080",
  },
});

export default DateInput;
