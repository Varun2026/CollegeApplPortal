import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, CheckCircle2, XCircle, Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  encryptData,
  decryptData,
  generateIV,
  ivToBase64,
  validateFileType,
  validateFileSize,
  fileToBase64,
} from "@/lib/encryptUtils";
import { applicationDataSchema, type ApplicationData } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Form validation schema
const formSchema = applicationDataSchema;

type FormData = z.infer<typeof formSchema>;

// Multi-step form steps
const STEPS = [
  { id: 1, title: "Personal Info", description: "Basic information" },
  { id: 2, title: "Academic Info", description: "Educational details" },
  { id: 3, title: "Documents", description: "Upload files" },
  { id: 4, title: "Review & Submit", description: "Verify and encrypt" },
];

interface UploadedFile {
  name: string;
  type: string;
  size: number;
  data: string;
}

export default function ApplicationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      course: "",
      department: "",
      gpa: "",
      documents: [],
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: { encryptedData: string; iv: string }) => {
      return await apiRequest("POST", "/api/applications", data);
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      // Validate file type
      if (!validateFileType(file)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} must be PDF or JPG format`,
          variant: "destructive",
        });
        continue;
      }

      // Validate file size
      if (!validateFileSize(file)) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 10MB limit`,
          variant: "destructive",
        });
        continue;
      }

      try {
        const base64Data = await fileToBase64(file);
        const uploadedFile: UploadedFile = {
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64Data,
        };
        setUploadedFiles((prev) => [...prev, uploadedFile]);
        toast({
          title: "File uploaded",
          description: `${file.name} added successfully`,
        });
      } catch (error) {
        toast({
          title: "Upload failed",
          description: `Could not upload ${file.name}`,
          variant: "destructive",
        });
      }
    }
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fieldsToValidate as any);

    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly",
        variant: "destructive",
      });
      return;
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please complete all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data with uploaded files
      const formData = form.getValues();
      const applicationData: ApplicationData = {
        ...formData,
        documents: uploadedFiles,
      };

      // Generate random IV
      const iv = generateIV();
      const ivBase64 = ivToBase64(iv);

      // Encrypt the application data
      const encryptedData = await encryptData(applicationData, iv);

      console.log("Encryption complete:", {
        iv: ivBase64,
        encryptedDataLength: encryptedData.length,
      });

      // Submit to backend
      await submitMutation.mutateAsync({
        encryptedData,
        iv: ivBase64,
      });

      setSubmitSuccess(true);
      toast({
        title: "Application Submitted Successfully",
        description: "Your data has been encrypted and securely submitted",
      });
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Submission Failed",
        description: "Could not submit your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldsForStep = (step: number): (keyof FormData)[] => {
    switch (step) {
      case 1:
        return ["name", "email", "phone"];
      case 2:
        return ["course", "department", "gpa"];
      case 3:
        return [];
      case 4:
        return [];
      default:
        return [];
    }
  };

  const progress = (currentStep / 4) * 100;

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-chart-2/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-chart-2" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold mb-2" data-testid="text-success-title">
            Application Submitted Successfully
          </h2>
          <p className="text-muted-foreground mb-6" data-testid="text-success-message">
            Your application has been encrypted with AES-GCM 256-bit encryption and
            securely stored. You will receive a confirmation email shortly.
          </p>
          <Button
            onClick={() => {
              setSubmitSuccess(false);
              setCurrentStep(1);
              form.reset();
              setUploadedFiles([]);
            }}
            data-testid="button-new-application"
          >
            Submit Another Application
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Lock className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold" data-testid="text-page-title">
              College Application Portal
            </h1>
          </div>
          <p className="text-muted-foreground" data-testid="text-page-subtitle">
            End-to-End Encrypted with AES-GCM 256-bit Security
          </p>
          <div className="mt-2 px-4 py-2 bg-destructive/10 border border-destructive/20 rounded-lg max-w-2xl mx-auto">
            <p className="text-xs text-destructive font-medium text-center">
              ⚠️ DEMO VERSION: Uses client-side key for demonstration only. Not secure for production use.
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                      currentStep >= step.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                    data-testid={`step-indicator-${step.id}`}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="text-center mt-2 hidden md:block">
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 rounded transition-colors ${
                      currentStep > step.id ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" data-testid="progress-bar" />
        </div>

        {/* Form Card */}
        <Card className="p-8">
          <form onSubmit={(e) => e.preventDefault()}>
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold" data-testid="text-step1-title">
                  Personal Information
                </h2>

                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    data-testid="input-name"
                    {...form.register("name")}
                    placeholder="John Doe"
                    className="mt-1"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      data-testid="input-email"
                      {...form.register("email")}
                      placeholder="john@example.com"
                      className="mt-1"
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      data-testid="input-phone"
                      {...form.register("phone")}
                      placeholder="+1 (555) 000-0000"
                      className="mt-1"
                    />
                    {form.formState.errors.phone && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Academic Info */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold" data-testid="text-step2-title">
                  Academic Information
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="course">Course *</Label>
                    <Input
                      id="course"
                      data-testid="input-course"
                      {...form.register("course")}
                      placeholder="Computer Science"
                      className="mt-1"
                    />
                    {form.formState.errors.course && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.course.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="department">Department *</Label>
                    <Input
                      id="department"
                      data-testid="input-department"
                      {...form.register("department")}
                      placeholder="Engineering"
                      className="mt-1"
                    />
                    {form.formState.errors.department && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.department.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="gpa">GPA (0.0 - 4.0) *</Label>
                  <Input
                    id="gpa"
                    data-testid="input-gpa"
                    {...form.register("gpa")}
                    placeholder="3.85"
                    type="number"
                    step="0.01"
                    className="mt-1"
                  />
                  {form.formState.errors.gpa && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.gpa.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Documents */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold" data-testid="text-step3-title">
                  Upload Documents
                </h2>
                <p className="text-sm text-muted-foreground">
                  Upload your academic transcripts, certificates, or recommendation
                  letters (PDF or JPG, max 10MB each)
                </p>

                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover-elevate transition-colors">
                  <input
                    type="file"
                    id="file-upload"
                    data-testid="input-file-upload"
                    accept=".pdf,.jpg,.jpeg"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="font-medium mb-1">Click to upload files</p>
                    <p className="text-sm text-muted-foreground">
                      PDF or JPG (max 10MB)
                    </p>
                  </label>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Uploaded Files ({uploadedFiles.length})</Label>
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                        data-testid={`file-item-${index}`}
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(index)}
                          data-testid={`button-remove-file-${index}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold" data-testid="text-step4-title">
                  Review & Submit
                </h2>

                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-medium mb-2">Personal Information</h3>
                    <div className="space-y-1 text-sm">
                      <p data-testid="text-review-name">
                        <span className="text-muted-foreground">Name:</span>{" "}
                        {form.getValues("name")}
                      </p>
                      <p data-testid="text-review-email">
                        <span className="text-muted-foreground">Email:</span>{" "}
                        {form.getValues("email")}
                      </p>
                      <p data-testid="text-review-phone">
                        <span className="text-muted-foreground">Phone:</span>{" "}
                        {form.getValues("phone")}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep(1)}
                      className="mt-2"
                      data-testid="button-edit-personal"
                    >
                      Edit
                    </Button>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-medium mb-2">Academic Information</h3>
                    <div className="space-y-1 text-sm">
                      <p data-testid="text-review-course">
                        <span className="text-muted-foreground">Course:</span>{" "}
                        {form.getValues("course")}
                      </p>
                      <p data-testid="text-review-department">
                        <span className="text-muted-foreground">Department:</span>{" "}
                        {form.getValues("department")}
                      </p>
                      <p data-testid="text-review-gpa">
                        <span className="text-muted-foreground">GPA:</span>{" "}
                        {form.getValues("gpa")}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep(2)}
                      className="mt-2"
                      data-testid="button-edit-academic"
                    >
                      Edit
                    </Button>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="p-4 bg-muted rounded-lg">
                      <h3 className="font-medium mb-2">Documents</h3>
                      <div className="space-y-1 text-sm">
                        {uploadedFiles.map((file, index) => (
                          <p key={index} data-testid={`text-review-file-${index}`}>
                            • {file.name}
                          </p>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentStep(3)}
                        className="mt-2"
                        data-testid="button-edit-documents"
                      >
                        Edit
                      </Button>
                    </div>
                  )}

                  <div className="p-4 bg-chart-3/10 border border-chart-3/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Lock className="w-5 h-5 text-chart-3 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-chart-3 mb-1">
                          End-to-End Encryption
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Your application will be encrypted with AES-GCM 256-bit
                          encryption before submission. A random IV will be generated
                          for maximum security.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || isSubmitting}
                data-testid="button-back"
              >
                Back
              </Button>

              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  data-testid="button-next"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  data-testid="button-submit"
                >
                  {isSubmitting ? (
                    <>
                      <Lock className="w-4 h-4 mr-2 animate-pulse" />
                      Encrypting & Submitting...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Encrypt & Submit
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
