'use client';

import { useState } from 'react';
import { MapPin, Calendar, Clock, MessageSquare, Zap, Package } from 'lucide-react';
import Input from '@/components/forms/Input';
import Textarea from '@/components/forms/Textarea';
import Select from '@/components/forms/Select';
import Button from '@/components/common/Button';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface OrderFormProps {
  service: {
    id: string;
    name: string;
    base_price: string;
    subscription_price: string | null;
    unit: string;
  };
  orderType: 'one_time' | 'subscription';
  quantity: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function OrderForm({
  service,
  orderType,
  quantity,
  onSuccess,
  onCancel,
}: OrderFormProps) {
  const [deliveryType, setDeliveryType] = useState<'immediate' | 'scheduled'>('immediate');
  const [usageType, setUsageType] = useState<'pickup' | 'auto_delivery'>('auto_delivery');
  
  const [formData, setFormData] = useState({
    delivery_address: '',
    delivery_date: '',
    delivery_time_slot: 'morning',
    custom_time: '',
    notes: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const timeSlots = [
    { value: 'morning', label: 'Morning (6 AM - 10 AM)' },
    { value: 'mid_morning', label: 'Mid Morning (10 AM - 12 PM)' },
    { value: 'afternoon', label: 'Afternoon (12 PM - 4 PM)' },
    { value: 'evening', label: 'Evening (4 PM - 7 PM)' },
    { value: 'night', label: 'Night (7 PM - 9 PM)' },
    { value: 'custom', label: 'Custom Time (specify below)' },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // For one-time orders with delivery (not pickup)
    if (orderType === 'one_time') {
      if (!formData.delivery_address.trim()) {
        newErrors.delivery_address = 'Delivery address is required';
      }

      if (deliveryType === 'scheduled') {
        if (!formData.delivery_date) {
          newErrors.delivery_date = 'Delivery date is required';
        } else {
          const selectedDate = new Date(formData.delivery_date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (selectedDate < today) {
            newErrors.delivery_date = 'Delivery date cannot be in the past';
          }
        }
      }

      if (formData.delivery_time_slot === 'custom' && !formData.custom_time) {
        newErrors.custom_time = 'Please specify custom time';
      }
    }

    // For subscriptions with auto-delivery
    if (orderType === 'subscription' && usageType === 'auto_delivery') {
      if (!formData.delivery_address.trim()) {
        newErrors.delivery_address = 'Delivery address is required for auto-delivery';
      }

      if (!formData.delivery_date) {
        newErrors.delivery_date = 'Start date is required';
      }

      if (formData.delivery_time_slot === 'custom' && !formData.custom_time) {
        newErrors.custom_time = 'Please specify preferred delivery time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (orderType === 'subscription') {
        const subscriptionData = {
          service_id: service.id,
          start_date: formData.delivery_date || new Date().toISOString().split('T')[0],
          total_units: 30,
          auto_renew: true,
          notes: `Usage Type: ${usageType}. ${formData.notes}`,
        };

        await api.post('/services/subscriptions/', subscriptionData);
        toast.success(
          usageType === 'pickup'
            ? 'Subscription created! Visit shop to use your units.'
            : 'Subscription created! Daily delivery will start from selected date.'
        );
      } else {
        const orderData = {
          service_id: service.id,
          order_type: 'one_time',
          quantity: quantity,
          delivery_address: formData.delivery_address,
          delivery_date: deliveryType === 'immediate' 
            ? new Date().toISOString().split('T')[0]
            : formData.delivery_date,
          delivery_time_slot: formData.delivery_time_slot === 'custom'
            ? formData.custom_time
            : formData.delivery_time_slot,
          notes: `Delivery Type: ${deliveryType}. ${formData.notes}`,
        };

        await api.post('/orders/', orderData);
        toast.success(
          deliveryType === 'immediate'
            ? 'Order placed! We\'ll deliver within 1-2 hours.'
            : 'Order scheduled successfully!'
        );
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error creating order:', error);
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to create order. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = orderType === 'subscription'
    ? parseFloat(service.subscription_price || service.base_price)
    : parseFloat(service.base_price) * quantity;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Summary */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-100">
        <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Service:</span>
            <span className="font-medium text-gray-900">{service.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Type:</span>
            <span className="font-medium text-gray-900 capitalize">
              {orderType === 'one_time' ? 'One-time Purchase' : 'Monthly Subscription'}
            </span>
          </div>
          {orderType === 'one_time' && (
            <div className="flex justify-between">
              <span className="text-gray-600">Quantity:</span>
              <span className="font-medium text-gray-900">
                {quantity} {service.unit}(s)
              </span>
            </div>
          )}
          {orderType === 'subscription' && (
            <div className="flex justify-between">
              <span className="text-gray-600">Units:</span>
              <span className="font-medium text-gray-900">30 per month</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-indigo-200">
            <span className="font-semibold text-gray-900">Total:</span>
            <span className="font-bold text-indigo-600 text-lg">
              ₹{totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* One-time Order: Delivery Type Selection */}
      {orderType === 'one_time' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Delivery Type *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDeliveryType('immediate')}
              className={`p-4 border-2 rounded-lg transition-all text-left ${
                deliveryType === 'immediate'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Zap
                  className={deliveryType === 'immediate' ? 'text-indigo-600' : 'text-gray-600'}
                  size={20}
                />
                <span className="font-semibold text-gray-900">Deliver Now</span>
              </div>
              <p className="text-xs text-gray-600">Within 1-2 hours</p>
            </button>

            <button
              type="button"
              onClick={() => setDeliveryType('scheduled')}
              className={`p-4 border-2 rounded-lg transition-all text-left ${
                deliveryType === 'scheduled'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Calendar
                  className={deliveryType === 'scheduled' ? 'text-indigo-600' : 'text-gray-600'}
                  size={20}
                />
                <span className="font-semibold text-gray-900">Schedule</span>
              </div>
              <p className="text-xs text-gray-600">Choose date & time</p>
            </button>
          </div>
        </div>
      )}

      {/* Subscription: Usage Type Selection */}
      {orderType === 'subscription' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How do you want to use your subscription? *
          </label>
          <div className="grid grid-cols-1 gap-3">
            <button
              type="button"
              onClick={() => setUsageType('auto_delivery')}
              className={`p-4 border-2 rounded-lg transition-all text-left ${
                usageType === 'auto_delivery'
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-start space-x-3">
                <MapPin
                  className={usageType === 'auto_delivery' ? 'text-green-600' : 'text-gray-600'}
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
              onClick={() => setUsageType('pickup')}
              className={`p-4 border-2 rounded-lg transition-all text-left ${
                usageType === 'pickup'
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-start space-x-3">
                <Package
                  className={usageType === 'pickup' ? 'text-green-600' : 'text-gray-600'}
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
      )}

      {/* Delivery Address - Show for one-time or auto-delivery subscription */}
      {(orderType === 'one_time' || (orderType === 'subscription' && usageType === 'auto_delivery')) && (
        <Input
          label="Delivery Address *"
          name="delivery_address"
          value={formData.delivery_address}
          onChange={handleInputChange}
          placeholder="Enter your complete delivery address"
          error={errors.delivery_address}
          icon={<MapPin size={18} />}
        />
      )}

      {/* Delivery Date - Show for scheduled orders or subscriptions */}
      {((orderType === 'one_time' && deliveryType === 'scheduled') ||
        (orderType === 'subscription' && usageType === 'auto_delivery')) && (
        <Input
          label={orderType === 'subscription' ? 'Start Date *' : 'Delivery Date *'}
          name="delivery_date"
          type="date"
          value={formData.delivery_date}
          onChange={handleInputChange}
          min={minDate}
          error={errors.delivery_date}
          icon={<Calendar size={18} />}
          helperText={
            orderType === 'subscription'
              ? 'Daily delivery will start from this date'
              : undefined
          }
        />
      )}

      {/* Time Slot - Show for orders with delivery */}
      {((orderType === 'one_time') ||
        (orderType === 'subscription' && usageType === 'auto_delivery')) && (
        <>
          <Select
            label="Preferred Time Slot *"
            name="delivery_time_slot"
            value={formData.delivery_time_slot}
            onChange={handleInputChange}
            options={timeSlots}
          />

          {formData.delivery_time_slot === 'custom' && (
            <Input
              label="Custom Time *"
              name="custom_time"
              type="time"
              value={formData.custom_time}
              onChange={handleInputChange}
              error={errors.custom_time}
              icon={<Clock size={18} />}
              helperText="Specify your preferred delivery time"
            />
          )}
        </>
      )}

      {/* Pickup Instructions for self-pickup subscriptions */}
      {orderType === 'subscription' && usageType === 'pickup' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
            <Package className="mr-2" size={18} />
            Pickup Instructions
          </h4>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Visit shop anytime during business hours</li>
            <li>Show your digital subscription card</li>
            <li>Provider will mark one unit as used</li>
            <li>Track remaining units in "My Subscriptions"</li>
          </ul>
        </div>
      )}

      {/* Notes */}
      <Textarea
        label="Special Instructions (Optional)"
        name="notes"
        value={formData.notes}
        onChange={handleInputChange}
        placeholder="Any special instructions..."
        rows={3}
      />

      {/* Action Buttons */}
      <div className="flex items-center space-x-4 pt-4">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="flex-1"
        >
          {orderType === 'subscription' ? 'Subscribe Now' : 
           deliveryType === 'immediate' ? 'Order Now' : 'Schedule Order'}
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
        {orderType === 'subscription' && usageType === 'pickup'
          ? 'Your subscription will be active immediately. Visit shop to use your units.'
          : orderType === 'subscription'
          ? 'Daily delivery will start from the selected date and time.'
          : deliveryType === 'immediate'
          ? 'Our delivery partner will reach you within 1-2 hours.'
          : 'You will receive confirmation before scheduled delivery.'}
      </p>
    </form>
  );
}