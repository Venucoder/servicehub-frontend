'use client';

import { useState } from 'react';
import { MapPin, Calendar, Clock, Zap } from 'lucide-react';
import Input from '@/components/forms/Input';
import Textarea from '@/components/forms/Textarea';
import Button from '@/components/common/Button';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface OrderFormProps {
  service: {
    id: string;
    name: string;
    base_price: string;
    unit: string;
    supports_immediate_delivery: boolean;
  };
  quantity: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function OrderForm({
  service,
  quantity,
  onSuccess,
  onCancel,
}: OrderFormProps) {
  const [deliveryType, setDeliveryType] = useState<'immediate' | 'scheduled'>(
    service.supports_immediate_delivery ? 'immediate' : 'scheduled'
  );
  
  const [formData, setFormData] = useState({
    delivery_address: '',
    scheduled_date: '',
    scheduled_time: '',
    notes: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.delivery_address.trim()) {
      newErrors.delivery_address = 'Delivery address is required';
    }

    if (deliveryType === 'scheduled') {
      if (!formData.scheduled_date) {
        newErrors.scheduled_date = 'Delivery date is required';
      } else {
        const selectedDate = new Date(formData.scheduled_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
          newErrors.scheduled_date = 'Delivery date cannot be in the past';
        }
      }

      if (!formData.scheduled_time) {
        newErrors.scheduled_time = 'Delivery time is required';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData: any = {
        service_id: service.id,
        order_type: 'one_time',
        quantity: quantity,
        delivery_type: deliveryType,
        delivery_address: formData.delivery_address,
        notes: formData.notes,
      };

      if (deliveryType === 'scheduled') {
        orderData.scheduled_date = formData.scheduled_date;
        orderData.scheduled_time = formData.scheduled_time;
      }

      await api.post('/orders/', orderData);
      
      toast.success(
        deliveryType === 'immediate'
          ? 'Order placed! We\'ll deliver within 1-2 hours.'
          : 'Order scheduled successfully!'
      );
      
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

  const totalAmount = parseFloat(service.base_price) * quantity;

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
            <span className="text-gray-600">Quantity:</span>
            <span className="font-medium text-gray-900">
              {quantity} {service.unit}(s)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Price per unit:</span>
            <span className="font-medium text-gray-900">₹{service.base_price}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-indigo-200">
            <span className="font-semibold text-gray-900">Total:</span>
            <span className="font-bold text-indigo-600 text-lg">
              ₹{totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Delivery Type Selection */}
      {service.supports_immediate_delivery && (
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

      {/* Delivery Address */}
      <Input
        label="Delivery Address *"
        name="delivery_address"
        value={formData.delivery_address}
        onChange={handleInputChange}
        placeholder="Enter your complete delivery address"
        error={errors.delivery_address}
        icon={<MapPin size={18} />}
      />

      {/* Scheduled Delivery Date & Time */}
      {deliveryType === 'scheduled' && (
        <>
          <Input
            label="Delivery Date *"
            name="scheduled_date"
            type="date"
            value={formData.scheduled_date}
            onChange={handleInputChange}
            min={minDate}
            error={errors.scheduled_date}
            icon={<Calendar size={18} />}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Time *
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="time"
                name="scheduled_time"
                value={formData.scheduled_time}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900 ${
                  errors.scheduled_time ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.scheduled_time && (
              <p className="mt-1 text-sm text-red-600">{errors.scheduled_time}</p>
            )}
          </div>
        </>
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
          {deliveryType === 'immediate' ? 'Order Now' : 'Schedule Order'}
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
        {deliveryType === 'immediate'
          ? 'Our delivery partner will reach you within 1-2 hours.'
          : 'You will receive confirmation before scheduled delivery.'}
      </p>
    </form>
  );
}