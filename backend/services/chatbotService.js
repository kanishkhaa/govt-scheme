const EducationService = require('./educationService');
const WomenService = require('./womenService');
const AgricultureService = require('./agricultureService');
const HealthcareService = require('./healthcareService');
const TransportService = require('./transportService');
const SocialWelfareService = require('./socialWelfareService');

class ChatbotService {
  static async getAllRelevantSchemes(query) {
    try {
      const keywords = query.toLowerCase().split(/\s+/);
      const [educationData, womenData, agricultureData, healthcareData, transportData, socialWelfareData] = await Promise.all([
        EducationService.getAllData(),
        WomenService.getAllData(),
        AgricultureService.getAllData(),
        HealthcareService.getAllData(),
        TransportService.getAllData(),
        SocialWelfareService.getAllData()
      ]);

      const allSchemes = [
        ...educationData.flatMap(doc => doc.education_schemes || []),
        ...womenData.flatMap(doc => doc.women_schemes || []),
        ...agricultureData.flatMap(doc => doc.agriculture_schemes || []),
        ...healthcareData.flatMap(doc => doc.healthcare_schemes || []),
        ...transportData.flatMap(doc => doc.transport_schemes || []),
        ...socialWelfareData.flatMap(doc => doc.social_welfare_schemes || [])
      ];

      // Prioritize exact scheme name match
      const exactMatch = allSchemes.find(scheme =>
        scheme.scheme_name.toLowerCase() === query || scheme.scheme_name.toLowerCase().includes(query)
      );
      if (exactMatch) return [exactMatch];

      // Fall back to top 3 relevant schemes
      return allSchemes
        .filter(scheme =>
          keywords.some(keyword =>
            scheme.scheme_name?.toLowerCase().includes(keyword) ||
            scheme.description?.toLowerCase().includes(keyword)
          )
        )
        .slice(0, 3);
    } catch (error) {
      console.error('Error fetching all relevant schemes:', error.message);
      return [];
    }
  }
}

module.exports = ChatbotService;