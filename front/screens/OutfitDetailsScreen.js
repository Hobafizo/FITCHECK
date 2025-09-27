import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Pressable,
  TextInput,
} from "react-native";

import colors from "../assets/colors/colors";
import ItemCard from "../components/ItemCard";
import { Ionicons } from "@expo/vector-icons";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Card from "../components/Card";
import { useNavigation } from "@react-navigation/native";
import { outfitsDummyData } from "../store/data";
import { useOutfitStore } from "../store/outfitStore";
import { useWardrobeStore } from "../store/wardrobeStore";
import CustomBottomSheet from "../components/CustomBottomSheet";

function OutfitDetailsScreen({ route }) {
  const [editMode, setEditMode] = useState(false);
  const [selectedList, setSelectedList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToAdd, setItemToAdd] = useState(null);
  const OutfitID = route.params?.OutfitID;
  const currentOutfit = useOutfitStore((state) =>
    state.getOutfit(route.params?.OutfitID)
  );
  const setOutfits = useOutfitStore((state) => state.setOutfits);
  const wardrobeItems = useWardrobeStore((state) => state.wardrobeItems);
  const [outfitItems, setOutfitItems] = useState([]);

  const bottomSheetModalRef = useRef(null);
  const handleSheetChanges = useCallback((index) => {
    console.log("handleSheetChanges", index);
    if (index === -1) {
      setIsModalOpen(false); // or any other logic you want when closed
    } else {
      setIsModalOpen(true);
    }
  }, []);
  const toggleModal = () => {
    if (isModalOpen) {
      console.log("HI");

      bottomSheetModalRef.current?.dismiss();
    } else {
      console.log("HMM");

      bottomSheetModalRef.current?.present();
    }
    setIsModalOpen((prev) => !prev);
  };

  useEffect(() => {
    if (itemToAdd !== null) {
      handleAddItem();
    }
  }, [itemToAdd]);

  useEffect(() => {
    const items = currentOutfit.ItemIDs.map((id) =>
      wardrobeItems.find((item) => item.ItemID === id)
    );
    console.log("Items: ", items);

    setOutfitItems(items);
  }, [currentOutfit, wardrobeItems]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        !editMode && (
          <Pressable onPress={toggleModal} disabled={editMode}>
            <Ionicons name="trash" size={20} />
          </Pressable>
        ),
    });
  }, [editMode, navigation, toggleModal]);

  const navigation = useNavigation();
  function handleItemPress(id) {
    if (selectedList.includes(id)) {
      setSelectedList((prev) => prev.filter((itemId) => itemId != id));
    } else {
      setSelectedList((prev) => [...prev, id]);
    }
  }

  async function handleFetchOutfits() {
    try {
      const res = await fetch(
        process.env.EXPO_PUBLIC_API_HOST + "/wardrobe/outfits",
        {
          method: "GET",
        }
      );

      const data = await res.json();
      if (data.Result == false) {
        console.log("Error", data.Errors[0]);
      } else {
        const groupedOutfits = Object.values(
          data.Outfits.reduce((acc, curr) => {
            const { OutfitID, ItemID, Favorite } = curr;
            if (!acc[OutfitID]) {
              acc[OutfitID] = {
                OutfitID,
                ItemIDs: [],
                Favorite,
              };
            }
            acc[OutfitID].ItemIDs.push(ItemID);
            return acc;
          }, {})
        );

        setOutfits(groupedOutfits);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const handleRemoveItem = async () => {
    try {
      const res = await fetch(
        process.env.EXPO_PUBLIC_API_HOST + "/wardrobe/deleteoutfititem",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ OutfitID: OutfitID, ItemID: selectedList[0] }),
        }
      );
      const data = await res.json();
      if (data.Result == false) {
        console.log("Error", data.Errors[0]);
      } else {
        console.log("HI");
        await handleFetchOutfits();
        setSelectedList([]);
        setEditMode(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddItem = async () => {
    try {
      console.log("itemToADD: ", itemToAdd);

      const res = await fetch(
        process.env.EXPO_PUBLIC_API_HOST + "/wardrobe/addoutfititem",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ OutfitID: OutfitID, ItemID: itemToAdd }),
        }
      );
      const data = await res.json();
      if (data.Result == false) {
        console.log("Error", data.Errors[0]);
      } else {
        console.log("HI");
        await handleFetchOutfits();
        setItemToAdd(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  function handleEditMode() {
    setEditMode((prevEditMode) => {
      if (prevEditMode == true) {
        setSelectedList([]);
      }
      return !prevEditMode;
    });
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(
        process.env.EXPO_PUBLIC_API_HOST + "/wardrobe/deleteoutfit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ OutfitID: OutfitID }),
        }
      );
      const data = await res.json();
      if (data.Result == false) {
        console.log("Error", data.Errors[0]);
      } else {
        navigation.pop();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.screen}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Items</Text>
        <View style={styles.editButton}>
          <Pressable
            style={styles.editButtonInner}
            // android_ripple={{ color: "rgba(0,0,0,0.1)" }}
            onPress={handleEditMode}
          >
            {editMode == false ? (
              <Text style={styles.editText}>Edit</Text>
            ) : (
              <Text style={styles.editText}>Cancel</Text>
            )}
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.grid}>
          {outfitItems.map((item) => (
            <View key={item.ItemID} style={styles.itemContainer}>
              <ItemCard
                img={{ uri: item.localImageUri }}
                onPress={() => {
                  navigation.navigate("ItemScreen", {
                    itemIds: [item.ItemID],
                    currentIndex: 0,
                  });
                }}
                onLongPress={() => {
                  handleEditMode();
                  setSelectedList((prev) => [...prev, item.ItemID]);
                }}
              />
              {editMode == true && (
                <Pressable
                  style={styles.selectArea}
                  onPress={handleItemPress.bind(this, item.ItemID)}
                >
                  <View style={styles.selectIcon}>
                    <Ionicons
                      name={
                        selectedList.includes(item.ItemID)
                          ? "checkmark-circle"
                          : "ellipse-outline"
                      }
                      size={21}
                      color={colors.accent}
                    />
                  </View>
                </Pressable>
              )}
            </View>
          ))}

          {!editMode && (
            <View style={styles.itemContainer}>
              <Card
                onPress={() => {
                  navigation.navigate("SelectItemScreen", {
                    onSelect: (itemId) => setItemToAdd(itemId),
                  });
                }}
              >
                <Ionicons name="add" size={60} />
              </Card>
            </View>
          )}
        </View>

        {editMode && selectedList.length > 0 && (
          <Pressable style={styles.deleteButton} onPress={handleRemoveItem}>
            <Text style={styles.deleteButtonText}>Remove Selected</Text>
          </Pressable>
        )}

        <CustomBottomSheet
          ref={bottomSheetModalRef}
          onSheetChanges={handleSheetChanges}
          backgroundColor={"#FFF3E3"}
        >
          <View style={styles.bottomSheetText}>
            <Text style={styles.areYouSureText}>Are you sure?</Text>
            <Text style={styles.aboutToDeleteText}>You're about to delete</Text>
            <Text style={styles.bottomSheetItemName}>Your Outfit</Text>
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
  screen: {
    flex: 1,
    backgroundColor: colors.main,
    paddingTop: 18,
    alignItems: "center",
  },
  container: {
    flexGrow: 1,
    paddingTop: 18,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 15,
    // backgroundColor:"green",
  },
  headerTitle: {
    fontFamily: "inter-medium",
    fontSize: 24,
  },
  editButtonInner: {
    height: 36,
    padding: 5,
    justifyContent: "center",
  },
  editText: {
    textDecorationLine: "underline",
    textDecorationStyle: "solid",
    textDecorationColor: "black",
    fontFamily: "inter-medium",
    fontSize: 18,
  },

  grid: {
    paddingHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  itemContainer: {
    width: "48%",
    aspectRatio: 1,
    marginBottom: 15,
  },
  selectArea: {
    position: "absolute",
    inset: 0,
  },
  selectIcon: {
    position: "absolute",
    right: 4,
    top: 4,
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
});

export default OutfitDetailsScreen;
