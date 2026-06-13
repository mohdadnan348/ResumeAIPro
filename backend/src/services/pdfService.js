// backend/src/services/pdfService.js
// PDF text extraction service

const pdfParse = require('pdf-parse');
const { sanitizeText } = require('../utils/helpers');

/**
 * Extract text from PDF buffer
 * @param {Buffer} fileBuffer - PDF file buffer from multer
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromPDF(fileBuffer) {
  try {
    // Validate input
    if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
      throw new Error('Invalid file buffer: PDF data required');
    }

    // Parse PDF with options
    const options = {
      pagerender: renderPage, // Custom page renderer
      max: 0, // No page limit (0 = all pages)
    };

    const data = await pdfParse(fileBuffer, options);
    
    if (!data || !data.text) {
      throw new Error('No text content found in PDF');
    }

    // Clean and sanitize the extracted text
    let cleanedText = data.text;
    
    // Remove excessive whitespace
    cleanedText = cleanedText.replace(/\s+/g, ' ');
    
    // Remove special characters but keep basic punctuation
    cleanedText = cleanedText.replace(/[^\w\s\.,@#\-\(\)\/%]/g, '');
    
    // Sanitize (remove non-printable chars)
    cleanedText = sanitizeText(cleanedText);
    
    // Get metadata
    const metadata = {
      pageCount: data.numpages,
      info: data.info,
    };
    
    console.log(`✅ PDF extracted: ${data.numpages} pages, ${cleanedText.length} characters`);

    return cleanedText;
  } catch (error) {
    console.error('PDF Extraction Error:', error.message);
    throw new Error(`PDF parsing failed: ${error.message}`);
  }
}

/**
 * Custom page renderer for better text extraction
 */
function renderPage(pageData) {
  try {
    const renderOptions = {
      normalizeWhitespace: true,
      disableCombineTextItems: false,
    };
    
    return pageData.getTextContent(renderOptions)
      .then(textContent => {
        let lastY = null;
        let text = '';
        
        for (const item of textContent.items) {
          if (lastY !== item.transform[5] && lastY !== null) {
            text += '\n';
          }
          text += item.str;
          lastY = item.transform[5];
        }
        
        return text;
      });
  } catch (error) {
    console.error('Page render error:', error.message);
    return '';
  }
}

/**
 * Extract specific sections from resume
 * @param {string} text - Full resume text
 * @returns {Object} - Extracted sections
 */
function extractResumeSections(text) {
  const sections = {
    summary: '',
    experience: '',
    education: '',
    skills: '',
    projects: '',
  };
  
  // Try to find common section headers
  const lines = text.split('\n');
  let currentSection = null;
  
  const sectionKeywords = {
    summary: ['summary', 'profile', 'about me', 'objective'],
    experience: ['experience', 'work', 'employment', 'job'],
    education: ['education', 'academic', 'qualification', 'degree'],
    skills: ['skills', 'technical skills', 'core competencies', 'technologies'],
    projects: ['projects', 'portfolio', 'personal projects', 'key projects'],
  };
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Check for section headers
    for (const [section, keywords] of Object.entries(sectionKeywords)) {
      if (keywords.some(keyword => lowerLine.includes(keyword) && line.length < 50)) {
        currentSection = section;
        continue;
      }
    }
    
    // Add content to current section
    if (currentSection && line.trim().length > 0 && !line.match(/^[A-Z\s]{5,}$/)) {
      sections[currentSection] += line + '\n';
    }
  }
  
  return sections;
}

/**
 * Validate if text looks like a resume
 * @param {string} text - Extracted text
 * @returns {boolean} - True if looks like resume
 */
function isValidResume(text) {
  const resumeIndicators = [
    /experience/i,
    /education/i,
    /skills/i,
    /project/i,
    /work/i,
    /summary/i,
    /profile/i,
  ];
  
  let indicatorCount = 0;
  for (const pattern of resumeIndicators) {
    if (pattern.test(text)) {
      indicatorCount++;
    }
  }
  
  // At least 3 resume-like sections should be present
  return indicatorCount >= 3 && text.length > 200;
}

module.exports = {
  extractTextFromPDF,
  extractResumeSections,
  isValidResume,
};