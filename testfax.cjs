console.log('Script starting...');

const axios = require('axios');

// Your credentials
const TELNYX_API_KEY = 'KEY0199A1AA458056E4044CF295AF126BBE_bzdNEC61nU4Dfah8ZvUVVy';
const FROM_NUMBER = '+16572362242';
const CONNECTION_ID = '2796875921846437657';

async function sendTestFax() {
  console.log('Preparing to send fax...');
  
  try {
    console.log('Sending fax using public PDF URL...');
    
    // Using a public test PDF from the internet
    const faxData = {
      connection_id: CONNECTION_ID,
      to: '+18884732963',  // HP Test fax
      from: FROM_NUMBER,
      media_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    };
    
    console.log('Request data:', faxData);
    
    const response = await axios.post('https://api.telnyx.com/v2/faxes', faxData, {
      headers: {
        'Authorization': `Bearer ${TELNYX_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ FAX SENT SUCCESSFULLY!');
    console.log('Fax ID:', response.data.data.id);
    console.log('Status:', response.data.data.status);
    console.log('To:', response.data.data.to);
    console.log('From:', response.data.data.from);
    console.log('\nFull response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    if (error.response) {
      console.error('❌ Error sending fax:');
      console.error('Status:', error.response.status);
      console.error('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('❌ Request error:', error.message);
    }
  }
}

console.log('Calling sendTestFax...');
sendTestFax().then(() => {
  console.log('✅ Test completed');
}).catch(err => {
  console.log('❌ Test failed:', err);
});