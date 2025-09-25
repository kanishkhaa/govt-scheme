require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const passport = require('passport');
const authRoutes = require('./routes/auth');
const agricultureRoutes = require('./routes/agriculture');
const educationRoutes = require('./routes/education');
const healthcareRoutes = require('./routes/healthcare');
const socialWelfareRoutes = require('./routes/socialWelfare');
const transportRoutes = require('./routes/transport');
const womenRoutes = require('./routes/women');
const chatbotRoutes = require('./routes/chatbot');
const AgricultureService = require('./services/agricultureService');
const EducationService = require('./services/educationService');
const HealthcareService = require('./services/healthcareService');
const SocialWelfareService = require('./services/socialWelfareService');
const TransportService = require('./services/transportService');
const WomenService = require('./services/womenService');
const { Groq } = require('groq-sdk');

// Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Explicitly load Passport configuration
try {
  require('./config/passport');
  console.log('Passport configuration loaded successfully');
} catch (err) {
  console.error('Failed to load Passport configuration:', err.message);
}

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Initialize Passport
app.use(passport.initialize());

// Routes
app.use('/api/agriculture', agricultureRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/healthcare', healthcareRoutes);
app.use('/api/social-welfare', socialWelfareRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/women', womenRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/auth', authRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Government Schemes API');
});

// Combined schemes endpoint
app.get('/api/all', async (req, res) => {
  try {
    const [agriculture, education, healthcare, socialWelfare, transport, women] = await Promise.all([
      AgricultureService.getAllData()
        .then(data => {
          const schemes = data.flatMap(doc => doc.agriculture_schemes || []);
          console.log('Agriculture schemes:', schemes.length, schemes.map(s => s.scheme_name));
          return schemes;
        })
        .catch(err => {
          console.error('AgricultureService error:', err.message);
          return [];
        }),
      EducationService.getAllData()
        .then(data => {
          const schemes = data.flatMap(doc => doc.education_schemes || []);
          console.log('Education schemes:', schemes.length, schemes.map(s => s.scheme_name));
          return schemes;
        })
        .catch(err => {
          console.error('EducationService error:', err.message);
          return [];
        }),
      HealthcareService.getAllData()
        .then(data => {
          const schemes = data.flatMap(doc => doc.healthcare_schemes || []);
          console.log('Healthcare schemes:', schemes.length, schemes.map(s => s.scheme_name));
          return schemes;
        })
        .catch(err => {
          console.error('HealthcareService error:', err.message);
          return [];
        }),
      SocialWelfareService.getAllData()
        .then(data => {
          const schemes = data.flatMap(doc => doc.social_welfare_schemes || []);
          console.log('Social Welfare schemes:', schemes.length, schemes.map(s => s.scheme_name));
          return schemes;
        })
        .catch(err => {
          console.error('SocialWelfareService error:', err.message);
          return [];
        }),
      TransportService.getAllData()
        .then(data => {
          const schemes = data.flatMap(doc => doc.transport_and_infrastructure_schemes || []);
          console.log('Transport schemes:', schemes.length, schemes.map(s => s.scheme_name));
          return schemes;
        })
        .catch(err => {
          console.error('TransportService error:', err.message);
          return [];
        }),
      WomenService.getAllData()
        .then(data => {
          const schemes = data.flatMap(doc => doc.women_schemes || []);
          console.log('Women schemes:', schemes.length, schemes.map(s => s.scheme_name));
          return schemes;
        })
        .catch(err => {
          console.error('WomenService error:', err.message);
          return [];
        }),
    ]);

    const allSchemes = [
      ...agriculture,
      ...education,
      ...healthcare,
      ...socialWelfare,
      ...transport,
      ...women
    ];

    console.log('Total combined schemes:', allSchemes.length, allSchemes.map(s => s.scheme_name));
    res.json(allSchemes);
  } catch (err) {
    console.error('Error fetching all schemes:', err.message);
    res.status(500).json({ error: 'Failed to fetch all schemes' });
  }
});

