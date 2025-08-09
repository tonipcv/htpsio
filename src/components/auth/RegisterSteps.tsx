'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { signIn } from "next-auth/react";
import { slugify } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Step 1: Email collection only
function Step1({
  formData,
  setFormData,
  onNext,
  isLoading,
  setIsLoading
}: {
  formData: any;
  setFormData: (data: any) => void;
  onNext: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}) {
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    
    // Email validation
    if (!formData.email.trim()) {
      setErrorMsg("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMsg("Please enter a valid email address");
      return;
    }

    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="your@email.com"
          value={formData.email}
          onChange={handleChange}
          required
          autoComplete="email"
          disabled={isLoading}
          className="relative"
        />
      </div>

      {errorMsg && (
        <div className="relative text-red-400 text-sm text-center">{errorMsg}</div>
      )}

      <Button 
        type="submit" 
        disabled={isLoading}
        className="relative w-full bg-[#1c1d20] hover:bg-[#f5f5f7]/5 text-[#f5f5f7] border border-[#f5f5f7]/10 py-6"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            <span>Processing...</span>
          </div>
        ) : (
          'Continue'
        )}
      </Button>
    </form>
  );
}

// Step 2: Sending verification code by email
function Step2({
  email,
  onBack,
  onNext,
  isLoading,
  setIsLoading
}: {
  email: string;
  onBack: () => void;
  onNext: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}) {
  const [codeSent, setCodeSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const sendVerificationCode = async () => {
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      const response = await fetch('/api/auth/register/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error sending code');
      }

      setCodeSent(true);
      toast({
        title: "Success",
        description: "Verification code sent to your email",
      });
      
      // Add a small delay before advancing to next step
      setTimeout(() => {
        onNext();
      }, 1000);
    } catch (error: any) {
      console.error('Error sending verification code:', error);
      setErrorMsg(error.message || "Could not send verification code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-[#f5f5f7]">Email Verification</h3>
        <p className="text-sm text-[#f5f5f7]/70 mt-1">
          We'll send a verification code to {email}
        </p>
      </div>
      
      {errorMsg && (
        <div className="relative text-red-400 text-sm text-center">{errorMsg}</div>
      )}
      
      <Button 
        onClick={sendVerificationCode} 
        className="relative w-full bg-[#1c1d20] hover:bg-[#f5f5f7]/5 text-[#f5f5f7] border border-[#f5f5f7]/10 py-6"
        disabled={isLoading || codeSent}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            <span>Sending code...</span>
          </div>
        ) : codeSent ? "Code sent!" : "Send verification code"}
      </Button>
      
      <Button 
        variant="outline" 
        onClick={onBack} 
        className="relative w-full border border-[#f5f5f7]/10 text-[#f5f5f7]/70 hover:text-[#f5f5f7] hover:bg-[#f5f5f7]/5"
        disabled={isLoading}
      >
        Back
      </Button>
    </div>
  );
}

// Step 3: Code verification
function Step3({
  email,
  onBack,
  onNext,
  isLoading,
  setIsLoading
}: {
  email: string;
  onBack: () => void;
  onNext: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}) {
  const [verificationCode, setVerificationCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      const response = await fetch('/api/auth/register/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          code: verificationCode 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid code');
      }

      toast({
        title: "Success",
        description: "Your email has been successfully verified",
      });
      
      onNext();
    } catch (error: any) {
      setErrorMsg(error.message || "Invalid or expired code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={verifyCode} className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-[#f5f5f7]">Confirm code</h3>
        <p className="text-sm text-[#f5f5f7]/70 mt-1">
          Enter the verification code sent to {email}
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="verificationCode">
          Verification code
        </Label>
        <Input
          id="verificationCode"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          placeholder="Enter the 6-digit code"
          required
          className="relative"
          maxLength={6}
        />
      </div>
      
      {errorMsg && (
        <div className="relative text-red-400 text-sm text-center">{errorMsg}</div>
      )}
      
      <Button 
        type="submit" 
        className="relative w-full bg-[#1c1d20] hover:bg-[#f5f5f7]/5 text-[#f5f5f7] border border-[#f5f5f7]/10 py-6"
        disabled={isLoading || !verificationCode}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            <span>Verifying...</span>
          </div>
        ) : (
          'Verify code'
        )}
      </Button>
      
      <Button 
        type="button"
        variant="outline" 
        onClick={onBack} 
        className="relative w-full border border-[#f5f5f7]/10 text-[#f5f5f7]/70 hover:text-[#f5f5f7] hover:bg-[#f5f5f7]/5"
        disabled={isLoading}
      >
        Back
      </Button>
    </form>
  );
}

