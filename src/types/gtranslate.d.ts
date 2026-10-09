export {};

declare global {
  interface Window {
    gtranslateSettings: {
      default_language: string;
      wrapper_selector: string;
      switcher_horizontal_position: string;
      flag_style: string;
    };
  }
}