// New recommendation endpoint
app.post('/api/recommend', async (req, res) => {
  try {
    const userProfile = req.body.userProfile || {
      age: 30,
      gender: 'male',
      state: 'Tamil Nadu',
      income: 500000,
      interests: ['agriculture', 'education'],
      occupation: 'farmer'
    }; // Mock user profile if not provided

    // Fetch all schemes
    const [agriculture, education, healthcare, socialWelfare, transport, women] = await Promise.all([
      AgricultureService.getAllData().then(data => data.flatMap(doc => doc.agriculture_schemes || [])),
      EducationService.getAllData().then(data => data.flatMap(doc => doc.education_schemes || [])),
      HealthcareService.getAllData().then(data => data.flatMap(doc => doc.healthcare_schemes || [])),
      SocialWelfareService.getAllData().then(data => data.flatMap(doc => doc.social_welfare_schemes || [])),
      TransportService.getAllData().then(data => data.flatMap(doc => doc.transport_and_infrastructure_schemes || [])),
      WomenService.getAllData().then(data => data.flatMap(doc => doc.women_schemes || [])),
    ]);

    const allSchemes = [
      ...agriculture,
      ...education,
      ...healthcare,
      ...socialWelfare,
      ...transport,
      ...women
    ];

    // Prepare prompt for Groq LLM
    const prompt = `
      You are an AI assistant tasked with recommending government schemes based on a user profile and calculating a match score for each scheme. The user profile is: ${JSON.stringify(userProfile)}.
      Here are the available schemes: ${JSON.stringify(allSchemes, null, 2)}.
      
      For each scheme, evaluate its relevance to the user based on their profile (age, gender, state, income, interests, occupation). Assign a match score (0-100) based on how well the scheme matches the user's profile. Consider factors like:
      - Eligibility criteria (e.g., state residency, income level, occupation)
      - Scheme category alignment with user interests
      - Funding amount suitability
      - Application type (individual/group)
      
      Return a JSON array of recommended schemes with their match scores and a brief explanation for each score. Format:
      [
        {
          id: "scheme-id",
          name: "scheme-name",
          matchScore: number,
          explanation: "reason for the score"
        },
        ...
      ]
    `;

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'mixtral-8x7b-32768', // Use an appropriate Groq model
      max_tokens: 4096,
      temperature: 0.7
    });

    let recommendations;
    try {
      recommendations = JSON.parse(completion.choices[0].message.content);
    } catch (parseError) {
      console.error('Error parsing Groq response:', parseError.message);
      throw new Error('Failed to parse recommendation response');
    }

    // Map recommendations to include full scheme details
    const recommendedSchemes = recommendations.map(rec => {
      const scheme = allSchemes.find(s => s.scheme_name === rec.name);
      if (!scheme) return null;
      return {
        id: rec.id || `${scheme.category}-${allSchemes.indexOf(scheme)}`,
        name: scheme.scheme_name,
        provider: scheme.ministry || 'Unknown',
        providerShort: scheme.ministry && typeof scheme.ministry === 'string' && scheme.ministry.includes('Tamil Nadu') ? 'GoTN' : 'GoI',
        category: scheme.category || 'unknown',
        eligibilityScore: rec.matchScore || 80,
        status: scheme.status || 'active',
        deadline: scheme.deadline || '2025-12-31',
        benefits: scheme.benefits || [],
        whySuggested: rec.explanation || `Supports ${scheme.category} initiatives`,
        description: scheme.objectives?.join(' ') || 'No description available',
        applicants: scheme.applicant_count || 1000,
        successRate: scheme.success_rate || 50,
        tags: [scheme.category?.charAt(0).toUpperCase() + scheme.category?.slice(1) || 'Unknown', ...(scheme.objectives || [])],
        fundingAmount: parseFundingAmount(scheme.benefits),
        region: scheme.eligibility_criteria?.includes('Resident of Tamil Nadu') ? 'Tamil Nadu' : 'Pan India',
        applicationType: scheme.eligibility_criteria?.includes('group') ? 'group' : 'individual',
        location: scheme.eligibility_criteria?.includes('Resident of Tamil Nadu') ? 'Tamil Nadu' : 'Pan India',
        eligibility: scheme.eligibility_criteria || [],
        documents: scheme.documents_required || [],
        applicationProcess: scheme.application_process?.steps || [],
        officialLinks: scheme.official_links?.guidelines ? [scheme.official_links.guidelines] : [],
        smartTips: scheme.smart_tips || ['Ensure all documents are valid', 'Apply before deadline'],
        postSubmission: scheme.post_submission || ['Track application status online', 'Contact relevant department'],
        dosAndDonts: scheme.dos_and_donts || ['Do: Submit complete documents', "Don't: Apply if ineligible"]
      };
    }).filter(scheme => scheme !== null);

    res.json(recommendedSchemes);
  } catch (err) {
    console.error('Error generating recommendations:', err.message);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// Helper function to parse funding amount
const parseFundingAmount = (benefits) => {
  if (!benefits) return 0;

  const extractAmount = (value) => {
    if (typeof value === 'string') {
      const match = value.match(/₹([\d,]+)(?:\s*to\s*₹([\d,]+))?/);
      if (match) {
        return parseInt(match[1].replace(/,/g, ''));
      }
    } else if (typeof value === 'object' && value !== null) {
      for (const val of Object.values(value)) {
        const amount = extractAmount(val);
        if (amount) return amount;
      }
    }
    return 0;
  };

  const fields = [
    'loan_amount', 'financial_support', 'subsidy', 'disbursement',
    'scholarship_amount', 'fellowship', 'incentive_amount', 'maintenance_allowance',
    'general_degree', 'professional_engineering', 'medical_bds', 'contingency'
  ];

  for (const field of fields) {
    if (benefits[field]) {
      const amount = extractAmount(benefits[field]);
      if (amount) return amount;
    }
  }

  return 0;
};

// Global error handler
app.use((err, req, res, next) => {
  console.error(`Error at ${req.method} ${req.url}:`, err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});