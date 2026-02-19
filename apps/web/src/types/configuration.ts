export interface GlobalConfig {
  logoText: string;
  logoUrl?: string;
  faviconUrl?: string;
  email: string;
  phone: string;
  address: string;
  social: {
    linkedin: string;
    facebook: string;
  };
}

export interface HomeHeroConfig {
  tagline: string;
  title: string;
  intro: string;
}

export interface HomePromoConfig {
  title: string;
  subtitle: string;
  description: string;
  buttonLabel: string;
}

export interface HomeValueConfig {
  title: string;
  text: string;
}

// home_values is an array of HomeValueConfig

export interface HomeTrustConfig {
  quote: string;
  author: string;
  role: string;
}

export interface HomeCtaConfig {
  title: string;
  buttonPrimary: string;
  buttonSecondary: string;
}

export type SiteConfigKey =
  | 'global_settings'
  | 'home_hero'
  | 'home_promo'
  | 'home_values'
  | 'home_trust'
  | 'home_cta';
