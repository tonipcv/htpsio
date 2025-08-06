'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { slugify } from "@/lib/utils";
import { signIn } from "next-auth/react";

// Step 1: Initial data form
function Step1({
  formData,
  setFormData,
  onNext
}: {
  formData: any;
  setFormData: (data: any) => void;
  onNext: () => void;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validations
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Validation error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="font-normal text-zinc-300">Full name</Label>
        <Input
          id="name"
          name="name"
          placeholder="Your full name"
          value={formData.name}
          onChange={handleChange}
          required
          className="bg-zinc-800 border-zinc-700 text-zinc-200"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email" className="font-normal text-zinc-300">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="your@email.com"
          value={formData.email}
          onChange={handleChange}
          required
          className="bg-zinc-800 border-zinc-700 text-zinc-200"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password" className="font-normal text-zinc-300">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Create a secure password"
          value={formData.password}
          onChange={handleChange}
          required
          className="bg-zinc-800 border-zinc-700 text-zinc-200"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="font-normal text-zinc-300">Confirm password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className="bg-zinc-800 border-zinc-700 text-zinc-200"
        />
      </div>
      
      <Button type="submit" className="w-full font-normal">
        Continue
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

  const sendVerificationCode = async () => {
    setIsLoading(true);
    
    try {
      console.log('Sending verification code to:', email);
      const response = await fetch('/api/auth/register/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Error sending code');
      }

      setCodeSent(true);
      toast({
        title: "Code sent!",
        description: "Check your email for the verification code.",
      });
      
      console.log('Code sent successfully, advancing to next step');
      // Add a small delay before advancing to next step
      setTimeout(() => {
        onNext();
      }, 500);
    } catch (error: any) {
      console.error('Error sending verification code:', error);
      toast({
        title: "Error",
        description: error.message || "Could not send verification code.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium text-zinc-200">Email Verification</h3>
        <p className="text-sm text-zinc-400 mt-1">
          We'll send a verification code to {email}
        </p>
      </div>
      
      <Button 
        onClick={sendVerificationCode} 
        className="w-full font-normal"
        disabled={isLoading || codeSent}
      >
        {isLoading ? "Sending..." : codeSent ? "Code sent!" : "Send verification code"}
      </Button>
      
      <Button 
        variant="outline" 
        onClick={onBack} 
        className="w-full font-normal text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200"
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

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
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
        title: "Code verified!",
        description: "Your email has been successfully verified.",
      });
      
      onNext();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid or expired code.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={verifyCode} className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium text-zinc-200">Confirm code</h3>
        <p className="text-sm text-zinc-400 mt-1">
          Enter the verification code sent to {email}
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="verificationCode" className="font-normal text-zinc-300">Verification code</Label>
        <Input
          id="verificationCode"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          placeholder="Enter the 6-digit code"
          required
          className="bg-zinc-800 border-zinc-700 text-zinc-200"
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full font-normal"
        disabled={isLoading || !verificationCode}
      >
        {isLoading ? "Verifying..." : "Verify code"}
      </Button>
      
      <Button 
        type="button"
        variant="outline" 
        onClick={onBack} 
        className="w-full font-normal text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200"
        disabled={isLoading}
      >
        Back
      </Button>
    </form>
  );
}

// Step 4: Final confirmation and account creation
function Step4({
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
  const createAccount = async () => {
    setIsLoading(true);
    
    try {
      // Generate slug from name
      const slug = slugify(formData.name);

      const response = await fetch('/api/auth/register/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          slug: slug
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error creating account');
      }

      toast({
        title: "Account created successfully!",
        description: "You will be redirected to your dashboard.",
      });
      
      // Login automático usando o token JWT
      if (data.token) {
        console.log('Attempting automatic login with token');
        try {
          // Usar o token para autenticação via NextAuth
          const result = await signIn('credentials', {
            token: data.token,
            redirect: false
          });
          
          if (result?.error) {
            console.error('Auto-login error:', result.error);
            throw new Error(result.error);
          }
          
          console.log('Auto-login successful');
        } catch (loginError) {
          console.error('Error during auto-login:', loginError);
          // Mesmo com erro no login automático, continuar com o fluxo normal
        }
      }
      
      onComplete();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not create your account.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium text-zinc-200">Confirm registration</h3>
        <p className="text-sm text-zinc-400 mt-1">
          Verify your information before creating your account
        </p>
      </div>
      
      <div className="space-y-2 bg-zinc-800 border border-zinc-700 p-4 rounded-md">
        <div className="flex justify-between">
          <span className="text-sm text-zinc-400">Name:</span>
          <span className="text-sm font-medium text-zinc-200">{formData.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-zinc-400">Email:</span>
          <span className="text-sm font-medium text-zinc-200">{formData.email}</span>
        </div>
      </div>
      
      <Button 
        onClick={createAccount} 
        className="w-full font-normal"
        disabled={isLoading}
      >
        {isLoading ? "Creating account..." : "Create account"}
      </Button>
      
      <Button 
        variant="outline" 
        onClick={onBack} 
        className="w-full font-normal text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200"
        disabled={isLoading}
      >
        Back
      </Button>
    </div>
  );
}

export function RegisterSteps() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const goToNextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const goToPreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const completeRegistration = () => {
    // Redirect directly to documents page (authenticated area)
    router.push('/documents');
  };

  return (
    <div className="w-full">
      {/* Progress indicator */}
      <div className="flex justify-between mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div 
            key={step} 
            className={`flex-1 h-1 mx-1 rounded-full ${
              step <= currentStep ? 'bg-primary' : 'bg-zinc-700'
            }`}
          />
        ))}
      </div>

      {/* Steps */}
      {currentStep === 1 && (
        <Step1 
          formData={formData} 
          setFormData={setFormData} 
          onNext={goToNextStep} 
        />
      )}
      
      {currentStep === 2 && (
        <Step2 
          email={formData.email}
          onBack={goToPreviousStep}
          onNext={goToNextStep}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      )}
      
      {currentStep === 3 && (
        <Step3 
          email={formData.email}
          onBack={goToPreviousStep}
          onNext={goToNextStep}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      )}
      
      {currentStep === 4 && (
        <Step4 
          formData={formData}
          onBack={goToPreviousStep}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          onComplete={completeRegistration}
        />
      )}
    </div>
  );
}
