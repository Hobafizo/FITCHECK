import { StyleSheet, View, Text } from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { forwardRef } from "react";
import colors from "../assets/colors/colors";

const CustomBottomSheet = forwardRef(
  ({ onSheetChanges, backgroundColor = "#EBDFCF", children }, ref) => {
    return (
      <BottomSheetModal
        ref={ref}
        onChange={onSheetChanges}
        snapPoints={["25%", "50%", "75%", "95%"]}
        index={2}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            opacity={0.5}
          />
        )}
        backgroundStyle={{ backgroundColor: backgroundColor }}
        // handleIndicatorStyle={{ backgroundColor: colors.accent }}
      >
        <BottomSheetScrollView contentContainerStyle={styles.bottomSheetView}>
          {children}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  bottomSheetView: {
    // paddingTop: 20,
    paddingHorizontal: 20,
    gap: 15,
    // backgroundColor: "green",
  },
});

export default CustomBottomSheet;
