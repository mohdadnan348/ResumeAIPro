// backend/test-openai.js
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testAPI() {
  try {
    console.log('🔍 Testing OpenAI API...');
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',  // Note: gpt-4o-mini hai, gpt-5.4-mini nahi
      messages: [
        { role: 'user', content: 'Say "API is working!"' }
      ],
    });
    
    console.log('✅ Success!');
    console.log('Response:', completion.choices[0].message.content);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPI();