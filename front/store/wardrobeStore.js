import { create } from "zustand";
import * as FileSystem from "expo-file-system";

const checkImageExists = async (imageUri) => {
  const fileInfo = await FileSystem.getInfoAsync(imageUri);
  return fileInfo.exists;
};

async function downloadImage(imagePath, status) {
  try {
    const directoryPath = FileSystem.documentDirectory + "wardrobe/";
    const fileName = imagePath.split("\\").pop(); // Extract only the file name
    const localUri = directoryPath + fileName; // Append the file name to the directory path
    const normalizedUri = localUri.replace(/\\/g, "/"); // Normalize the path

    // Ensure the directory exists
    const dirInfo = await FileSystem.getInfoAsync(directoryPath);
    if (!dirInfo.exists) {
      console.log("Directory does not exist, creating:", directoryPath);
      await FileSystem.makeDirectoryAsync(directoryPath, {
        intermediates: true,
      });
    }

    const exists = await checkImageExists(normalizedUri); // Pass normalizedUri here
    if (exists) {
      // console.log("Image already exists: ", normalizedUri);
      return normalizedUri;
    }

    if (status == 2) {
      return null;
    }
    const res = await FileSystem.downloadAsync(
      process.env.EXPO_PUBLIC_API_HOST + "/asset?file=" + imagePath,
      normalizedUri
    );
    console.log("Image Downloaded to: ", res.uri);
    return res.uri;
  } catch (error) {
    console.error("Error downloading image: ", error);
    return null;
  }
}

export const useWardrobeStore = create((set) => ({
  wardrobeItems: [],
  setWardrobeItems: (newItems) => set((state) => ({ wardrobeItems: newItems })),
  getItem: (ItemID) => {
    return useWardrobeStore
      .getState()
      .wardrobeItems.find((item) => item.ItemID === ItemID);
  },
  fetchWardrobe: async () => {
    console.log("fetching..");
    
    try {
      const res = await fetch(process.env.EXPO_PUBLIC_API_HOST + "/wardrobe", {
        method: "GET",
      });

      const data = await res.json();
      if (data.Result == false) {
        console.log("Error", data.Errors[0]);
      } else {
        const itemsWithLocalImages = await Promise.all(
          data.Items.map(async (item) => {
            const localImageUri = await downloadImage(
              item.ImagePath,
              item.Status
            );

            return { ...item, localImageUri };
          })
        );
        set({ wardrobeItems: itemsWithLocalImages });
        return itemsWithLocalImages.some((item) => item.Status === 2);
      }
    } catch (error) {
      console.error(error);
    }
  },
}));
