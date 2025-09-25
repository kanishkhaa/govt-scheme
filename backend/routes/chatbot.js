const express = require('express');
const router = express.Router();
const { Groq } = require('groq-sdk');
const ChatbotService = require('../services/chatbotService');
const axios = require('axios');

// Initialize Groq with API key from environment variable
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Chatbot endpoint
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const query = message.toLowerCase();
    console.log('Query received:', query);

    // Get relevant schemes
    const relevantSchemes = await ChatbotService.getAllRelevantSchemes(query);
    console.log('Schemes from ChatbotService:', relevantSchemes);

    const context = `
You are a helpful assistant for government schemes in India. The user asked: "${message}".

Here are relevant schemes from the dataset:
${JSON.stringify(relevantSchemes, null, 2)}

Format each scheme's details in a clean, readable structure using markdown headers and emojis as follows:

## 🎓 Scheme Name: [scheme_name]

### 🎯 Objectives
- [List each objective]

### 💰 Benefits
- 📚 **General Degree**
  - Scholarships: [value]
  - Academic Fee Limit: [value]
  - Maintenance Charges: [value]
- 🛠️ **Professional Engineering**
  - Scholarships: [value]
  - Academic Fee Limit: [value]
  - Maintenance Charges: [value]
- 🏥 **Medical / BDS**
  - Scholarships: [value]
  - Academic Fee Limit: [value]
  - Maintenance Charges: [value]
- 💸 **Disbursement**: [value]

### ✅ Eligibility Criteria
- [List each eligibility condition]

### 📝 Application Process
1. [Step 1]
2. [Step 2]
3. [Step 3]
...

### 📄 Documents Required
- [List required documents]

### 🔗 Official Links
👉 [guidelines_url]

If only one scheme is found, show it as described above.
If multiple schemes (up to 3) are found, list them under "Top 3 Relevant Schemes:" with each formatted the same.
If no schemes are found, say: "No matching scheme found in the dataset. Please try a different query or category (e.g., education, healthcare)."
`;

    console.log('Context sent to Groq:', context);

    // Query Groq API
    const response = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a knowledgeable assistant about government schemes.' },
        { role: 'user', content: context }
      ],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1000
    });

    const botResponse = response.choices[0].message.content;
    console.log('Groq response:', botResponse);
    res.json({ response: botResponse });
  } catch (error) {
    console.error('Error in chatbot route:', error.message);
    res.status(500).json({ error: 'Error connecting to the server. Please check your connection.' });
  }
});

module.exports = router;
