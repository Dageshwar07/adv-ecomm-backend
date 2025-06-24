import { MyListModel } from "../models/myList.model.js";


export const addToMyListController = async (request, response) => {
  try {
    const userId = request.userId; // From auth middleware
    const {
      productId,
      productTitle,
      image,
      rating,
      price,
      oldPrice,
      brand,
      discount,
    } = request.body;

    // Validate required fields
    if (!productId || !productTitle || !image || !rating || !price) {
      return response.status(400).json({
        success: false,
        error: true,
        message: "Missing required product details",
      });
    }

    // Check if already in MyList
    const existingItem = await MyListModel.findOne({ userId, productId });
    if (existingItem) {
      return response.status(400).json({
        success: false,
        error: true,
        message: "Item already in your MyList",
      });
    }

    // Save new item
    const myListItem = new MyListModel({
      userId,
      productId,
      productTitle,
      image,
      rating,
      price,
      oldPrice,
      brand,
      discount,
    });

    const savedItem = await myListItem.save();

    return response.status(201).json({
      success: true,
      error: false,
      message: "Product saved to MyList",
      data: savedItem,
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      error: true,
      message: "Failed to save product to MyList",
      errorMessage: error.message,
    });
  }
};
export const deleteToMyListController = async (request, response) => {
  try {
    const { id } = request.params;
    const userId = request.userId;

    const deletedItem = await MyListModel.findOneAndDelete({ _id: id, userId });

    if (!deletedItem) {
      return response.status(404).json({
        error: true,
        success: false,
        message: "The item with the given ID was not found or doesn't belong to this user",
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      message: "Item deleted from MyList",
    });
  } catch (error) {
    return response.status(500).json({
      error: true,
      success: false,
      message: "Failed to delete item",
      errorMessage: error.message,
    });
  }
};
export const getMyListController = async (request, response) => {
  try {
    const userId = request.userId; // From auth middleware

    const myListItems = await MyListModel.find({ userId });

    return response.status(200).json({
      success: true,
      error: false,
      message: "MyList items fetched successfully",
      data: myListItems,
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      error: true,
      message: "Failed to fetch MyList items",
      errorMessage: error.message,
    });
  }
};
