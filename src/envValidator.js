// src/envValidator.js

/**
 * Environment Variable Validator
 * Validates required and optional environment variables with type checking
 * Provides automatic defaults for development environment
 * Throws errors in production for missing required variables
 */

// Environment variable configuration
const envConfig = {
  required: {
    REACT_APP_API_URL: {
      type: 'string',
      description: 'Base URL for API requests',
      example: 'https://api.yourservice.com/v1'
    },
    REACT_APP_STRIPE_PUBLIC_KEY: {
      type: 'string',
      description: 'Stripe publishable key for payments',
      example: 'pk_test_51K...'
    }
  },
  optional: {
    REACT_APP_SENTRY_DSN: {
      type: 'string',
      description: 'Sentry DSN for error tracking',
      requiredIn: ['production']
    },
    REACT_APP_GOOGLE_ANALYTICS_ID: {
      type: 'string',
      description: 'Google Analytics tracking ID'
    },
    REACT_APP_DEBUG: {
      type: 'boolean',
      description: 'Enable debug mode',
      default: false
    }
  }
};

// Type checkers with validation functions
const typeCheckers = {
  string: (value) => typeof value === 'string',
  boolean: (value) => {
    if (typeof value === 'string') {
      return value === 'true' || value === 'false';
    }
    return typeof value === 'boolean';
  },
  number: (value) => !isNaN(Number(value))
};

/**
 * Validate environment variables against configuration
 * @throws {Error} When validation fails in production environment
 */
const validateEnv = () => {
  const errors = [];
  const warnings = [];
  const currentEnv = process.env.NODE_ENV || 'development';

  // Validate required variables
  Object.entries(envConfig.required).forEach(([varName, config]) => {
    if (!process.env[varName]) {
      errors.push(`Missing required env var: ${varName} - ${config.description}`);
    } else if (!typeCheckers[config.type]?.(process.env[varName])) {
      errors.push(`Invalid type for ${varName}: Expected ${config.type}`);
    }
  });

  // Validate optional variables
  Object.entries(envConfig.optional).forEach(([varName, config]) => {
    // Check if required in current environment
    if (config.requiredIn?.includes(currentEnv) && !process.env[varName]) {
      errors.push(`Missing env var required in ${currentEnv}: ${varName} - ${config.description}`);
    }

    // Type checking for present variables
    if (process.env[varName] && !typeCheckers[config.type]?.(process.env[varName])) {
      errors.push(`Invalid type for ${varName}: Expected ${config.type}`);
    }

    // Set defaults if not provided
    if (!process.env[varName] && 'default' in config) {
      process.env[varName] = String(config.default);
    }
  });

  // Development environment specific handling
  if (currentEnv === 'development') {
    Object.entries(envConfig.required).forEach(([varName, config]) => {
      if (!process.env[varName]) {
        warnings.push(`Development warning: Missing ${varName} - Using default value`);
        // Set development defaults for required variables
        switch (varName) {
          case 'REACT_APP_API_URL':
            process.env[varName] = 'http://localhost:3001';
            break;
          case 'REACT_APP_STRIPE_PUBLIC_KEY':
            process.env[varName] = 'pk_test_mockkey';
            break;
          default:
            // Default case added to fix eslint warning
            process.env[varName] = 'dev_default_value';
            break;
        }
      }
    });
  }

  // Handle warnings (development only)
  if (warnings.length > 0) {
    console.warn('Environment Warnings:\n', warnings.join('\n '));
  }

  // Handle errors based on environment
  if (errors.length > 0) {
    const errorMessage = `Environment Validation Failed:\n${errors.join('\n')}`;
    if (currentEnv === 'production') {
      throw new Error(errorMessage);
    } else {
      console.error(errorMessage);
    }
  }

  // Log successful validation in development
  if (currentEnv === 'development' && errors.length === 0) {
    console.debug('Environment variables validated successfully');
  }
};

/**
 * Generates help documentation for environment variables
 * @returns {string} Formatted help text with configuration details
 */
export const getEnvHelp = () => {
  let helpText = 'Environment Variables Configuration:\n\n=== REQUIRED VARIABLES ===\n';

  // Required variables documentation
  Object.entries(envConfig.required).forEach(([varName, config]) => {
    helpText += `• ${varName} (${config.type})\n`;
    helpText += `  Description: ${config.description}\n`;
    helpText += `  Example: ${varName}=${config.example}\n\n`;
  });

  helpText += '=== OPTIONAL VARIABLES ===\n';
  // Optional variables documentation
  Object.entries(envConfig.optional).forEach(([varName, config]) => {
    helpText += `• ${varName} (${config.type})\n`;
    helpText += `  Description: ${config.description}\n`;
    if (config.requiredIn) {
      helpText += `  Required in: ${config.requiredIn.join(', ')}\n`;
    }
    if ('default' in config) {
      helpText += `  Default: ${config.default}\n`;
    }
    helpText += '\n';
  });

  return helpText;
};

// Immediately validate environment when imported
try {
  validateEnv();
} catch (error) {
  // In production, fail fast and exit
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Critical Environment Error:', error.message);
    process.exit(1);
  }
  // In development, log but continue
  console.error('⚠️ Environment Warning:', error.message);
}

export default validateEnv;