// Step 4: Company information and password
function Step4({
  formData,
  setFormData,
  onBack,
  onNext,
  isLoading,
  setIsLoading
}: {
  formData: any;
  setFormData: (data: any) => void;
  onBack: () => void;
  onNext: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}) {
  const [errorMsg, setErrorMsg] = useState("");
  const [showCustomIndustry, setShowCustomIndustry] = useState(formData.industry === "other");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "industry" && value === "other") {
      setShowCustomIndustry(true);
    } else if (name === "industry") {
      setShowCustomIndustry(false);
    }
    
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
      // Clear customIndustry if not selecting "other"
      ...(name === "industry" && value !== "other" ? { customIndustry: "" } : {})
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    
    // Basic validations
    if (!formData.companyName?.trim()) {
      setErrorMsg("Please enter your company name");
      return;
    }

    if (!formData.teamSize?.trim()) {
      setErrorMsg("Please select your team size");
      return;
    }

    if (!formData.industry?.trim()) {
      setErrorMsg("Please select your industry");
      return;
    }

    if (formData.industry === "other" && !formData.customIndustry?.trim()) {
      setErrorMsg("Please specify your industry");
      return;
    }

    if (!formData.password?.trim()) {
      setErrorMsg("Please create a password");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setErrorMsg("Password must be at least 8 characters");
      return;
    }

    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-[#f5f5f7]">Company Information</h3>
        <p className="text-sm text-[#f5f5f7]/70 mt-1">
          Tell us about your company
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="companyName">
          Company Name
        </Label>
        <Input
          id="companyName"
          name="companyName"
          placeholder="Your company name"
          value={formData.companyName || ""}
          onChange={handleChange}
          required
          disabled={isLoading}
          className="relative"
          autoComplete="organization"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="teamSize">
          Team Size
        </Label>
        <Select
          value={formData.teamSize || ""}
          onValueChange={(value) => handleSelectChange("teamSize", value)}
          disabled={isLoading}
        >
          <SelectTrigger className="relative bg-[#1c1d20] border-[#f5f5f7]/10">
            <SelectValue placeholder="Select team size" />
          </SelectTrigger>
          <SelectContent className="bg-[#1c1d20] border-[#f5f5f7]/10 text-[#f5f5f7]">
            <SelectItem value="1-10">1-10 employees</SelectItem>
            <SelectItem value="11-50">11-50 employees</SelectItem>
            <SelectItem value="51-200">51-200 employees</SelectItem>
            <SelectItem value="201-500">201-500 employees</SelectItem>
            <SelectItem value="501+">501+ employees</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="industry">
          Industry
        </Label>
        <Select
          value={formData.industry || ""}
          onValueChange={(value) => handleSelectChange("industry", value)}
          disabled={isLoading}
        >
          <SelectTrigger className="relative bg-[#1c1d20] border-[#f5f5f7]/10">
            <SelectValue placeholder="Select industry" />
          </SelectTrigger>
          <SelectContent className="bg-[#1c1d20] border-[#f5f5f7]/10 text-[#f5f5f7]">
            <SelectItem value="technology">Technology</SelectItem>
            <SelectItem value="healthcare">Healthcare</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="education">Education</SelectItem>
            <SelectItem value="retail">Retail</SelectItem>
            <SelectItem value="manufacturing">Manufacturing</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {showCustomIndustry && (
        <div className="space-y-2">
          <Label htmlFor="customIndustry">
            Specify Industry
          </Label>
          <Input
            id="customIndustry"
            name="customIndustry"
            placeholder="Enter your industry"
            value={formData.customIndustry || ""}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="relative"
          />
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="password">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Create a secure password"
          value={formData.password || ""}
          onChange={handleChange}
          required
          disabled={isLoading}
          className="relative"
          minLength={8}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">
          Confirm Password
        </Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword || ""}
          onChange={handleChange}
          required
          disabled={isLoading}
          className="relative"
        />
      </div>

      {errorMsg && (
        <div className="relative text-red-400 text-sm text-center">{errorMsg}</div>
      )}
      
      <Button 
        type="submit" 
        className="relative w-full bg-[#1c1d20] hover:bg-[#f5f5f7]/5 text-[#f5f5f7] border border-[#f5f5f7]/10 py-6"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            <span>Processing...</span>
          </div>
        ) : (
          'Continue'
        )}
      </Button>
      
      <Button 
        type="button"
        variant="outline" 
        onClick={onBack} 
        className="relative w-full border border-[#f5f5f7]/10 text-[#f5f5f7]/70 hover:text-[#f5f5f7] hover:bg-[#f5f5f7]/5"
        disabled={isLoading}
      >
        Back
      </Button>
    </form>
  );
}

