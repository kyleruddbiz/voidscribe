export interface PortfolioEntry {
  href: string;
  rel?: string;
  callToAction: string;
  icon: string;
  description?: string;
  title: string;
  skills: readonly string[];
}

export interface Role {
  name: string;
  skills: readonly string[];
}
