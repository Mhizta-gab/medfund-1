'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useIPFS } from '@/hooks/useIPFS';
import { CampaignMetadata } from '@/utils/ipfs/schemas/CampaignMetadata';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, X, Camera, Upload, FileText, Clock, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';

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

interface FormField {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required: boolean;
  options?: { value: string; label: string }[];
  info?: string;
  min?: number;
  max?: number;
}

// New FileInputProps interface
interface FileInputProps {
  id: string;
  label: string;
  onFileSelect: (file: File, fileId: string) => void;
  fileTypeDescription: string; // e.g., "Campaign Image", "Medical Document"
  accept?: string; // e.g., "image/*", ".pdf,.doc,.docx"
  currentFile?: File | null;
  previewUrl?: string | null;
  cid?: string | null;
  uploading?: boolean;
  error?: string | null;
  onRemove?: (fileId: string) => void;
}

// New FileInput component
const FileInput: React.FC<FileInputProps> = ({
  id,
  label,
  onFileSelect,
  fileTypeDescription,
  accept,
  currentFile,
  previewUrl,
  cid,
  uploading,
  error,
  onRemove
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onFileSelect(event.target.files[0], id);
    }
  };

  return (
    <div className="mb-6">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <div className={`mt-1 flex flex-col items-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md transition-all duration-150 ease-in-out hover:border-emerald-500 dark:hover:border-emerald-400 ${error ? 'border-red-500' : ''}`}>
        <div className="space-y-1 text-center w-full">
          {previewUrl && accept?.startsWith('image/') && (
            <div className="mb-4 w-full aspect-video overflow-hidden rounded-md border border-gray-200 dark:border-gray-700 flex justify-center items-center bg-gray-50 dark:bg-gray-750">
              <img src={previewUrl} alt={`${fileTypeDescription} preview`} className="max-h-48 w-auto object-contain" />
            </div>
          )}
          {!cid && !currentFile && !previewUrl && (
            <>
              {accept?.startsWith('image/') ? <ImageIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" /> : <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />}
              <div className="flex text-sm text-gray-600 dark:text-gray-400">
                <label
                  htmlFor={id}
                  className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500"
                >
                  <span>Upload a {fileTypeDescription.toLowerCase()}</span>
                  <input id={id} name={id} type="file" className="sr-only" onChange={handleFileChange} accept={accept} disabled={uploading || !!cid} />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 5MB. PDFs, DOCs for documents.</p>
            </>
          )}
          {(currentFile || cid) && (
            <div className="text-sm text-gray-700 dark:text-gray-200 w-full py-2 px-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-750 flex justify-between items-center">
              <span className="truncate max-w-[calc(100%-3rem)]">
                {currentFile?.name || (cid ? `Uploaded: ${cid.substring(0, 10)}...${cid.substring(cid.length - 4)}` : 'File selected')}
              </span>
              {onRemove && (currentFile || cid) && !uploading && (
                <button 
                  type="button" 
                  onClick={() => onRemove(id)} 
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ml-2 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                  aria-label={`Remove ${fileTypeDescription}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
          {uploading && (
            <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-emerald-500" />
              Uploading...
            </div>
          )}
          {cid && !uploading && (
            <div className="flex items-center justify-center text-sm text-emerald-600 dark:text-emerald-400 mt-2">
              <CheckCircle className="mr-2 h-4 w-4" />
              Upload complete!
            </div>
          )}
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

const CreateCampaignForm = () => {
  const router = useRouter();
  const ipfsService = useIPFS();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goalAmount: '',
    category: '',
    campaignImageFile: null as File | null,
    coverImageFile: null as File | null,
    medicalDocuments: [] as File[],
    hospitalVerificationFile: null as File | null,
    treatmentPlanFile: null as File | null,
    campaignImageCID: '',
    coverImageCID: '',
    medicalDocumentCIDs: [] as string[],
    hospitalVerificationCID: '',
    treatmentPlanCID: '',
    patientId: '',
    estimatedDuration: '',
    urgency: 'normal',
    patientName: '',
    hospitalName: '',
    location: '',
    contactEmail: ''
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFileId, setUploadingFileId] = useState<string | null>(null);
  const [fileUploadErrors, setFileUploadErrors] = useState<Record<string, string | null>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [campaignImagePreview, setCampaignImagePreview] = useState<string | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);

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
    }
  ]);

  // Form field definitions for each step
  const formFields: Record<number, FormField[]> = {
    1: [
      { name: 'title', label: 'Campaign Title', type: 'text', placeholder: 'E.g., Help John with Cancer Treatment', required: true },
      { name: 'patientName', label: 'Patient Name', type: 'text', placeholder: 'Full name of the patient', required: true },
      { name: 'description', label: 'Campaign Story', type: 'textarea', placeholder: 'Share details about the medical condition and why support is needed...', required: true },
      { name: 'goalAmount', label: 'Fundraising Goal (ADA)', type: 'number', placeholder: '5000', required: true, min: 100 },
      { name: 'contactEmail', label: 'Contact Email', type: 'email', placeholder: 'email@example.com', required: true },
    ],
    2: [
      { 
        name: 'category', 
        label: 'Medical Category', 
        type: 'select', 
        required: true,
        options: [
          { value: '', label: 'Select a category' },
          { value: 'surgery', label: 'Surgery' },
          { value: 'treatment', label: 'Treatment' },
          { value: 'medication', label: 'Medication' },
          { value: 'rehabilitation', label: 'Rehabilitation' },
          { value: 'emergency', label: 'Emergency Care' },
          { value: 'other', label: 'Other' }
        ]
      },
      { name: 'hospitalName', label: 'Hospital/Medical Facility', type: 'text', placeholder: 'Name of the medical facility', required: true },
      { name: 'location', label: 'Location', type: 'text', placeholder: 'City, Country', required: true },
      { 
        name: 'estimatedDuration', 
        label: 'Estimated Treatment Duration (days)', 
        type: 'number', 
        placeholder: '30', 
        required: true,
        min: 1
      },
      { 
        name: 'urgency', 
        label: 'Urgency Level', 
        type: 'select', 
        required: true,
        options: [
          { value: 'normal', label: 'Normal' },
          { value: 'urgent', label: 'Urgent' },
          { value: 'critical', label: 'Critical' }
        ],
        info: 'Critical urgency will be prioritized for verification'
      },
    ]
  };

  const validateField = (name: string, value: string): string => {
    const field = [...formFields[1], ...formFields[2]].find(f => f.name === name);
    if (!field) return '';
    
    if (field.required && !value.trim()) {
      return `${field.label} is required`;
    }
    
    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
    }
    
    if (field.type === 'number' && value) {
      const num = Number(value);
      if (isNaN(num)) {
        return 'Please enter a valid number';
      }
      if (field.min !== undefined && num < field.min) {
        return `Value must be at least ${field.min}`;
      }
      if (field.max !== undefined && num > field.max) {
        return `Value must be at most ${field.max}`;
      }
    }
    
    return '';
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateStep = (step: number): boolean => {
    const fields = formFields[step] || [];
    let isValid = true;
    const errors: Record<string, string> = {};
    
    // Mark all fields as touched
    const newTouched: Record<string, boolean> = { ...touched };
    
    fields.forEach(field => {
      newTouched[field.name] = true;
      const value = formData[field.name as keyof typeof formData] as string;
      const error = validateField(field.name, value);
      
      if (error) {
        errors[field.name] = error;
        isValid = false;
      }
    });
    
    setTouched(newTouched);
    setFormErrors(errors);
    
    if (step === 3) {
      // For step 3, check if all required documents are uploaded
      // Adjust this validation based on the new FileInput component and how CIDs are handled
      const requiredUploads = [
        { field: 'campaignImageFile', cidField: 'campaignImageCID' }, 
        // { field: 'coverImageFile', cidField: 'coverImageCID' }, // Optional? 
        // { field: 'medicalDocuments', cidField: 'medicalDocumentCIDs' }, // Optional?
      ];
      for (const req of requiredUploads) {
        if (!formData[req.field as keyof typeof formData] && !formData[req.cidField as keyof typeof formData]) {
          setFileUploadErrors(prev => ({
            ...prev,
            [req.field]: 'This file is required'
          }));
          // isValid = false; // Decide if this should block submission or just show error
        }
      }
    }
    
    return isValid;
  };

  const handleRemoveFile = (fileIdToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      [fileIdToRemove]: null, // Clear the file object
      [`${fileIdToRemove.replace('File', '')}CID`]: '', // Clear the corresponding CID
    }));

    if (fileIdToRemove === 'campaignImageFile') {
      setCampaignImagePreview(null);
    }
    if (fileIdToRemove === 'coverImageFile') {
      setCoverImagePreview(null);
    }
    // For medicalDocuments (array of files), a more specific removal logic might be needed if allowing removal of individual docs
    // For now, this generic removal clears single file inputs.
    setFileUploadErrors(prev => ({ ...prev, [fileIdToRemove]: null }));
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      setSubmitError('Please correct the errors before proceeding');
      return;
    }
    setSubmitError(null);
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setSubmitError(null);
    setCurrentStep(currentStep - 1);
  };

  const handleGenericFileUpload = async (file: File, fileId: string, cidField: keyof typeof formData | 'medicalDocuments') => {
    if (!ipfsService) {
      setFileUploadErrors(prev => ({ ...prev, [fileId]: 'IPFS service not available.' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setFileUploadErrors(prev => ({ ...prev, [fileId]: 'File size exceeds 5MB limit.' }));
      return;
    }

    setUploadingFileId(fileId);
    setIsUploading(true);
    setFileUploadErrors(prev => ({ ...prev, [fileId]: null }));

    // Generate preview for images
    if (fileId === 'campaignImageFile' && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCampaignImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (fileId === 'coverImageFile' && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    try {
      // Update form data with the file object for now
      if (cidField === 'medicalDocuments') {
        setFormData(prev => ({
          ...prev,
          medicalDocuments: [...prev.medicalDocuments, file]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [fileId]: file,
        }));
      }
      
      // Upload to IPFS (this can be done on submit, or kept here if immediate upload is desired)
      // For now, let's assume we upload on submit to avoid unnecessary uploads if the user changes their mind.
      // The CIDs will be set after successful upload in the handleSubmit function.

      // If you want to upload immediately, uncomment the following:
      /*
      const cid = await ipfsService.uploadFile(file, { fileName: file.name, type: file.type });
      if (cidField === 'medicalDocuments') {
        setFormData(prev => ({
          ...prev,
          medicalDocumentCIDs: [...prev.medicalDocumentCIDs, cid]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [cidField as keyof typeof formData]: cid,
        }));
      }
      */

    } catch (error) {
      console.error(`Error uploading ${fileId}:`, error);
      setFileUploadErrors(prev => ({ ...prev, [fileId]: `Upload failed: ${error instanceof Error ? error.message : String(error)}` }));
    } finally {
      setIsUploading(false);
      setUploadingFileId(null);
    }
  };

  const handleVerificationFileUpload = (stepId: string, requirementId: string, file: File) => {
    const fileIdentifier = `${stepId}_${requirementId}`;
    let targetCidField: keyof typeof formData | 'medicalDocuments' = 'medicalDocuments';

    if (requirementId === 'treatment_plan') targetCidField = 'treatmentPlanCID';
    if (requirementId === 'hospital_letter') targetCidField = 'hospitalVerificationCID';

    handleGenericFileUpload(file, fileIdentifier, targetCidField);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      setSubmitError('Please complete all required fields and uploads in all steps.');
      return;
    }

    if (!ipfsService) {
      setSubmitError('IPFS Service not available. Cannot submit campaign.');
      return;
    }

    setIsSubmitting(true);

    try {
      let { 
        campaignImageFile, coverImageFile, medicalDocuments, 
        hospitalVerificationFile, treatmentPlanFile, ...metadataFields 
      } = formData;

      let campaignImageCID = formData.campaignImageCID;
      let coverImageCID = formData.coverImageCID;
      let medicalDocumentCIDs = formData.medicalDocumentCIDs.slice(); // Create a copy
      let hospitalVerificationCID = formData.hospitalVerificationCID;
      let treatmentPlanCID = formData.treatmentPlanCID;

      // Upload Campaign Image if a new file is provided
      if (campaignImageFile && !campaignImageCID) { // Only upload if no CID exists yet or file changed
        campaignImageCID = await ipfsService.uploadFile(campaignImageFile, { type: 'campaignImage' });
      }

      // Upload Cover Image if a new file is provided
      if (coverImageFile && !coverImageCID) {
        coverImageCID = await ipfsService.uploadFile(coverImageFile, { type: 'coverImage' });
      }

      // Upload Medical Documents if new files are provided
      const newMedicalDocumentsToUpload = medicalDocuments.filter(file => file instanceof File);
      if (newMedicalDocumentsToUpload.length > 0) {
        const uploadedMedicalCIDs = await Promise.all(
          newMedicalDocumentsToUpload.map(file => 
            ipfsService.uploadFile(file, { type: 'medicalDocument', name: file.name })
          )
        );
        // Assuming medicalDocumentCIDs in formData was for already uploaded files, or we replace it entirely
        // For simplicity, let's assume we are adding new ones or replacing if that's the logic.
        // This part might need adjustment based on how CIDs for already uploaded files are handled.
        medicalDocumentCIDs = [...medicalDocumentCIDs, ...uploadedMedicalCIDs];
      }
      
      // Upload Hospital Verification File if a new file is provided
      if (hospitalVerificationFile && !hospitalVerificationCID) {
        hospitalVerificationCID = await ipfsService.uploadFile(hospitalVerificationFile, { type: 'hospitalVerification' });
      }

      // Upload Treatment Plan File if a new file is provided
      if (treatmentPlanFile && !treatmentPlanCID) {
        treatmentPlanCID = await ipfsService.uploadFile(treatmentPlanFile, { type: 'treatmentPlan' });
      }

      const campaignMetadata: CampaignMetadata = {
        title: metadataFields.title,
        goalAmount: parseFloat(metadataFields.goalAmount) || 0,
        category: metadataFields.category,
        beneficiaryName: metadataFields.patientName,
        contactEmail: metadataFields.contactEmail,
        version: '1.0',
        story: metadataFields.description,
        currency: 'ADA',
        beneficiaryId: metadataFields.patientId || `PAT-${Date.now()}`,
        campaignImageCID,
        coverImageCID,
        hospitalInfo: {
          name: metadataFields.hospitalName,
          address: metadataFields.location,
          verificationCID: hospitalVerificationCID,
        },
        medicalCondition: {
          summary: 'Patient requires medical attention.',
          treatmentPlanSummary: 'Detailed treatment plan to be outlined.'
        },
        documentsCIDs: {
          medicalRecords: medicalDocumentCIDs,
          treatmentPlanFull: treatmentPlanCID,
        },
        created: Date.now(),
        updated: Date.now(),
        status: 'pending_verification',
        organizerId: 'temp-organizer-id',
        tags: metadataFields.category ? [metadataFields.category] : [],
      };

      const campaignCID = await ipfsService.uploadCampaignMetadata(campaignMetadata);
      console.log('Campaign created with CID:', campaignCID);
      // TODO: Here you would typically interact with your smart contract
      // For example: await createCampaignOnChain(campaignCID, campaignMetadata.goalAmount);

      setSubmitSuccess(true);
      setTimeout(() => {
        router.push(`/campaigns?newCampaign=${campaignCID}`); // Redirect or show success message
      }, 2000);

    } catch (error: any) { // Catch any type of error
      console.error('Error submitting campaign:', error);
      setSubmitError(`Submission failed: ${error.message || 'Unknown error'}. Please check console for details.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderVerificationSteps = () => (
    <div className="space-y-6">
      {verificationSteps.map((step) => (
        <Card key={step.id} className={`border-l-4 ${
          step.status === 'completed' ? 'border-l-green-500' : 
          step.status === 'in-progress' ? 'border-l-blue-500' : 
          'border-l-gray-200'
        }`}>
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg font-semibold">{step.title}</CardTitle>
                <CardDescription>{step.description}</CardDescription>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                step.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : step.status === 'in-progress'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {step.status === 'completed'
                  ? 'Completed'
                  : step.status === 'in-progress'
                  ? 'In Progress'
                  : 'Pending'}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {step.requirements.map(requirement => (
                <div key={requirement.id} className="flex items-center">
                  <div className={`flex-shrink-0 w-5 h-5 mr-3 ${
                    requirement.completed ? 'text-green-500' : 'text-gray-300'
                  }`}>
                    <CheckCircle size={20} />
                  </div>
                  
                  <div className="flex-grow">
                    <p className="text-sm font-medium text-gray-700">
                      {requirement.label}
                    </p>
                  </div>
                  
                  {!requirement.completed && (
                    <div className="ml-4">
                      <div className="relative">
                        <input
                          type="file"
                          id={`${step.id}_${requirement.id}`}
                          name={`${step.id}_${requirement.id}`}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleVerificationFileUpload(step.id, requirement.id, file);
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          disabled={(isUploading && uploadingFileId === `${step.id}_${requirement.id}`) || isSubmitting}
                        />
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="pointer-events-none"
                          disabled={(isUploading && uploadingFileId === `${step.id}_${requirement.id}`) || isSubmitting}
                        >
                          {uploadingFileId === `${step.id}_${requirement.id}` ? (
                            <>Uploading<span className="loading ml-1">...</span></>
                          ) : (
                            <>
                              <Upload size={14} /> Upload File
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {fileUploadErrors[`${step.id}_${requirement.id}`] && (
                        <p className="mt-1 text-xs text-red-600">
                          {fileUploadErrors[`${step.id}_${requirement.id}`]}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderFormFields = (fields: FormField[]) => {
    return (
      <div className="space-y-6">
        {fields.map((field) => (
          <div key={field.name} className="form-group">
            <label htmlFor={field.name} className="block text-sm font-medium mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>

            {field.info && (
              <p className="text-xs text-gray-500 mb-1">{field.info}</p>
            )}
            
            {field.type === 'textarea' ? (
              <textarea
                id={field.name}
                name={field.name}
                value={formData[field.name as keyof typeof formData] as string}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  touched[field.name] && formErrors[field.name] 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                required={field.required}
              />
            ) : field.type === 'select' ? (
              <select
                id={field.name}
                name={field.name}
                value={formData[field.name as keyof typeof formData] as string}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  touched[field.name] && formErrors[field.name] 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300'
                }`}
                disabled={isSubmitting}
                required={field.required}
              >
                {field.options?.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                value={formData[field.name as keyof typeof formData] as string}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  touched[field.name] && formErrors[field.name] 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300'
                }`}
                min={field.min}
                max={field.max}
                disabled={isSubmitting}
                required={field.required}
              />
            )}
            
            {touched[field.name] && formErrors[field.name] && (
              <p className="mt-1 text-sm text-red-600">
                {formErrors[field.name]}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderFormStep = () => {
    switch (currentStep) {
      case 1:
        return renderFormFields(formFields[1]);
      case 2:
        return renderFormFields(formFields[2]);
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Step 3: Upload Documents & Media</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Please provide clear images and necessary documents. This helps build trust and speeds up verification.
            </p>
            
            <FileInput
              id="campaignImageFile"
              label="Campaign Image (Primary)"
              onFileSelect={(file, id) => handleGenericFileUpload(file, id, 'campaignImageCID')}
              fileTypeDescription="Campaign Image"
              accept="image/*"
              currentFile={formData.campaignImageFile}
              previewUrl={campaignImagePreview}
              cid={formData.campaignImageCID}
              uploading={uploadingFileId === "campaignImageFile"}
              error={fileUploadErrors.campaignImageFile}
              onRemove={handleRemoveFile}
            />

            <FileInput
              id="coverImageFile"
              label="Cover Image (Optional)"
              onFileSelect={(file, id) => handleGenericFileUpload(file, id, 'coverImageCID')}
              fileTypeDescription="Cover Image"
              accept="image/*"
              currentFile={formData.coverImageFile}
              previewUrl={coverImagePreview}
              cid={formData.coverImageCID}
              uploading={uploadingFileId === "coverImageFile"}
              error={fileUploadErrors.coverImageFile}
              onRemove={handleRemoveFile}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Medical Documents (e.g., Doctor's notes, Diagnosis reports)
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Upload relevant medical documents. You can add multiple files.</p>
              <input
                id="medicalDocuments"
                type="file"
                multiple
                className="block w-full text-sm text-gray-500 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 dark:file:bg-emerald-800/50 file:text-emerald-700 dark:file:text-emerald-300 hover:file:bg-emerald-100 dark:hover:file:bg-emerald-700/60 mb-2"
                onChange={(e) => {
                  if (e.target.files) {
                    Array.from(e.target.files).forEach(file => 
                      handleGenericFileUpload(file, `medicalDocument_${file.name}`, 'medicalDocuments')
                    );
                  }
                }}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                disabled={isUploading} 
              />
              {formData.medicalDocuments.length > 0 && (
                <div className="mt-2 space-y-2">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-200">Selected medical documents:</p>
                  {formData.medicalDocuments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-750">
                      <div className="flex items-center space-x-2 truncate">
                        <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-200 truncate">{file.name}</span>
                        {/* TODO: Add progress for individual file uploads if CIDs are generated per file immediately */}
                        {/* {uploadingFileId === `medicalDocument_${file.name}` && <Loader2 className="w-4 h-4 animate-spin text-emerald-500 ml-2" />} */}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            medicalDocuments: prev.medicalDocuments.filter((_, i) => i !== index),
                            // Also remove corresponding CID if already uploaded
                            medicalDocumentCIDs: prev.medicalDocumentCIDs.filter((cid, i) => {
                              // This logic assumes CIDs are added in the same order and relies on index.
                              // A more robust approach would be to store an ID with each file and CID.
                              // For now, if a file is removed, we assume its CID is at the same index if it exists.
                              const fileWasUploaded = prev.medicalDocumentCIDs.length > index; // A simplification
                              return !fileWasUploaded || i !== index; 
                            })
                          }));
                        }}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                        aria-label={`Remove ${file.name}`}
                        disabled={isUploading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {fileUploadErrors.medicalDocuments && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{fileUploadErrors.medicalDocuments}</p>}
            </div>

            <FileInput
              id="hospitalVerificationFile"
              label="Hospital Verification Document (Optional)"
              onFileSelect={(file, id) => handleGenericFileUpload(file, id, 'hospitalVerificationCID')}
              fileTypeDescription="Hospital Verification"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              currentFile={formData.hospitalVerificationFile}
              cid={formData.hospitalVerificationCID}
              uploading={uploadingFileId === "hospitalVerificationFile"}
              error={fileUploadErrors.hospitalVerificationFile}
              onRemove={handleRemoveFile}
            />

            <FileInput
              id="treatmentPlanFile"
              label="Treatment Plan Document (Optional)"
              onFileSelect={(file, id) => handleGenericFileUpload(file, id, 'treatmentPlanCID')}
              fileTypeDescription="Treatment Plan"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              currentFile={formData.treatmentPlanFile}
              cid={formData.treatmentPlanCID}
              uploading={uploadingFileId === "treatmentPlanFile"}
              error={fileUploadErrors.treatmentPlanFile}
              onRemove={handleRemoveFile}
            />
            
            {/* Dynamic Verification Checklist - Can be expanded */}
            {renderVerificationSteps()}
          </div>
        );
      default:
        return null;
    }
  };

  if (submitSuccess) {
    return (
      <div className="max-w-md mx-auto p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign Submitted!</h2>
        <p className="text-gray-600 mb-6">
          Your campaign has been sent for verification. We'll review it and get back to you shortly.
        </p>
        <Button 
          onClick={() => router.push('/campaigns')}
          className="w-full"
        >
          View All Campaigns
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {[
            { step: 1, label: 'Basic Info' },
            { step: 2, label: 'Campaign Details' },
            { step: 3, label: 'Verification' }
          ].map(({ step, label }) => (
            <div key={step} className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep === step
                    ? 'bg-blue-600 text-white border-2 border-blue-200'
                    : currentStep > step
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                } transition-colors`}
              >
                {currentStep > step ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <span>{step}</span>
                )}
              </div>
              <span className={`text-xs mt-1 font-medium ${
                currentStep === step ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {label}
              </span>
            </div>
          ))}
        </div>
        <div className="relative">
          <div className="absolute top-0 h-1 bg-gray-200 w-full -mt-4 z-0"></div>
          <div 
            className="absolute top-0 h-1 bg-blue-500 -mt-4 z-0 transition-all duration-300" 
            style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
          ></div>
        </div>
      </div>

      {submitError && (
        <div className="mb-6 p-4 border border-red-200 rounded-md bg-red-50 flex items-start">
          <AlertCircle className="text-red-500 h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
          <div className="flex-grow">
            <p className="text-red-800 text-sm font-medium">{submitError}</p>
            <button className="text-xs text-red-600 mt-1" onClick={() => setSubmitError(null)}>
              Dismiss
            </button>
          </div>
          <button 
            onClick={() => setSubmitError(null)} 
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 1 ? 'Campaign Information' : 
             currentStep === 2 ? 'Medical Details' : 
             'Documentation & Verification'}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 ? 'Start by providing basic campaign information' : 
             currentStep === 2 ? 'Tell us about the medical condition and treatment' : 
             'Upload necessary documents to verify your campaign'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} id="campaign-form">
            {renderFormStep()}
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={isSubmitting}
            >
              Previous
            </Button>
          ) : (
            <div></div>
          )}
          
          {currentStep < 3 ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              Continue
            </Button>
          ) : (
            <Button
              type="submit"
              form="campaign-form"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Campaign'}
            </Button>
          )}
        </CardFooter>
      </Card>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          <Clock className="inline-block mr-1 h-4 w-4" />
          Estimated completion time: <span className="font-medium">10 minutes</span>
        </p>
      </div>
    </div>
  );
};

export default CreateCampaignForm; 