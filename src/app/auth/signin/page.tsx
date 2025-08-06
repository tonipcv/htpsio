'use client';

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function SignIn() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/documents";
  const error = searchParams.get('error');

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(error || "");
  const [activeTab, setActiveTab] = useState("password");
  const [codeSent, setCodeSent] = useState(false);
  const [codeRequestLoading, setCodeRequestLoading] = useState(false);

  // Login tradicional com senha
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const result = await signIn('credentials', {
        email,
        password,
        type: 'user',
        redirect: false,
        callbackUrl
      });

      if (result?.error) {
        setErrorMsg(result.error);
        return;
      }

      if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg("An error occurred while signing in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Solicitar código por email
  const handleRequestCode = async () => {
    if (!email) {
      setErrorMsg("Please enter your email address");
      return;
    }
    
    setCodeRequestLoading(true);
    setErrorMsg("");
    
    try {
      const response = await fetch('/api/auth/request-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to request code');
      }
      
      setCodeSent(true);
      toast.success("Verification code sent to your email");
    } catch (err) {
      console.error('Error requesting code:', err);
      setErrorMsg("Failed to send verification code. Please try again.");
    } finally {
      setCodeRequestLoading(false);
    }
  };
  
  // Login com código
  const handleCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !verificationCode) {
      setErrorMsg("Email and verification code are required");
      return;
    }
    
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, code: verificationCode })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Invalid or expired code');
      }
      
      // Login bem-sucedido com código
      if (data.token) {
        // Usar o token para autenticar via NextAuth
        const result = await signIn('credentials', {
          email,
          token: data.token,
          redirect: false,
          callbackUrl
        });
        
        if (result?.error) {
          throw new Error(result.error);
        }
        
        if (result?.ok) {
          router.push(callbackUrl);
          router.refresh();
        }
      }
    } catch (err) {
      console.error('Code verification error:', err);
      setErrorMsg(err instanceof Error ? err.message : "Failed to verify code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#1c1d20] flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-[#1c1d20] rounded-xl p-8 border border-[#f5f5f7]/10">
        <div className="relative text-center mb-8">
          <Image
            src="/logo.png"
            alt="Logo"
            width={48}
            height={48}
            priority
            className="relative h-12 w-12 brightness-0 invert mx-auto"
          />
        </div>

        <Tabs defaultValue="password" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="code">Email Code</TabsTrigger>
          </TabsList>
          
          {/* Login com senha */}
          <TabsContent value="password" className="space-y-6">
            <form onSubmit={handlePasswordLogin} className="relative space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email-password">
                  Email
                </Label>
                <Input
                  id="email-password"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                  disabled={isLoading}
                  className="relative"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                  className="relative"
                />
              </div>

              {errorMsg && activeTab === "password" && (
                <div className="relative text-red-400 text-sm text-center">{errorMsg}</div>
              )}

              <Button 
                type="submit"
                disabled={isLoading}
                className="relative w-full bg-[#1c1d20] hover:bg-[#f5f5f7]/5 text-[#f5f5f7] border border-[#f5f5f7]/10 py-6"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border border-[#f5f5f7]/30 border-t-[#f5f5f7] mr-2"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>
          </TabsContent>
          
          {/* Login com código */}
          <TabsContent value="code" className="space-y-6">
            <form onSubmit={handleCodeLogin} className="relative space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email-code">
                  Email
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id="email-code"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    autoComplete="email"
                    disabled={isLoading || codeRequestLoading}
                    className="relative flex-1"
                  />
                  <Button 
                    type="button"
                    onClick={handleRequestCode}
                    disabled={isLoading || codeRequestLoading || !email}
                    className="whitespace-nowrap bg-[#1c1d20] hover:bg-[#f5f5f7]/5 text-[#f5f5f7] border border-[#f5f5f7]/10"
                  >
                    {codeRequestLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border border-[#f5f5f7]/30 border-t-[#f5f5f7] mr-2"></div>
                        <span>Sending...</span>
                      </div>
                    ) : codeSent ? 'Resend Code' : 'Get Code'}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verification-code">
                  Verification Code
                </Label>
                <Input
                  id="verification-code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="123456"
                  required
                  disabled={isLoading}
                  className="relative"
                  maxLength={6}
                />
              </div>

              {errorMsg && activeTab === "code" && (
                <div className="relative text-red-400 text-sm text-center">{errorMsg}</div>
              )}

              <Button 
                type="submit"
                disabled={isLoading || !codeSent}
                className="relative w-full bg-[#1c1d20] hover:bg-[#f5f5f7]/5 text-[#f5f5f7] border border-[#f5f5f7]/10 py-6"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border border-[#f5f5f7]/30 border-t-[#f5f5f7] mr-2"></div>
                    <span>Verifying...</span>
                  </div>
                ) : (
                  'Verify & Sign in'
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="relative text-center space-y-2 mt-6">
          <Link 
            href="/auth/forgot-password" 
            className="relative text-[#f5f5f7]/70 hover:text-[#f5f5f7] text-sm block"
          >
            Forgot your password?
          </Link>
          <Link 
            href="/auth/register" 
            className="relative text-[#f5f5f7]/70 hover:text-[#f5f5f7] text-sm block"
          >
            Don't have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  );
} 