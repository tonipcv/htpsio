export const SECURITY_PLAN_LIMITS = {
  free: {
    maxEndpoints: 1,
    features: {
      antivirus: true,
      firewall: true,
      isolation: false,
      backup: false
    }
  },
  basic: {
    maxEndpoints: 3,
    features: {
      antivirus: true,
      firewall: true,
      isolation: true,
      backup: false
    }
  },
  pro: {
    maxEndpoints: 10,
    features: {
      antivirus: true,
      firewall: true,
      isolation: true,
      backup: true
    }
  },
  enterprise: {
    maxEndpoints: 50,
    features: {
      antivirus: true,
      firewall: true,
      isolation: true,
      backup: true
    }
  },
  custom: {
    maxEndpoints: null, // Ilimitado
    features: {
      antivirus: true,
      firewall: true,
      isolation: true,
      backup: true
    }
  }
}; 