'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  requirements: {
    id: string;
    label: string;
    completed: boolean;
  }[];
}

const CreateCampaignForm = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goalAmount: '',
    category: '',
    medicalDocuments: [] as File[],
    hospitalVerification: null as File | null,
    patientId: '',
    treatmentPlan: null as File | null,
    estimatedDuration: '',
    urgency: 'normal',
  });

  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([
    {
      id: 'identity',
      title: 'Identity Verification',
      description: 'Verify patient identity and medical condition',
      status: 'pending',
      requirements: [
        { id: 'id_proof', label: 'Government-issued ID', completed: false },
        { id: 'medical_records', label: 'Medical records', completed: false },
        { id: 'patient_photo', label: 'Recent patient photo', completed: false },
      ],
    },
    {
      id: 'medical',
      title: 'Medical Verification',
      description: 'Verify treatment plan and hospital details',
      status: 'pending',
      requirements: [
        { id: 'treatment_plan', label: 'Detailed treatment plan', completed: false },
        { id: 'hospital_letter', label: 'Hospital verification letter', completed: false },
        { id: 'doctor_letter', label: 'Doctor\'s recommendation', completed: false },
      ],
    },
    {
      id: 'financial',
      title: 'Financial Verification',
      description: 'Verify cost estimates and funding requirements',
      status: 'pending',
      requirements: [
        { id: 'cost_breakdown', label: 'Detailed cost breakdown', completed: false },
        { id: 'insurance_info', label: 'Insurance information', completed: false },
        { id: 'payment_plan', label: 'Payment schedule', completed: false },
      ],
    },
    {
      id: 'review',
      title: 'Review Process',
      description: 'MedFund team review and approval',
      status: 'pending',
      requirements: [
        { id: 'team_review', label: 'Team review completed', completed: false },
        { id: 'document_verification', label: 'Document verification', completed: false },
        { id: 'final_approval', label: 'Final approval', completed: false },
      ],
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.title && formData.description && formData.goalAmount;
      case 2:
        return formData.category && formData.estimatedDuration && formData.urgency;
      case 3:
        return verificationSteps.every(step => step.status === 'completed');
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      setError('Please complete all required fields before proceeding');
      return;
    }
    setError(null);
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setError(null);
    setCurrentStep(currentStep - 1);
  };

  const handleFileUpload = (stepId: string, requirementId: string, file: File) => {
    setVerificationSteps(prevSteps =>
      prevSteps.map(step => {
        if (step.id === stepId) {
          const updatedRequirements = step.requirements.map(req => {
            if (req.id === requirementId) {
              return { ...req, completed: true };
            }
            return req;
          });

          const isStepCompleted = updatedRequirements.every(req => req.completed);

          return {
            ...step,
            requirements: updatedRequirements,
            status: isStepCompleted ? 'completed' : 'in-progress',
          };
        }
        return step;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(3)) {
      setError('Please complete all verification steps before submitting');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // TODO: Implement actual form submission logic with backend API
      // For now, we'll simulate a submission delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success message and redirect
      alert('Campaign submitted successfully! It will be reviewed by our team.');
      router.push('/campaigns');
    } catch (err) {
      setError('Failed to submit campaign. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderVerificationSteps = () => (
    <div className="space-y-8">
      {verificationSteps.map((step, index) => (
        <div
          key={step.id}
          className={`bg-white rounded-lg shadow p-6 ${
            step.status === 'completed' ? 'border-l-4 border-green-500' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{step.title}</h3>
              <p className="text-sm text-gray-500">{step.description}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                step.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : step.status === 'in-progress'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {step.status === 'completed'
                ? 'Completed'
                : step.status === 'in-progress'
                ? 'In Progress'
                : 'Pending'}
            </span>
          </div>
          <div className="space-y-4">
            {step.requirements.map(requirement => (
              <div key={requirement.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={requirement.completed}
                  disabled
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label className="ml-3 text-sm text-gray-700">
                  {requirement.label}
                </label>
                {!requirement.completed && (
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(step.id, requirement.id, file);
                      }
                    }}
                    className="ml-4 text-sm text-gray-500"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderFormStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Campaign Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Goal Amount (ADA)
              </label>
              <input
                type="number"
                value={formData.goalAmount}
                onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select a category</option>
                <option value="surgery">Surgery</option>
                <option value="treatment">Treatment</option>
                <option value="medication">Medication</option>
                <option value="rehabilitation">Rehabilitation</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Estimated Duration (days)
              </label>
              <input
                type="number"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Urgency Level
              </label>
              <select
                value={formData.urgency}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
        );
      case 3:
        return renderVerificationSteps();
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Campaign</h2>
        <p className="text-gray-600">
          Follow these steps to create and verify your healthcare campaign
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= step
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`h-1 w-16 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-sm text-gray-600">Basic Info</span>
          <span className="text-sm text-gray-600">Details</span>
          <span className="text-sm text-gray-600">Verification</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {renderFormStep()}

        <div className="flex justify-between">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrevious}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Previous
            </button>
          )}
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="ml-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className={`ml-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Campaign'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateCampaignForm; 