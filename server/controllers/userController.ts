import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { DbService } from '../services/dbService';
import { AuthService } from '../services/authService';
import { sendSuccess, sendError } from '../utils/response';

export class UserController {
  static async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const user = await DbService.findUserById(req.user!.userId);
      if (!user) return sendError(res, 'User not found.', 404);

      const { passwordHash, otp, resetPasswordToken, ...safeUser } = user;
      return sendSuccess(res, 'Profile retrieved.', { user: safeUser });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, phone, profileImage } = req.body;
      const updates: any = {};
      if (name) updates.name = name.trim();
      if (phone) updates.phone = phone.trim();
      if (profileImage !== undefined) updates.profileImage = profileImage;

      const user = await DbService.updateUser(req.user!.userId, updates);
      if (!user) return sendError(res, 'User not found.', 404);

      const { passwordHash, otp, resetPasswordToken, ...safeUser } = user;
      return sendSuccess(res, 'Profile updated successfully.', { user: safeUser });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async changePassword(req: AuthenticatedRequest, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return sendError(res, 'Both current and new password are required.', 400);
      }
      if (newPassword.length < 6) {
        return sendError(res, 'New password must be at least 6 characters long.', 400);
      }

      const user = await DbService.findUserById(req.user!.userId);
      if (!user) return sendError(res, 'User not found.', 404);

      const isMatch = await AuthService.comparePassword(currentPassword, user.passwordHash);
      if (!isMatch) {
        return sendError(res, 'Current password is incorrect.', 400);
      }

      const newHash = await AuthService.hashPassword(newPassword);
      await DbService.updateUser(req.user!.userId, { passwordHash: newHash });

      return sendSuccess(res, 'Password changed successfully.');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  // ADDRESSES
  static async getAddresses(req: AuthenticatedRequest, res: Response) {
    try {
      const user = await DbService.findUserById(req.user!.userId);
      if (!user) return sendError(res, 'User not found.', 404);
      return sendSuccess(res, 'Addresses retrieved.', { addresses: user.addresses || [] });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async addAddress(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, phone, houseFlat, street, area, city, state, pincode, addressType, isDefault } = req.body;
      if (!name || !phone || !houseFlat || !street || !city || !state || !pincode) {
        return sendError(res, 'Please fill all mandatory address fields.', 400);
      }

      const user = await DbService.findUserById(req.user!.userId);
      if (!user) return sendError(res, 'User not found.', 404);

      const addresses = user.addresses || [];
      const makeDefault = isDefault || addresses.length === 0;

      const newAddress = {
        _id: `addr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: name.trim(),
        phone: phone.trim(),
        houseFlat: houseFlat.trim(),
        street: street.trim(),
        area: (area || '').trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        addressType: addressType || 'home',
        isDefault: makeDefault,
      };

      const updatedAddresses = makeDefault
        ? addresses.map((a: any) => ({ ...a, isDefault: false })).concat(newAddress)
        : addresses.concat(newAddress);

      const updatedUser = await DbService.updateUser(req.user!.userId, { addresses: updatedAddresses });
      return sendSuccess(res, 'Address added successfully.', { addresses: updatedUser.addresses }, 201);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async updateAddress(req: AuthenticatedRequest, res: Response) {
    try {
      const addressId = req.params.id;
      const { name, phone, houseFlat, street, area, city, state, pincode, addressType, isDefault } = req.body;

      const user = await DbService.findUserById(req.user!.userId);
      if (!user) return sendError(res, 'User not found.', 404);

      let addresses = user.addresses || [];
      const targetIdx = addresses.findIndex((a: any) => String(a._id) === String(addressId));
      if (targetIdx === -1) {
        return sendError(res, 'Address not found.', 404);
      }

      const shouldBeDefault = isDefault === true;

      addresses = addresses.map((a: any) => {
        if (String(a._id) === String(addressId)) {
          return {
            ...a,
            ...(name && { name: name.trim() }),
            ...(phone && { phone: phone.trim() }),
            ...(houseFlat && { houseFlat: houseFlat.trim() }),
            ...(street && { street: street.trim() }),
            ...(area !== undefined && { area: area.trim() }),
            ...(city && { city: city.trim() }),
            ...(state && { state: state.trim() }),
            ...(pincode && { pincode: pincode.trim() }),
            ...(addressType && { addressType }),
            ...(isDefault !== undefined && { isDefault: shouldBeDefault }),
          };
        }
        return shouldBeDefault ? { ...a, isDefault: false } : a;
      });

      const updatedUser = await DbService.updateUser(req.user!.userId, { addresses });
      return sendSuccess(res, 'Address updated successfully.', { addresses: updatedUser.addresses });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async deleteAddress(req: AuthenticatedRequest, res: Response) {
    try {
      const addressId = req.params.id;
      const user = await DbService.findUserById(req.user!.userId);
      if (!user) return sendError(res, 'User not found.', 404);

      const filtered = (user.addresses || []).filter((a: any) => String(a._id) !== String(addressId));
      // if deleted was default and we have others left, make first default
      if (filtered.length > 0 && !filtered.some((a: any) => a.isDefault)) {
        filtered[0].isDefault = true;
      }

      const updatedUser = await DbService.updateUser(req.user!.userId, { addresses: filtered });
      return sendSuccess(res, 'Address removed successfully.', { addresses: updatedUser.addresses });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async setDefaultAddress(req: AuthenticatedRequest, res: Response) {
    try {
      const addressId = req.params.id;
      const user = await DbService.findUserById(req.user!.userId);
      if (!user) return sendError(res, 'User not found.', 404);

      const updated = (user.addresses || []).map((a: any) => ({
        ...a,
        isDefault: String(a._id) === String(addressId),
      }));

      const updatedUser = await DbService.updateUser(req.user!.userId, { addresses: updated });
      return sendSuccess(res, 'Default delivery address updated.', { addresses: updatedUser.addresses });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
}
