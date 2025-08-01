'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowDownTrayIcon,
  ComputerDesktopIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";

type WizardStep = 'DOWNLOAD_INSTALLER' | 'INSTALL_DEVICE' | 'VERIFY_EMAIL' | 'COMPLETED';

interface StepInfo {
  title: string;
  description: string;
  icon: React.ForwardRefExoticComponent<any>;
  action: string;
}

const STEPS: Record<WizardStep, StepInfo> = {
  DOWNLOAD_INSTALLER: {
    title: "Baixar Instalador",
    description: "Faça o download do instalador personalizado com a marca da sua empresa.",
    icon: ArrowDownTrayIcon,
    action: "Baixar Agora"
  },
  INSTALL_DEVICE: {
    title: "Instalar no Computador",
    description: "Siga as instruções para instalar o software de proteção no seu computador.",
    icon: ComputerDesktopIcon,
    action: "Ver Instruções"
  },
  VERIFY_EMAIL: {
    title: "Confirmar Email",
    description: "Confirme seu domínio de email para ativar a proteção de email e backup.",
    icon: EnvelopeIcon,
    action: "Verificar Email"
  },
  COMPLETED: {
    title: "Configuração Concluída",
    description: "Parabéns! Seu ambiente está configurado e protegido.",
    icon: CheckCircleIcon,
    action: "Ver Painel de Proteção"
  }
};

const STEP_ORDER: WizardStep[] = ['DOWNLOAD_INSTALLER', 'INSTALL_DEVICE', 'VERIFY_EMAIL', 'COMPLETED'];

function ActivationWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WizardStep>('DOWNLOAD_INSTALLER');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setCurrentStep('DOWNLOAD_INSTALLER');
  }, []);

  useEffect(() => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    setProgress((currentIndex / (STEP_ORDER.length - 1)) * 100);
  }, [currentStep]);

  const handleAction = async (step: WizardStep) => {
    switch (step) {
      case 'DOWNLOAD_INSTALLER':
        setCurrentStep('INSTALL_DEVICE');
        break;
      case 'INSTALL_DEVICE':
        setCurrentStep('VERIFY_EMAIL');
        break;
      case 'VERIFY_EMAIL':
        setCurrentStep('COMPLETED');
        break;
      case 'COMPLETED':
        router.push('/protection-dashboard');
        break;
    }
  };

  const CurrentStepIcon = STEPS[currentStep].icon;

  return (
    <div className="min-h-[100dvh] bg-black pt-20 pb-24 md:pt-12 md:pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex flex-col gap-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">
              Configuração Inicial
            </h1>
            <p className="text-zinc-400">
              Vamos configurar a proteção do seu ambiente em poucos passos
            </p>
          </div>

          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Início</span>
              <span>Progresso: {Math.round(progress)}%</span>
            </div>
          </div>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <CurrentStepIcon className="h-6 w-6 text-blue-500" />
                {STEPS[currentStep].title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-400 mb-6">
                {STEPS[currentStep].description}
              </p>
              <Button 
                onClick={() => handleAction(currentStep)}
                className="w-full sm:w-auto"
              >
                {STEPS[currentStep].action}
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {STEP_ORDER.map((step, index) => {
              const currentIndex = STEP_ORDER.indexOf(currentStep);
              const isCompleted = index < currentIndex;
              const isCurrent = step === currentStep;
              const StepIcon = STEPS[step].icon;

              return (
                <div
                  key={step}
                  className={`
                    flex items-center gap-4 p-4 rounded-lg border
                    ${isCurrent ? 'bg-zinc-900/50 border-zinc-700' : 'bg-zinc-900/25 border-zinc-800'}
                  `}
                >
                  <div className={`
                    h-8 w-8 rounded-full flex items-center justify-center
                    ${isCompleted ? 'bg-green-500/20 text-green-500' : 
                      isCurrent ? 'bg-blue-500/20 text-blue-500' : 'bg-zinc-800 text-zinc-500'}
                  `}>
                    {isCompleted ? (
                      <CheckCircleIcon className="h-5 w-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div>
                    <h3 className={`font-medium ${isCurrent ? 'text-white' : 'text-zinc-400'}`}>
                      {STEPS[step].title}
                    </h3>
                    <p className="text-sm text-zinc-500">
                      {STEPS[step].description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivationWizard; 