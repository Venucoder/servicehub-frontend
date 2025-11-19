'use client';

import { useState } from 'react';
import { Package, TrendingUp, CheckCircle2 } from 'lucide-react';
import Button from '@/components/common/Button';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { PrepaidCardOption } from '@/types';

interface PrepaidCardFormProps {
  options: PrepaidCardOption[];
  serviceName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PrepaidCardForm({
  options,
  serviceName,
  onSuccess,
  onCancel,
}: PrepaidCardFormProps) {
  const [selectedOption, setSelectedOption] = useState<PrepaidCardOption | null>(
    options.length > 0 ? options[0] : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOption) {
      toast.error('Please select a prepaid card option');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post('/services/prepaid-cards/', {
        card_option_id: selectedOption.id,
      });

      toast.success('Prepaid card purchased successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Error buying prepaid card:', error);
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to purchase prepaid card. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (options.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Prepaid Cards Available
        </h3>
        <p className="text-gray-600 mb-6">
          This service doesn't have any prepaid card options at the moment.
        </p>
        <Button variant="secondary" onClick={onCancel}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Card Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
        <h4 className="font-semibold text-gray-900 mb-3">Buy Prepaid Card</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Service:</span>
            <span className="font-medium text-gray-900">{serviceName}</span>
          </div>
          {selectedOption && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600">Card:</span>
                <span className="font-medium text-gray-900">{selectedOption.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Units:</span>
                <span className="font-medium text-gray-900">{selectedOption.total_units} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price per Unit:</span>
                <span className="font-medium text-gray-900">₹{parseFloat(selectedOption.price_per_unit).toFixed(2)}</span>
              </div>
              {parseFloat(selectedOption.savings) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="font-semibold">You Save:</span>
                  <span className="font-bold">₹{parseFloat(selectedOption.savings).toFixed(0)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-green-200">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="font-bold text-green-600 text-lg">₹{selectedOption.price}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Select Card Option */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Prepaid Card
        </label>
        <div className="space-y-3">
          {options.map((option) => {
            const savings = parseFloat(option.savings);
            const isSelected = selectedOption?.id === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedOption(option)}
                className={`w-full p-4 border-2 rounded-lg text-left transition-all relative ${
                  isSelected
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {savings > 0 && (
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">
                      SAVE ₹{savings.toFixed(0)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{option.name}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {option.total_units} units
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 text-lg">₹{option.price}</p>
                    <p className="text-xs text-gray-600">
                      ₹{parseFloat(option.price_per_unit).toFixed(2)}/unit
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* How It Works */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
          <Package className="mr-2" size={18} />
          How Prepaid Cards Work
        </h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Buy units upfront at a discounted price</li>
          <li>Use them anytime you need (no expiry!)</li>
          <li>Visit shop and show your digital card</li>
          <li>Vendor marks units as used</li>
          <li>Track your balance in "My Cards"</li>
        </ul>
      </div>

      {/* Card Features */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-3">What's Included:</h4>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-700">
            <CheckCircle2 size={16} className="text-green-600 mr-2 flex-shrink-0" />
            <span>Digital card - never lose it!</span>
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <CheckCircle2 size={16} className="text-green-600 mr-2 flex-shrink-0" />
            <span>Use at your own pace</span>
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <CheckCircle2 size={16} className="text-green-600 mr-2 flex-shrink-0" />
            <span>No expiry date</span>
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <CheckCircle2 size={16} className="text-green-600 mr-2 flex-shrink-0" />
            <span>Real-time balance tracking</span>
          </div>
          {selectedOption && parseFloat(selectedOption.savings) > 0 && (
            <div className="flex items-center text-sm text-green-700">
              <TrendingUp size={16} className="text-green-600 mr-2 flex-shrink-0" />
              <span className="font-semibold">
                Save ₹{parseFloat(selectedOption.savings).toFixed(0)} compared to regular price
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-4 pt-4">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="flex-1"
        >
          Buy Card - ₹{selectedOption?.price || '0'}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}