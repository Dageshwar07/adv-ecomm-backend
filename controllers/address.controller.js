import AddressModel from '../models/address.model.js';
import UserModel from '../models/user.model.js';

// Create new address
export const createAddress = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault,
      addressType,
    } = req.body;

    if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode || !country) {
      return res.status(400).json({
        message: 'Please provide all required address fields',
        error: true,
        success: false,
      });
    }

    // If this is set as default, unset other default addresses
    if (isDefault) {
      await AddressModel.updateMany(
        { user: req.userId, isDefault: true },
        { isDefault: false }
      );
    }

    const address = new AddressModel({
      user: req.userId,
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault: isDefault || false,
      addressType: addressType || 'HOME',
    });

    const savedAddress = await address.save();

    // Update user's address_details
    await UserModel.findByIdAndUpdate(
      req.userId,
      { $push: { address_details: savedAddress._id } }
    );

    return res.status(201).json({
      message: 'Address created successfully',
      address: savedAddress,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error('Create address error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: true,
      success: false,
    });
  }
};

// Get user addresses
export const getUserAddresses = async (req, res) => {
  try {
    const addresses = await AddressModel.find({ user: req.userId })
      .sort({ isDefault: -1, createdAt: -1 });

    return res.status(200).json({
      addresses,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error('Get user addresses error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: true,
      success: false,
    });
  }
};

// Get address by ID
export const getAddressById = async (req, res) => {
  try {
    const address = await AddressModel.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!address) {
      return res.status(404).json({
        message: 'Address not found',
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      address,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error('Get address error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: true,
      success: false,
    });
  }
};

// Update address
export const updateAddress = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault,
      addressType,
    } = req.body;

    const address = await AddressModel.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!address) {
      return res.status(404).json({
        message: 'Address not found',
        error: true,
        success: false,
      });
    }

    // If setting as default, unset other default addresses
    if (isDefault && !address.isDefault) {
      await AddressModel.updateMany(
        { user: req.userId, isDefault: true },
        { isDefault: false }
      );
    }

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (phone) updateData.phone = phone;
    if (addressLine1) updateData.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) updateData.addressLine2 = addressLine2;
    if (city) updateData.city = city;
    if (state) updateData.state = state;
    if (postalCode) updateData.postalCode = postalCode;
    if (country) updateData.country = country;
    if (isDefault !== undefined) updateData.isDefault = isDefault;
    if (addressType) updateData.addressType = addressType;

    const updatedAddress = await AddressModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    return res.status(200).json({
      message: 'Address updated successfully',
      address: updatedAddress,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error('Update address error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: true,
      success: false,
    });
  }
};

// Delete address
export const deleteAddress = async (req, res) => {
  try {
    const address = await AddressModel.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!address) {
      return res.status(404).json({
        message: 'Address not found',
        error: true,
        success: false,
      });
    }

    await AddressModel.findByIdAndDelete(req.params.id);

    // Remove from user's address_details
    await UserModel.findByIdAndUpdate(
      req.userId,
      { $pull: { address_details: req.params.id } }
    );

    // If this was the default address, set another as default
    if (address.isDefault) {
      const nextAddress = await AddressModel.findOne({ user: req.userId })
        .sort({ createdAt: -1 });
      
      if (nextAddress) {
        await AddressModel.findByIdAndUpdate(nextAddress._id, { isDefault: true });
      }
    }

    return res.status(200).json({
      message: 'Address deleted successfully',
      success: true,
      error: false,
    });
  } catch (error) {
    console.error('Delete address error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: true,
      success: false,
    });
  }
};

// Set default address
export const setDefaultAddress = async (req, res) => {
  try {
    const address = await AddressModel.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!address) {
      return res.status(404).json({
        message: 'Address not found',
        error: true,
        success: false,
      });
    }

    if (address.isDefault) {
      return res.status(400).json({
        message: 'Address is already set as default',
        error: true,
        success: false,
      });
    }

    // Unset current default address
    await AddressModel.updateMany(
      { user: req.userId, isDefault: true },
      { isDefault: false }
    );

    // Set new default address
    const updatedAddress = await AddressModel.findByIdAndUpdate(
      req.params.id,
      { isDefault: true },
      { new: true }
    );

    return res.status(200).json({
      message: 'Default address updated successfully',
      address: updatedAddress,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error('Set default address error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: true,
      success: false,
    });
  }
};

// Get default address
export const getDefaultAddress = async (req, res) => {
  try {
    const defaultAddress = await AddressModel.findOne({
      user: req.userId,
      isDefault: true,
    });

    return res.status(200).json({
      address: defaultAddress,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error('Get default address error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: true,
      success: false,
    });
  }
}; 