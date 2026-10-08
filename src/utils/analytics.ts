/**
 * Google Analytics 4 (GA4) Event Dispatcher Utility
 */

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

export function trackEvent(eventName: string, params: Record<string, any> = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

export const Analytics = {
  // Page / Section Views
  trackPageView(pageTitle?: string, pagePath?: string) {
    trackEvent('page_view', {
      page_title: pageTitle || document.title,
      page_location: window.location.href,
      page_path: pagePath || window.location.pathname,
    });
  },

  // Project Interactions
  trackProjectView(projectId: string, projectTitle: string, category: string) {
    trackEvent('view_item', {
      item_id: projectId,
      item_name: projectTitle,
      item_category: category,
    });
  },

  // Estimator Calculations
  trackEstimatorQuote(category: string, budget: string, timeline: string) {
    trackEvent('generate_lead', {
      currency: 'USD',
      lead_type: 'estimator_quote',
      service_category: category,
      estimated_budget: budget,
      turnaround: timeline,
    });
  },

  // Contact Form Submission
  trackContactFormSubmission(projectType: string, budget?: string) {
    trackEvent('contact_form_submit', {
      project_type: projectType,
      budget_range: budget,
    });
  },

  // 3D Character & UI Customizer
  track3DInteraction(action: string, detail?: string) {
    trackEvent('3d_interaction', {
      action_type: action,
      detail: detail || '',
    });
  },
};