// Step 5: Final confirmation and account creation
function Step5({
  formData,
  onBack,
  isLoading,
  setIsLoading,
  onComplete
}: {
  formData: any;
  onBack: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onComplete: () => void;
}) {
  const [errorMsg, setErrorMsg] = useState("");

  const createAccount = async () => {
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      // Generate slug from company name
      const slug = slugify(formData.companyName);
      
      // Prepare the industry value - use customIndustry if industry is "other"
      const industryValue = formData.industry === "other" ? formData.customIndustry : formData.industry;
      
      const response = await fetch('/api/auth/register/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.companyName,
          password: formData.password,
          slug: slug,
          // Include the new fields
          companyName: formData.companyName,
          teamSize: formData.teamSize,
          industry: formData.industry,
          customIndustry: formData.industry === "other" ? formData.customIndustry : null
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create account');
      }
      
      // Auto login after successful registration
      const loginResponse = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password
      });
      
      if (loginResponse?.error) {
        throw new Error(loginResponse.error || 'Failed to sign in');
      }
      
      toast({
        title: "Success!",
        description: "Your account has been created and you're now logged in."
      });
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
      
    } catch (error: any) {
      console.error('Registration error:', error);
      setErrorMsg(error.message || 'An unexpected error occurred');
      toast({
        title: "Error",
        description: error.message || 'Failed to create account',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-[#f5f5f7]">Confirm Registration</h3>
        <p className="text-sm text-[#f5f5f7]/70 mt-1">
          Verify your information before creating your account
        </p>
      </div>
      
      <div className="space-y-3 bg-[#1c1d20] border border-[#f5f5f7]/10 p-4 rounded-xl">
        <div className="flex justify-between">
          <span className="text-sm text-[#f5f5f7]/70">Company:</span>
          <span className="text-sm font-medium text-[#f5f5f7]">{formData.companyName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-[#f5f5f7]/70">Email:</span>
          <span className="text-sm font-medium text-[#f5f5f7]">{formData.email}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-[#f5f5f7]/70">Team Size:</span>
          <span className="text-sm font-medium text-[#f5f5f7]">{formData.teamSize}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-[#f5f5f7]/70">Industry:</span>
          <span className="text-sm font-medium text-[#f5f5f7]">
            {formData.industry === "other" ? formData.customIndustry : formData.industry}
          </span>
        </div>
      </div>
      
      {errorMsg && (
        <div className="relative text-red-400 text-sm text-center">{errorMsg}</div>
      )}
      
      <Button 
        onClick={createAccount} 
        className="relative w-full bg-[#1c1d20] hover:bg-[#f5f5f7]/5 text-[#f5f5f7] border border-[#f5f5f7]/10 py-6"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            <span>Creating account...</span>
          </div>
        ) : (
          'Create Account'
        )}
      </Button>
      
      <Button 
        variant="outline" 
        onClick={onBack} 
        className="relative w-full border border-[#f5f5f7]/10 text-[#f5f5f7]/70 hover:text-[#f5f5f7] hover:bg-[#f5f5f7]/5"
        disabled={isLoading}
      >
        Back
      </Button>
    </div>
  );
}

export default function RegisterSteps() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    companyName: "",
    teamSize: "",
    industry: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleNextStep = () => {
    // Clear company name if it's the same as email when moving to step 4
    if (currentStep === 3) {
      if (formData.companyName === formData.email) {
        setFormData(prev => ({
          ...prev,
          companyName: ""
        }));
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleComplete = () => {
    // Redirect to dashboard or login page
    window.location.href = "/dashboard";
  };

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex justify-center mb-4">
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === step
                    ? "bg-[#f5f5f7] text-[#1c1d20]"
                    : currentStep > step
                    ? "bg-[#f5f5f7]/70 text-[#1c1d20]"
                    : "bg-[#1c1d20] text-[#f5f5f7]/50 border border-[#f5f5f7]/10"
                }`}
              >
                {currentStep > step ? "✓" : step}
              </div>
              {step < 5 && (
                <div className="w-10 h-0.5 bg-[#f5f5f7]/10"></div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {currentStep === 1 && (
        <Step1 
          formData={formData}
          setFormData={setFormData}
          onNext={handleNextStep}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      )}
      
      {currentStep === 2 && (
        <Step2 
          email={formData.email}
          onBack={handlePreviousStep}
          onNext={handleNextStep}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      )}
      
      {currentStep === 3 && (
        <Step3
          email={formData.email}
          onBack={handlePreviousStep}
          onNext={handleNextStep}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      )}
      
      {currentStep === 4 && (
        <Step4
          formData={formData}
          setFormData={setFormData}
          onBack={handlePreviousStep}
          onNext={handleNextStep}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      )}
      
      {currentStep === 5 && (
        <Step5
          formData={formData}
          onBack={handlePreviousStep}
          onComplete={handleComplete}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      )}
    </div>
  );
}
