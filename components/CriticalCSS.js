export const CriticalCSS = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    /* CRITICAL ABOVE-THE-FOLD CSS */
    * { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
    
    .distance-result__header {
      padding: 1rem;
      text-align: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .distance-result__title {
      font-size: 1.8rem;
      margin-bottom: 0.5rem;
      font-weight: 700;
      line-height: 1.2;
    }
    .distance-result__description {
      font-size: 1.1rem;
      opacity: 0.9;
      max-width: 800px;
      margin: 0 auto;
      line-height: 1.4;
    }
    .distance-result__metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin: 2rem 0;
      padding: 0 1rem;
    }
    
    /* Metric card critical styles */
    .distance-result__metric-card {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      text-align: center;
      min-height: 150px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .distance-result__metric-value {
      font-size: 2rem;
      font-weight: bold;
      margin: 0.5rem 0;
      color: #2c5282;
    }
    .distance-result__metric-unit {
      font-size: 1rem;
      color: #666;
    }
    
    .distance-calc-loading-screen {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8f9fa;
    }
    .distance-calc-spinner {
      border: 4px solid #e9ecef;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      width: 48px;
      height: 48px;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* Skip link */
    .skip-link {
      position: absolute;
      top: -40px;
      left: 0;
      background: #000;
      color: white;
      padding: 8px;
      z-index: 10000;
      transition: top 0.3s;
    }
    .skip-link:focus {
      top: 0;
    }
    
    /* Screen reader only */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `}} />
);