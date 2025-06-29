import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useLayoutEffect,
} from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
} from "react-native";

import colors from "../assets/colors/colors";
import CustomBottomSheet from "../components/CustomBottomSheet";
import { filtersData } from "../store/data";
import ProcessingScreen from "../components/ProcessingScreen";
import CollapsibleRow from "../components/CollapsibleRow";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import { useWardrobeStore } from "../store/wardrobeStore";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";

function ItemScreen() {
  const navigation = useNavigation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  // const wardrobeItems = useWardrobeStore((state) => state.wardrobeItems);
  const getItem = useWardrobeStore((state) => state.getItem);
  const fetchWardrobe = useWardrobeStore((state) => state.fetchWardrobe);
  const {
    params: { isConfirm = false, itemIds = [], currentIndex },
  } = useRoute();
  const currentItemID = itemIds[currentIndex];
  const item = getItem(currentItemID);
  const [itemName, setItemName] = useState(item?.ItemName);
  const [brandName, setBrandName] = useState(item?.BrandName);
  const [tags, setTags] = useState({
    Occasion: [],
    Category: [],
    Color: [],
    Season: [],
  });

  useLayoutEffect(() => {
    if (isConfirm) {
      navigation.setOptions({
        title: `(${currentIndex + 1}/${itemIds.length})`,
      });
    }
  }, []);

  useLayoutEffect(() => {
    if (!isConfirm) {
      navigation.setOptions({
        headerRight: (props) =>
          isEdited ? (
            <Pressable onPress={handleSave}>
              <Text style={styles.saveChanges}>Save</Text>
            </Pressable>
          ) : null,
      });
    }
  }, [navigation, itemName, brandName, tags, isEdited]);

  useEffect(() => {
    fillTags();
  }, []);

  useEffect(() => {
    console.log(item);
    if (item?.Status == 2) {
      setIsProcessing(true);
    } else {
      setIsProcessing(false);
    }
  }, [item?.Status]);

  const handleSelectTag = (filterGroup, updatedTags) => {
    setTags((prev) => ({ ...prev, [filterGroup]: updatedTags || [] }));
    setIsEdited(true);
  };

  const fillTags = () => {
    var newtags = {
      Occasion: [],
      style: [],
      Category: [],
      Color: [],
      Season: [],
    };

    item?.Tags?.forEach(({ Class, Tag }) => {
      console.log("Outer");
      console.log({ Class, Tag });
      console.log("this: ", newtags[Class]);

      if (newtags[Class]) {
        if (Class === "Color" && !filtersData[3].options.includes(Tag)) {
          filtersData[3].options.push(Tag);
        }
        console.log("inner");

        console.log({ Class, Tag });

        newtags[Class].push(Tag);
      }
    });
    setTags(newtags);
  };

  const handleSave = async () => {
    const Tags = Object.entries(tags)
      .map(([Class, Tags]) => Tags.map((Tag) => ({ Class, Tag })))
      .flat();

    console.log(process.env.EXPO_PUBLIC_API_HOST);
    try {
      const res = await fetch(
        process.env.EXPO_PUBLIC_API_HOST + "/wardrobe/modify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ItemID: item?.ItemID,
            ItemName: itemName,
            BrandName: brandName,
            Tags: Tags,
          }),
        }
      );
      console.log("route id: " + currentItemID);
      console.log("fetched: " + item?.ItemID);
      console.log(
        "JSON.Stringify: " + JSON.stringify({ ItemID: currentItemID })
      );
      const data = await res.json();
      if (data.Result == false) {
        console.log("Error", data.Errors[0]);
      } else {
        // navigation.pop();
        setIsEdited(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    console.log(process.env.EXPO_PUBLIC_API_HOST);
    try {
      const res = await fetch(
        process.env.EXPO_PUBLIC_API_HOST + "/wardrobe/delete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ItemID: currentItemID }),
        }
      );
      console.log("item id: " + currentItemID);
      console.log(
        "JSON.Stringify: " + JSON.stringify({ ItemID: currentItemID })
      );
      const data = await res.json();
      if (data.Result == false) {
        console.log("Error", data.Errors[0]);
      } else {
        FileSystem.deleteAsync(item.localImageUri);
        console.log("deleted: " + item.localImageUri);

        navigation.pop();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const toggleModal = () => {
    if (isModalOpen) {
      bottomSheetModalRef.current?.dismiss();
    } else {
      bottomSheetModalRef.current?.present();
    }
    setIsModalOpen((prev) => !prev);
  };

  const handleSheetChanges = useCallback((index) => {
    console.log("handleSheetChanges", index);
  }, []);

  const bottomSheetModalRef = useRef(null);

  return (
    <KeyboardAvoidingView style={styles.container}>
      {isConfirm && (
        <View style={styles.wizardContainer}>
          <View style={styles.navigatorsContainer}>
            {currentIndex > 0 && (
              <View style={styles.navigatorWrapper}>
                <Pressable
                  style={styles.prevButton}
                  onPress={() => navigation.pop()}
                >
                  <Text style={[styles.buttonTitle, styles.prevTitle]}>
                    Previous
                  </Text>
                </Pressable>
              </View>
            )}
            <View style={styles.navigatorWrapper}>
              <Pressable
                style={styles.nextButton}
                onPress={() => {
                  if (isEdited) {
                    handleSave();
                    fetchWardrobe();
                  }
                  if (currentIndex + 1 === itemIds.length) {
                    navigation.reset({
                      index: 0,
                      routes: [{ name: "Wardrobe" }],
                    });
                  } else {
                    navigation.push("ItemScreen", {
                      itemIds: itemIds,
                      currentIndex: currentIndex + 1,
                      isConfirm: true,
                    });
                  }
                }}
              >
                <Text style={[styles.buttonTitle, styles.nextTitle]}>
                  {currentIndex + 1 === itemIds.length ? "Confirm" : "Next"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: isConfirm && 100 }}
        showsVerticalScrollIndicator={false}
      >
        {isProcessing && <ProcessingScreen />}

        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: item?.localImageUri,
            }}
            style={styles.image}
          />
        </View>
        <View style={styles.brandWrapper}>
          <TextInput
            value={brandName}
            placeholder="Brand Name"
            style={styles.itemBrand}
            onChangeText={(text) => {
              setBrandName(text);
              setIsEdited(true);
            }}
          />

          <Image
            source={require("../assets/images/tools/pencil-outline.png")}
            style={{ height: 13, width: 13 }}
          />
        </View>
        <View style={styles.itemNameWrapper}>
          <TextInput
            value={itemName}
            placeholder="Item Name"
            placeholderTextColor={"#000"}
            style={styles.itemName}
            onChangeText={(text) => {
              setItemName(text);
              setIsEdited(true);
            }}
          />

          <Image
            source={require("../assets/images/tools/pencil-outline.png")}
            style={{ height: 15, width: 15 }}
          />
        </View>

        <View style={styles.alterTagsArea}>
          {filtersData.map((filter) => (
            <CollapsibleRow
              key={filter.id}
              title={filter.filterGroup}
              list={tags[filter.filterGroup]}
              updateList={handleSelectTag}
            />
          ))}
        </View>
        <Pressable style={styles.deleteButton} onPress={toggleModal}>
          <Text style={styles.deleteButtonText}>Delete Item</Text>
        </Pressable>

        <CustomBottomSheet
          ref={bottomSheetModalRef}
          onSheetChanges={handleSheetChanges}
          backgroundColor={"#FFF3E3"}
        >
          <View style={styles.bottomSheetText}>
            <Text style={styles.areYouSureText}>Are you sure?</Text>
            <Text style={styles.aboutToDeleteText}>You're about to delete</Text>
            <Text style={styles.bottomSheetItemName}>
              {item?.ItemName || "Item Name"}
            </Text>
            <Text style={styles.aboutToDeleteText}>
              This action cannot be undone.
            </Text>
          </View>
          <View style={styles.bottomSheetDeleteButtonContainer}>
            <Pressable
              style={styles.bottomSheetDeleteButton}
              onPress={handleDelete}
            >
              <Text style={styles.bottomSheetDeleteButtonText}>
                Yes, Delete
              </Text>
            </Pressable>
          </View>
          <View style={styles.bottomSheetCancelButtonContainer}>
            <Pressable
              style={styles.bottomSheetCancelButton}
              onPress={toggleModal}
            >
              <Text style={styles.bottomSheetCancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </CustomBottomSheet>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: colors.main,
  },
  alterTagsArea: {
    marginTop: 30,
    gap: 20,
  },
  pageTitle: {
    fontSize: 26,
    fontFamily: "higuen",
    color: "#000",
    textAlign: "center",
    paddingBottom: 0,
    textDecorationLine: "none", // Remove default underline
    position: "relative",
  },
  saveChanges: {
    fontFamily: "inter",
    fontSize: 18,
    // backgroundColor: "green",
  },
  underline: {
    height: 1, // Thickness of the underline
    backgroundColor: "#000", // Color of the underline
    width: "17%", // Adjust width as needed
    alignSelf: "center",
    marginTop: 0, // Distance between text and underline
  },
  tagsArea: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 20,
  },
  tag: {
    minWidth: 100,
    justifyContent: "center",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#BDBDBD",
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 7,
    borderRadius: 6,
    alignItems: "center",
  },
  tagIcon: {
    width: 22,
    aspectRatio: 1,
  },
  tagTitle: {
    fontFamily: "roboto-medium",
    fontSize: 16,
  },
  bottomSheetText: {
    marginTop: 20,
    padding: 20,
    backgroundColor: colors.mainDark,
    borderRadius: 10,
    marginBottom: 20,
  },
  areYouSureText: {
    fontSize: 27,
    fontFamily: "higuen",
    color: "#000",
    textAlign: "center",
    paddingBottom: 25,
  },
  aboutToDeleteText: {
    fontSize: 14,
    fontFamily: "inter",
    color: "#000",
    textAlign: "center",
    paddingTop: 10,
  },
  bottomSheetItemName: {
    fontSize: 14,
    fontFamily: "inter-bold",
    color: "#000",
    textAlign: "center",
  },
  imageContainer: {
    backgroundColor: "white",
    aspectRatio: 1,
    width: "100%",
    borderRadius: 5,
    elevation: 4,
  },
  image: {
    objectFit: "contain",
    height: "100%",
    width: "100%",
  },
  brandWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 3,
    // backgroundColor: "green",
    marginTop: 16,
  },
  itemBrand: {
    fontSize: 16,
    color: "#777",
    fontFamily: "inter",
    padding: 0,
  },
  itemNameWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  itemName: {
    fontSize: 22,
    color: "#000",
    fontFamily: "inter-medium",
    padding: 0,
    // backgroundColor: "red",
  },
  deleteButtonText: {
    fontFamily: "inter-semibold",
    paddingVertical: 10,
    borderRadius: 5,
    alignSelf: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#AC3434",
    textDecorationLine: "underline",
  },

  bottomSheetDeleteButtonContainer: {
    height: 53,
    // marginTop: 15,
    backgroundColor: "#EB4141",
    elevation: 1,
    borderRadius: 12,
    overflow: "hidden",
    // width: "100%",
  },
  bottomSheetDeleteButton: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 120,
  },
  bottomSheetDeleteButtonText: {
    fontFamily: "poppins-semibold",
    color: "white",
    fontSize: 16,
  },
  bottomSheetCancelButtonContainer: {
    height: 53,
    // marginTop: 15,
    backgroundColor: colors.secondary,
    elevation: 1,
    borderRadius: 12,
    overflow: "hidden",
    // width: "100%",
  },
  bottomSheetCancelButton: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 120,
  },
  bottomSheetCancelButtonText: {
    fontFamily: "poppins-semibold",
    color: "white",
    fontSize: 16,
  },
  wizardContainer: {
    position: "absolute",
    inset: 0,
    justifyContent: "flex-end",
    // paddingVertical: 16,
  },
  navigatorsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    gap: 12,
    paddingHorizontal: 10,
    paddingBottom: 20,
    paddingTop: 15,
    zIndex: 100,

    // borderTopWidth: 0.5,
    // borderTopColor: "black",
    // borderTopWidth: 2,
    // borderTopColor:"black",
    backgroundColor: colors.main,
  },
  navigatorWrapper: {
    flex: 1,
    height: 60,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
  },
  prevButton: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  nextButton: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonTitle: {
    fontFamily: "inter-semibold",
    fontSize: 18,
  },
  prevTitle: {
    color: "white",
  },
  nextTitle: {
    color: "black",
  },
});

export default ItemScreen;
