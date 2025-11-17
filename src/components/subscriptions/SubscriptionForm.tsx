'use client';

import { useState } from 'react';
import { MapPin, Calendar, Clock, Package, CheckCircle2 } from 'lucide-react';
import Input from '@/components/forms/Input';
import Textarea from '@/components/forms/Textarea';
import Button from '@/components/common/Button';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { SubscriptionPackage } from '@/types';

interface SubscriptionFormProps {
  package: SubscriptionPackage;
  serviceName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

export default function SubscriptionForm({
  package: pkg,
  serviceName,
  onSuccess,
  onCancel,
}: SubscriptionFormProps) {
  const [deliveryType, setDeliveryType] = useState<'self_pickup' | 'auto_delivery'>('auto_delivery');
  
  const [formData, setFormData] = useState({
    delivery_address: '',
    preferred_time: '08:00',
    delivery_days: ['monday', 'wednesday', 'friday'] as string[],
    units_per_delivery: 1,
    notes: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (deliveryType === 'auto_delivery') {
      if (!formData.delivery_address.trim()) {
        newErrors.delivery_address = 'Delivery address is required for auto-delivery';
      }

      if (!formData.preferred_time) {
        newErrors.preferred_time = 'Preferred time is required';
      }

      if (formData.delivery_days.length === 0) {
        newErrors.delivery_days = 'Select at least one delivery day';
      }

      if (formData.units_per_delivery < 1) {
        newErrors.units_per_delivery = 'Units per delivery must be at least 1';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleDayToggle = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      delivery_days: prev.delivery_days.includes(day)
        ? prev.delivery_days.filter((d) => d !== day)
        : [...prev.delivery_days, day],
    }));
    if (errors.delivery_days) {
      setErrors((prev) => ({ ...prev, delivery_days: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const subscriptionData: any = {
        package_id: pkg.id,
        delivery_type: deliveryType,
      };

      if (deliveryType === 'auto_delivery') {
        subscriptionData.delivery_address = formData.delivery_address;
        subscriptionData.preferred_time = formData.preferred_time;
        subscriptionData.delivery_days = formData.delivery_days;
        subscriptionData.units_per_delivery = formData.units_per_delivery;
      }

      await api.post('/services/subscriptions/', subscriptionData);
      
      toast.success(
        deliveryType === 'self_pickup'
          ? 'Subscription created! Visit shop to use your units.'
          : 'Subscription created! Daily delivery will start soon.'
      );
      
      onSuccess();
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to create subscription. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Package Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
        <h4 className="font-semibold text-gray-900 mb-3">Subscription Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Service:</span>
            <span className="font-medium text-gray-900">{serviceName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Package:</span>
            <span className="font-medium text-gray-900">{pkg.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Units:</span>
            <span className="font-medium text-gray-900">{pkg.units} units</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Price per Unit:</span>
            <span className="font-medium text-gray-900">₹{parseFloat(pkg.price_per_unit).toFixed(2)}</span>
          </div>
          {parseFloat(pkg.savings) > 0 && (
            <div className="flex justify-between text-green-600">
              <span className="font-semibold">You Save:</span>
              <span className="font-bold">₹{parseFloat(pkg.savings).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-green-200">
            <span className="font-semibold text-gray-900">Total:</span>
            <span className="font-bold text-green-600 text-lg">₹{pkg.price}</span>
          </div>
        </div>
      </div>

      {/* Delivery Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          How would you like to use your subscription? *
        </label>
        <div className="grid grid-cols-1 gap-3">
          <button
            type="button"
            onClick={() => setDeliveryType('auto_delivery')}
            className={`p-4 border-2 rounded-lg transition-all text-left ${
              deliveryType === 'auto_delivery'
                ? 'border-green-600 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex items-start space-x-3">
              <MapPin
                className={deliveryType === 'auto_delivery' ? 'text-green-600' : 'text-gray-600'}
                size={20}
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-1">Auto Delivery</p>
                <p className="text-sm text-gray-600">
                  Daily delivery at your doorstep at preferred time
                </p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setDeliveryType('self_pickup')}
            className={`p-4 border-2 rounded-lg transition-all text-left ${
              deliveryType === 'self_pickup'
                ? 'border-green-600 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex items-start space-x-3">
              <Package
                className={deliveryType === 'self_pickup' ? 'text-green-600' : 'text-gray-600'}
                size={20}
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-1">Self Pickup</p>
                <p className="text-sm text-gray-600">
                  Visit shop whenever you need. Flexible timing.
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Auto Delivery Settings */}
      {deliveryType === 'auto_delivery' && (
        <>
          <Input
            label="Delivery Address *"
            name="delivery_address"
            value={formData.delivery_address}
            onChange={handleInputChange}
            placeholder="Enter your complete delivery address"
            error={errors.delivery_address}
            icon={<MapPin size={18} />}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Delivery Time *
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="time"
                name="preferred_time"
                value={formData.preferred_time}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900"
              />
            </div>
            {errors.preferred_time && (
              <p className="mt-1 text-sm text-red-600">{errors.preferred_time}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Days *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => handleDayToggle(day.value)}
                  className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                    formData.delivery_days.includes(day.value)
                      ? 'border-green-600 bg-green-50 text-green-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
            {errors.delivery_days && (
              <p className="mt-1 text-sm text-red-600">{errors.delivery_days}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Selected: {formData.delivery_days.length} day(s)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Units per Delivery *
            </label>
            <input
              type="number"
              name="units_per_delivery"
              value={formData.units_per_delivery}
              onChange={handleInputChange}
              min={1}
              max={pkg.units}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900"
            />
            {errors.units_per_delivery && (
              <p className="mt-1 text-sm text-red-600">{errors.units_per_delivery}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              How many units to deliver each time
            </p>
          </div>
        </>
      )}

      {/* Self Pickup Instructions */}
      {deliveryType === 'self_pickup' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
            <Package className="mr-2" size={18} />
            Pickup Instructions
          </h4>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Visit shop anytime during business hours</li>
            <li>Show your digital subscription card</li>
            <li>Provider will mark units as used</li>
            <li>Track remaining units in "My Subscriptions"</li>
          </ul>
        </div>
      )}

      {/* Additional Notes */}
      <Textarea
        label="Additional Notes (Optional)"
        name="notes"
        value={formData.notes}
        onChange={handleInputChange}
        placeholder="Any special instructions..."
        rows={3}
      />

      {/* Subscription Features */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-3">What's Included:</h4>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-700">
            <CheckCircle2 size={16} className="text-green-600 mr-2 flex-shrink-0" />
            <span>{pkg.units} units total</span>
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <CheckCircle2 size={16} className="text-green-600 mr-2 flex-shrink-0" />
            <span>Pause or cancel anytime</span>
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <CheckCircle2 size={16} className="text-green-600 mr-2 flex-shrink-0" />
            <span>Digital tracking of usage</span>
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <CheckCircle2 size={16} className="text-green-600 mr-2 flex-shrink-0" />
            <span>No expiry date - use at your pace</span>
          </div>
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
          Subscribe Now
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

      {/* Info Note */}
      <p className="text-xs text-gray-500 text-center">
        {deliveryType === 'self_pickup'
          ? 'Your subscription will be active immediately. Visit shop to use your units.'
          : 'Delivery will start based on selected days and time.'}
      </p>
    </form>
  );
}