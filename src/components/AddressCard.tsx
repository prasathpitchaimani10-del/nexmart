import React from 'react';
import { MapPin, Phone, Check, Edit2, Trash2 } from 'lucide-react';
import { IAddress } from '../types';

interface AddressCardProps {
  address: IAddress;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSetDefault?: () => void;
  showActions?: boolean;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  address,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault,
  showActions = true,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-xl border transition-all text-left relative ${
        onSelect ? 'cursor-pointer' : ''
      } ${
        isSelected
          ? 'border-zinc-950 bg-zinc-50/50 shadow-sm ring-1 ring-zinc-950'
          : 'border-zinc-200 bg-white hover:border-zinc-300'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-zinc-900">{address.name}</span>
          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
            {address.addressType}
          </span>
          {address.isDefault && (
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Default
            </span>
          )}
        </div>

        {isSelected && (
          <div className="w-5 h-5 rounded-full bg-zinc-950 text-white flex items-center justify-center shrink-0">
            <Check className="w-3 h-3" />
          </div>
        )}
      </div>

      <div className="mt-2.5 text-xs text-zinc-600 space-y-1">
        <div className="flex items-start gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-zinc-400 mt-0.5 shrink-0" />
          <span>
            {address.houseFlat}, {address.street}, {address.area ? `${address.area}, ` : ''}
            {address.city}, {address.state} - <span className="font-semibold text-zinc-900">{address.pincode}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span>{address.phone}</span>
        </div>
      </div>

      {showActions && (
        <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
          <div>
            {!address.isDefault && onSetDefault && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSetDefault();
                }}
                className="text-zinc-500 hover:text-zinc-950 font-medium"
              >
                Set as Default
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="text-zinc-600 hover:text-zinc-950 flex items-center gap-1 font-medium"
              >
                <Edit2 className="w-3 h-3" /> Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
