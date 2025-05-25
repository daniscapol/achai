import React, { useState } from 'react';
import { X, CheckCircle, CreditCard, BookOpen, Clock, Award } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../hooks/use-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const EnrollmentModal = ({ course, isOpen, onClose, onSuccess }) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState({
    email: '',
    agreeToTerms: false
  });

  const handleEnroll = async () => {
    const user = localStorage.getItem('user');
    
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to enroll in this course',
        variant: 'default'
      });
      window.location.href = '/login';
      return;
    }

    if (course.price > 0) {
      // For paid courses, we would integrate with a payment provider
      toast({
        title: 'Payment Required',
        description: 'Payment integration coming soon. For now, all courses are available for free enrollment.',
        variant: 'default'
      });
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${course.id}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          course_id: course.id
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Enrollment Successful!',
          description: `You have been enrolled in ${course.title}`,
          variant: 'default'
        });
        if (onSuccess) onSuccess();
        onClose();
      } else {
        throw new Error(data.message || 'Failed to enroll');
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast({
        title: 'Enrollment Failed',
        description: error.message || 'Failed to enroll in course. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return numPrice === 0 ? 'Free' : `$${numPrice.toFixed(2)}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-zinc-900 rounded-lg shadow-xl max-w-md w-full"
        >
          {/* Header */}
          <div className="p-6 border-b border-zinc-800">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Enroll in Course</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Course Info */}
            <div className="bg-zinc-800 rounded-lg p-4 mb-6">
              {course.thumbnail_url && (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
              )}
              <h3 className="font-semibold text-white mb-2">{course.title}</h3>
              <p className="text-sm text-gray-400 mb-3">{course.instructor_name}</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-purple-400">
                  {formatPrice(course.price)}
                </span>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {course.duration_hours ? `${course.duration_hours}h` : 'Self-paced'}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {course.lesson_count || 20} lessons
                  </span>
                </div>
              </div>
            </div>

            {/* What's Included */}
            <div className="mb-6">
              <h4 className="font-semibold text-white mb-3">What's Included:</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Full lifetime access to all course materials
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Certificate of completion upon finishing
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Access on mobile and desktop devices
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  30-day money-back guarantee
                </li>
              </ul>
            </div>

            {/* Terms */}
            <div className="mb-6">
              <label className="flex items-start gap-3 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enrollmentData.agreeToTerms}
                  onChange={(e) => setEnrollmentData({
                    ...enrollmentData,
                    agreeToTerms: e.target.checked
                  })}
                  className="mt-1 rounded border-zinc-700 bg-zinc-800 text-purple-600 focus:ring-purple-500"
                />
                <span>
                  I agree to the terms and conditions and understand that this enrollment is
                  {course.price > 0 ? ' subject to payment processing' : ' free and can be accessed immediately'}.
                </span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-zinc-800">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 border-zinc-700 hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEnroll}
                disabled={isProcessing || !enrollmentData.agreeToTerms}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {isProcessing ? (
                  'Processing...'
                ) : course.price > 0 ? (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Proceed to Payment
                  </>
                ) : (
                  'Enroll Now'
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EnrollmentModal;